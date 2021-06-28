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
                let pivot = cpy[pivRow][pivRow];
                let multiplier = helper.fracs.multiply(cpy[currRow][pivRow],
                    helper.fracs.simplify([pivot[1], pivot[0]]));
                helper.matrices.rowop(cpy, currRow, pivRow,
                    helper.fracs.multiply([-1,1], multiplier));

                // find the inverse of the elimination matrix corresponding
                // to that row operation; multiply it into the accumulator
                let inv = helper.matrices.fracIdentity(n);
                inv[currRow][pivRow] = multiplier;
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

    // maybe write different versions of rref for different number types?
    // this would be the integer version
    rref: function(mtx) {
        let cpy = helper.fracs.mtxFracCopy(mtx);

        // general strategy: locate pivot, one-ify pivot row, then eliminate
        // the choices you have for making computations easier are:
            // choosing when to one-ify. You can do that whenever.
            // swapping rows (unnecessarily). This is not something a human might be able to see.

        pivCol = 0; pivRow = 0;
        while (pivCol < cpy[0].length && pivRow < cpy.length) {
            // make sure pivot is nonzero
            if (cpy[pivRow][pivCol][0] === 0) {
                // look for a nonzero under pivot, swap if found.
                // if there are none, move on to the next column

                let rowToSwap = pivRow + 1;
                while (rowToSwap < cpy.length &&
                       cpy[rowToSwap][pivCol][0] === 0)
                    rowToSwap++;
                
                if (rowToSwap === cpy.length) {
                    pivCol++; continue;
                }
                else helper.matrices.swap(cpy, pivRow, rowToSwap);
            }
            
            pivot = cpy[pivRow][pivCol];
            pivRecip = helper.fracs.simplify([pivot[1], pivot[0]]);
            // one-ify the pivot row
            helper.matrices.multrow(cpy, pivRow, pivRecip);

            // solText.textContent += "\\[" + toTeX.fracMtx(cpy) + "\\]\n"

            // eliminate the stuff below the pivot, skipping zeros
            currRow = pivRow + 1;
            while (currRow < cpy.length) {
                if (cpy[currRow][pivCol][0] !== 0) {
                    // gotta make it zero, using a row operation
                    let negB = helper.fracs.multiply([-1,1], cpy[currRow][pivCol]);
                    // let scalar = helper.fracs.multiply(negB, pivRecip);
                    helper.matrices.rowop(cpy, currRow, pivRow, negB);
                }
                currRow++;
            }

            // eliminate the stuff above the pivot, skipping zeros
            currRow = pivRow - 1;
            while (currRow >= 0) {
                if (cpy[currRow][pivCol][0] !== 0) {
                    // gotta make it zero, using a row operation
                    let negB = helper.fracs.multiply([-1,1], cpy[currRow][pivCol]);
                    // let scalar = helper.fracs.multiply(negB, pivRecip);
                    helper.matrices.rowop(cpy, currRow, pivRow, negB);
                }
                currRow--;
            }

            // move on to the next pivot
            pivCol++;
            pivRow++;
            
            // solText.textContent += "\\[" + toTeX.fracMtx(cpy) + "\\]\n"
        }

        return cpy;
    }
}