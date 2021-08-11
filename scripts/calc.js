let calc =
{
    dot: function(vec1, vec2) {
        // REQUIRES: Inputs are both 1D integer arrays of same positive length
        let res = 0;
        for (let i = 0; i < vec1.length; i++) {
            res += vec1[i] * vec2[i];
        }
        return res;
    },

    crossProduct: function(vec1, vec2) {
        // REQUIRES: Inputs are both 1D integer arrays of length 3
        return [vec1[1] * vec2[2] - vec1[2] * vec2[1],
                vec1[2] * vec2[0] - vec1[0] * vec2[2],
                vec1[0] * vec2[1] - vec1[1] * vec2[0]]
    },

    vecProj: function(vec1, vec2) {
        // REQUIRES: Inputs are both 1D integer arrays of same positive length
        // *** projects vec2 onto vec1
        // *** if in integer mode, special case - must return vector of fracs
        let res = [];
        multBy = calc.dot(vec1, vec2);
        divBy = calc.dot(vec1, vec1);
        for (let i = 0; i < vec1.length; i++) {
            res.push(helper.fracs.simplify([multBy * vec1[i], divBy]));
        }
        return res;
    },

    mtxMult: function(mtx1, mtx2) {
        // REQUIRES: Inputs are valid nonempty matrix representations
        //           for which matrix multiplication is defined.
        let m = mtx1.length;
        let n = mtx1[0].length;
        let p = mtx2[0].length;

        let res = [];
        let tmp = 0;
        for (let i = 0; i < m; i++) {
            res.push([]);
            for (let j = 0; j < p; j++) {
                tmp = 0;
                for (let k =0; k < n; k++)
                    tmp += mtx1[i][k] * mtx2[k][j]
                res[i].push(tmp);
            }
        }

        return res;
    },

    fracMtxMult: function(mtx1, mtx2) {
        // REQUIRES: Inputs are valid nonempty matrix representations
        //           for which matrix multiplication is defined.
        let m = mtx1.length;
        let n = mtx1[0].length;
        let p = mtx2[0].length;

        let res = [];
        let tmp = null;
        for (let i = 0; i < m; i++) {
            res.push([]);
            for (let j = 0; j < p; j++) {
                tmp = [0,1];
                for (let k =0; k < n; k++)
                    tmp = helper.fracs.add(tmp,
                        helper.fracs.multiply(mtx1[i][k], mtx2[k][j]));
                res[i].push(tmp);
            }
        }

        return res;
    },

    luDecomp: function(mtx) {
        // Let A be an n by n invertible matrix. Then A has a pure LU
        // decomp iff all principal leading submatrices of A have full rank.
        // If permutations are allowed, then the matrix
        // just has to be invertible in order to have an LU decomposition.

        let n = mtx.length;
        let cpy = helper.fracs.mtxFracCopy(mtx);
        let L = helper.matrices.fracIdentity(n);        // acts as accumulator
            // you have to multiply new ones coming from the right

        for (let pivRow = 0; pivRow < n; pivRow++) {
            // eliminate everything below the pivot
            for (let currRow = pivRow + 1; currRow < n; currRow++) {
                if (cpy[currRow][pivRow][0] === 0) continue;

                // eliminate it via a row operation
                let posF = 
                    helper.fracs.multiply(cpy[currRow][pivRow],
                    helper.fracs.recip(cpy[pivRow][pivRow]));
                helper.matrices.rowop(
                    cpy, currRow, pivRow, helper.fracs.negate(posF));

                // find the inverse of the elimination matrix corresponding
                // to that row operation; multiply it into the accumulator
                let inv = helper.matrices.fracIdentity(n);
                inv[currRow][pivRow] = posF;
                L = calc.fracMtxMult(L, inv);
            }
        }

        // return the two resulting matrices
        return [L, cpy];
    },

    det: function(mtx, k) {
        // assumes k >= 1 and matrix is valid; i.e. operation is defined
        // the k by k principal submatrix of mtx will be considered
        // uses the cofactor formula with first row

        // TODO make this check rows and columns for zeros too?
        let multiplier = 1; // doing this only works if even row (idxing by 1)

        // base case
        if (k === 1) return mtx[0][0];

        let res = 0;
        for (let col = 0; col < k; col++) {
            // assemble the matrix that doesn't include that column or 1st row,
            // and find its determinant
            let sub = helper.matrices.getSub(mtx, k, 0, col);
            let subdet = calc.det(sub, k - 1);
            res += multiplier * mtx[0][col] * subdet;
            multiplier *= -1;
        }
        return res;
    },

    mtxInverse: function(mtx) {     // matrix must be invertible
        let n = mtx.length;

        // use closed-form formula if matrix is 2 by 2
        if (n == 2) {
            let detRecip = helper.fracs.simplify([1, calc.det(mtx, 2)]);
            let negDetRecip = helper.fracs.multiply([-1,1], detRecip);
            let fracMtx = helper.fracs.mtxFracCopy(mtx);
            return [[helper.fracs.multiply(fracMtx[1][1], detRecip),
                     helper.fracs.multiply(fracMtx[0][1], negDetRecip)  ],
                    [helper.fracs.multiply(fracMtx[1][0], negDetRecip),
                     helper.fracs.multiply(fracMtx[0][0], detRecip)     ]]
        }

        // otherwise, use gauss-jordan
        let cpy = helper.fracs.mtxFracCopy(mtx);
        let inv = helper.matrices.fracIdentity(n);
        for (let pivRow = 0; pivRow < n; pivRow++) {
            // swap rows if pivot is zero
            if (cpy[pivRow][pivRow][0] === 0) {
                let rowToSwap = 0;
                while (cpy[rowToSwap][pivRow][0] === 0) rowToSwap++;
                // since matrix is invertible, we're guaranteed
                // to find a nonzero entry, so this is safe
                helper.matrices.swap(cpy, pivRow, rowToSwap);
                helper.matrices.swap(inv, pivRow, rowToSwap);
            }

            // one-ify the pivot row
            let pivRecip = helper.fracs.recip(cpy[pivRow][pivRow])
            helper.matrices.multrow(cpy, pivRow, pivRecip);
            helper.matrices.multrow(inv, pivRow, pivRecip);
                
            // eliminate below and above
            for (let currRow = pivRow + 1; currRow < n; currRow++) {
                let negCurr = helper.fracs.negate(cpy[currRow][pivRow]);
                if (negCurr[0] !== 0)
                    helper.matrices.rowop(cpy, currRow, pivRow, negCurr);
                    helper.matrices.rowop(inv, currRow, pivRow, negCurr);
            }
            for (let currRow = 0; currRow < pivRow; currRow++) {
                let negCurr = helper.fracs.negate(cpy[currRow][pivRow]);
                if (negCurr[0] !== 0)
                    helper.matrices.rowop(cpy, currRow, pivRow, negCurr);
                    helper.matrices.rowop(inv, currRow, pivRow, negCurr);
            }
        }

        return inv;
    },

    // maybe write different versions of rref for different number types?
    // this would be the integer version
    rref: function(mtx) {
        // general strategy: locate pivot, one-ify pivot row, then eliminate.
        // the choices you have for making computations easier are:
            // choosing when to one-ify. You can do that whenever.
            // swapping rows (unnecessarily). This is not something a human
                // might be able to see.

        let cpy = helper.fracs.mtxFracCopy(mtx);

        pivCol = 0; pivRow = 0;
        while (pivCol < cpy[0].length && pivRow < cpy.length) {
            let pivot = cpy[pivRow][pivCol];

            // make sure pivot is nonzero
            if (pivot[0] === 0) {
                // look for a nonzero under pivot, swap
                // if none, move on to the next column
                let rowToSwap = pivRow + 1;
                while (rowToSwap < cpy.length &&
                       cpy[rowToSwap][pivCol][0] === 0)
                    rowToSwap++;
                if (rowToSwap === cpy.length) {
                    pivCol++; continue;
                }
                else {
                    helper.matrices.swap(cpy, pivRow, rowToSwap);
                }
            }
            
            // one-ify the pivot row
            pivot = cpy[pivRow][pivCol];
            helper.matrices.multrow(cpy, pivRow, helper.fracs.recip(pivot));

            // eliminate the stuff below and above the pivot, skipping zeros
            currRow = pivRow + 1;
            while (currRow < cpy.length) {
                let curr = cpy[currRow][pivCol];
                if (curr[0] !== 0) {
                    helper.matrices.rowop(cpy, currRow, pivRow,
                        helper.fracs.negate(curr));
                }
                currRow++;
            }
            currRow = pivRow - 1;
            while (currRow >= 0) {
                let curr = cpy[currRow][pivCol];
                if (curr[0] !== 0) {
                    helper.matrices.rowop(cpy, currRow, pivRow,
                        helper.fracs.negate(curr));
                }
                currRow--;
            }

            // move on to the next pivot
            pivCol++; pivRow++;
        }

        return cpy;
    },

    derivative: function(e, wrt) {
        // wrt is "with respect to" - e.g. could be "x"


        // e.expr<x> should never appear on its own without a calc.derivative() or
        // Object.assign({}, ) (i.e. shallow copy) around it.
        // you can easily write a recursive deep copy function, but is that necessary?
        
        let res = null;
        
        if (e.type === wrt) {
            res = new exprCstr.constant(1);
        } else if (e.type === "constant" || e.type === "x" || e.type === "y" || e.type === "z") {
            res = new exprCstr.constant(0);
        } else if (e.type === "coeff") {
            res = new exprCstr.coeff(e.constant, calc.derivative(e.expr, wrt));
        } else if (e.type === "sum") {
            res = new exprCstr.sum(calc.derivative(e.expr1, wrt), calc.derivative(e.expr2, wrt));
        } else if (e.type === "product") {
            res = new exprCstr.sum(new exprCstr.product(Object.assign({}, e.expr1), calc.derivative(e.expr2, wrt)),
                                    new exprCstr.product(calc.derivative(e.expr1, wrt), Object.assign({}, e.expr2)));
        } else if (e.type === "quotient") {
            // Fix the fact that it's possible to get quotients that simplify to 1 from this.
            res = new exprCstr.quotient(new exprCstr.sum(new exprCstr.product(Object.assign({}, e.expr2), calc.derivative(e.expr1, wrt)),
                                         new exprCstr.coeff(-1, new exprCstr.product(calc.derivative(e.expr2, wrt), Object.assign({}, e.expr1)))),
                                         new exprCstr.power(Object.assign({}, e.expr2), 2));
        } else if (e.type === "power") {
            res = new exprCstr.product(new exprCstr.coeff(e.constant, new exprCstr.power(Object.assign({}, e.expr), e.constant - 1)), calc.derivative(e.expr, wrt));
        } else if (e.type === "etothe") {
            res = new exprCstr.product(Object.assign({}, e), calc.derivative(e.expr, wrt));
        } else if (e.type === "sin") {
            res = new exprCstr.product(new exprCstr.cos(Object.assign({}, e.expr)), calc.derivative(e.expr, wrt));
        } else if (e.type === "cos") {
            res = new exprCstr.coeff(-1, new exprCstr.product(new exprCstr.sin(Object.assign({}, e.expr)), calc.derivative(e.expr, wrt)));
        } else if (e.type === "tan") {
            res = new exprCstr.product(new exprCstr.power(new exprCstr.sec(Object.assign({}, e.expr)), 2), calc.derivative(e.expr, wrt));
        } else if (e.type === "csc") {
            res = new exprCstr.coeff(-1, new exprCstr.product(new exprCstr.product(new exprCstr.csc(Object.assign({}, e.expr)), new exprCstr.cot(Object.assign({}, e.expr))), calc.derivative(e.expr, wrt)));
        } else if (e.type === "sec") {
            res = new exprCstr.product(new exprCstr.product(new exprCstr.sec(Object.assign({}, e.expr)), new exprCstr.tan(Object.assign({}, e.expr))), calc.derivative(e.expr, wrt));
        } else if (e.type === "cot") {
            res = new exprCstr.coeff(-1, new exprCstr.product(new exprCstr.power(new exprCstr.csc(Object.assign({}, e.expr)), 2), calc.derivative(e.expr, wrt)));
        }

        return helper.expr.simplifyAll(helper.expr.zerosAndOnesAll(res));
    }
}