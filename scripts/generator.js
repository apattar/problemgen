
let settings =
{
    // eventually store settings in local storage?
    // all bounds are inclusive
    min: -5,
    max: 6,
    minDim: 2,
    maxDim: 3,
    computationLevel: "int",  // "frac", "sqrt", "complex" - TODO implement this
    genShortcut: "g",
    solShortcut: "s",
    sbsShortcut: "t",
}


let debugging =
{
    printMtx: function(mtx) {
        let str = "[\n";
        for (let row = 0; row < mtx.length; row++) {
            for (let col = 0; col < mtx[row].length; col++) {
                str += "\t" + mtx[row][col];
            }
            str += "\n"
        }
        console.log(str + "]");



        // let m = mtx.length;
        // let n = mtx[0].length;

        // maxColWidths = [];
        // for (let i = 0; i < n; i++) maxColWidths.push(1);
        
        // // sweep through the matrix once to get the widths
        // for (let i = 0; i < m; i++) {
        //     for (let j = 0; j < n; j++) {
        //         let width = ("" + mtx[i][j]).length;
        //         if (width > maxColWidths[j])
        //             maxColWidths[j] = width;
        //     }
        // }
 
        // // then generate the string
        // let str = "[\n";
        // for (let i = 0; i < m; i++) {
        //     for (let j = 0; j < n; j++) {
        //         let width = ("" + mtx[i][j]).length;
        //         let diff = maxColWidths[j] - width;
        //         for (let k = 0; k < diff; k++) str += " ";
        //         str += mtx[i][j];
        //         str += " ";
        //     }
        //     str += "\n"
        // }
        // str += "]";

        // console.log(str)
    }
}


let helper =
{
    gcd: function(a, b) {
        // REQUIRES: input is 2 POSITIVE integers
        if (a === 0) return b;
        if (b === 0) return a;
        if (a > b)
            return helper.gcd(a % b, b);
        return helper.gcd(a, b % a);
    },

    randint: function(min, max) {
        return min + Math.floor(Math.random() * ((max + 1) - min));
    },

    matrices: {
        identity: function(n) {     // TODO remove?
            let res = [];
            for (let i = 0; i < n; i++) {
                res.push([]);
                for (let j = 0; j < n; j++)
                    res[i].push((i === j) ? 1 : 0);
            }
            return res;
        },

        fracIdentity: function(n) {
            let res = [];
            for (let i = 0; i < n; i++) {
                res.push([]);
                for (let j = 0; j < n; j++)
                    res[i].push((i === j) ? ([1,1]) : ([0,1]));
            }
            return res;
        },

        swap: function(arr, i1, i2) {
            let tmp = arr[i1];
            arr.splice(i1, 1, arr[i2]);
            arr.splice(i2, 1, tmp);
        },

        multrow: function(mtx, row, scaleFactorFrac) {
            for (let col = 0; col < mtx[0].length; col++)
                mtx[row][col] = helper.fracs.multiply(mtx[row][col], scaleFactorFrac);
        },

        rowop: function(mtx, toChange, toAdd, scaleFactorFrac) {
            for (let col = 0; col < mtx[0].length; col++) {
                mtx[toChange][col] = helper.fracs.add(mtx[toChange][col], helper.fracs.multiply(mtx[toAdd][col], scaleFactorFrac));
            }
        },
    
        getSub: function(mtx, n, rowToOmit, colToOmit) {
            let sub = []
            for (let srow = 0; srow < n; srow++) {
                if (srow === rowToOmit) continue;
                sub.push([]);
                for (let scol = 0; scol < n; scol++) {
                    if (scol === colToOmit) continue;
                    sub[sub.length - 1].push(mtx[srow][scol]);
                }
            }
            return sub;
        },
    },

    fracs: {        
        // randCompatibleFracs: function(_amount) {
        //     // want fractions that can easily be added together
        //     // make it so the common denominator isn't too large.
        //     // you can randomly generate the common denom, then get its divisors,
        //     // and generate the denominators from that
        // },

        mtxFracCopy: function(mtx) {
            res = []
            for (let i = 0; i < mtx.length; i++) {
                res.push([]);
                for (let j = 0; j < mtx[0].length; j++) {
                    res[i].push([mtx[i][j],1]);
                }
            }
            return res;
        },
        
        simplify: function(frac) {
            // REQUIRES: frac.length == 2
            if (frac[0] === 0) return [0, 1];
            if (frac[1] < 0) {
                frac[0] *= -1;
                frac[1] *= -1;
            }
            let d = helper.gcd(Math.abs(frac[0]), Math.abs(frac[1]));
            return [frac[0] / d, frac[1] / d];
        },

        add: function(f1, f2) {
            comDenom = f1[1] * f2[1];
            return helper.fracs.simplify([f1[0] * f2[1] + f2[0] * f1[1], comDenom]);
        },

        multiply: function(f1, f2) {
            return helper.fracs.simplify([f1[0] * f2[0], f1[1] * f2[1]]);
        }
    },

    dom: {    
        removeAllChildren: function(node) {
            while (node.firstChild)
                node.removeChild(node.firstChild);
        },
        addHeadersToTable: function(table, lu) {
            let trow = document.createElement("tr");
            let header1 = document.createElement("th");
            let header2 = document.createElement("th");
            header1.append(document.createTextNode("Row Operation"))
            header2.append(document.createTextNode("Matrices"));
            trow.append(header1);
            trow.append(header2);
            if (lu) {
                let header3 = document.createElement("th");
                header3.append(document.createTextNode("" + 
                    "Elimination Matrices"));
                trow.append(header3);
            }
            table.append(trow);
        },
        addText: function(text, onTable, table, div) {
            if (onTable[0]) {
                onTable[0] = false;
                div.append(table);
            }
            let p = document.createElement("p");
            p.append(document.createTextNode(text));
            div.append(p);
        },
        addMtxRow: function(mtxTeX, table, lu) {
            // assumes onTable is true
            row = document.createElement("tr");
            col2 = document.createElement("td");
            col2.append(document.createTextNode(mtxTeX));
            row.append(document.createElement("td"));
            row.append(col2);
            if (lu) row.append(document.createElement("td"));   // TODO I guess you don't need this?
            table.append(row);
        },
        addRowOp: function(rowopTeX, mtxTeX, onTable, table, elimMtxTeX) {
            if (!onTable[0]) {
                onTable[0] = true;
                let oldmtxrow = null;
                if (table !== null) oldmtxrow = table.lastElementChild;
                table = document.createElement("table");
                helper.dom.addHeadersToTable(table);
                if (oldmtxrow) table.append(oldmtxrow.cloneNode(true));
            }
            let row = document.createElement("tr");
            let col1 = document.createElement("td");
            let col2 = document.createElement("td");
            col1.append(document.createTextNode(rowopTeX));
            col2.append(document.createTextNode("\\[\\Bigg\\downarrow\\]"));
            row.append(col1);
            row.append(col2);
            if (elimMtxTeX) {
                let col3 = document.createElement("td");
                col3.append(document.createTextNode(elimMtxTeX));
                row.append(col3);
            }
            table.append(row);
            
            helper.dom.addMtxRow(mtxTeX, table, elimMtxTeX);
        },
    
        addPara: function(div, text) {
            let p = document.createElement("p");
            p.append(document.createTextNode(text));
            div.appendChild(p);
        }
    },
}

let generate =
{
    mtx: function(m, n) {
        // REQUIRES: m and n are strictly positive
        let res = []
        for (let i = 0; i < m; i++) {
            res.push([]);
            for (let j = 0; j < n; j++) {
                res[res.length - 1]
                    .push(helper.randint(settings.min, settings.max));
            }
        }
        return res;
    },

    vec: function(n) {
        // REQUIRES: n is strictly positive
        let res = [];
        for (let i = 0; i < n; i++) {
            res.push(helper.randint(settings.min, settings.max));
        }
        return res;
    }
}


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
        // uses the cofactor formula for the first row

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


let toTeX =
{
    frac: function(frac) {
        // REQUIRES: input is fraction that has been simplified
        // does not include \[\]s
        if (frac[1] == 1) return "" + frac[0];
        if (frac[0] < 0) return "-\\dfrac{" + (-frac[0]) + "}{" + frac[1] + "}"
        return "\\dfrac{" + frac[0] + "}{" + frac[1] + "}";
    },

    fracMtx: function(mtx) {
        // TODO is this used?
        let res = "\\begin{bmatrix}"
        for (let i = 0; i < mtx.length; i++) {
            for (let j = 0; j < mtx[i].length - 1; j++)
                res += toTeX.frac(mtx[i][j]) + "&"
            res += toTeX.frac(mtx[i][mtx[i].length - 1]) + "\\\\"
        }
        return res.slice(0, res.length - 2) + "\\end{bmatrix}"
    },

    fracMtxArr: function (mtxArr) {
        let res = ""
        for (let i = 0; i < mtxArr.length; i++) {
            res += toTeX.fracMtx(mtxArr[i]);
        }
        return res;
    },

    fracMtxWBox: function(mtx, boxRow, boxCol) {
        let res = "\\begin{bmatrix}"
        for (let i = 0; i < mtx.length; i++) {
            for (let j = 0; j < mtx[i].length - 1; j++) {
                if (i === boxRow && j === boxCol)
                    res += "\\fbox{\\(" + toTeX.frac(mtx[i][j]) + "\\)}&";
                else res += toTeX.frac(mtx[i][j]) + "&";
            }
            if (i === boxRow && mtx[i].length - 1 === boxCol) {
                res += "\\fbox{\\(" +
                       toTeX.frac(mtx[i][mtx[i].length - 1]) + "\\)}\\\\";
            } else
                res += toTeX.frac(mtx[i][mtx[i].length - 1]) + "\\\\";
        }
        return res.slice(0, res.length - 2) + "\\end{bmatrix}"
    },

    mtx: function(mtx) {
        // REQUIRES: input is 2D array, nonempty and no empty columns
        let res = "\\begin{bmatrix}"
        for (let i = 0; i < mtx.length; i++) {
            for (let j = 0; j < mtx[i].length - 1; j++)
                res += (mtx[i][j]) + "&"
            res += (mtx[i][mtx[i].length - 1]) + "\\\\"
        }
        return res.slice(0, res.length - 2) + "\\end{bmatrix}"
    },

    vecComma: function(vec) {
        // REQUIRES: input is 1D array with strictly positive length
        let res = "\\langle ";
        for (let i = 0; i < vec.length - 1; i++) {
            res += vec[i] + ", ";
        }
        res += vec[vec.length - 1] + " \\rangle";
        return res;
    },

    vecCol: function(vec) {
        // REQUIRES: input is 1D array with strictly positive length
        let res = "\\begin{bmatrix}"
        for (let i = 0; i < vec.length - 1; i++) {
            res += vec[i] + "\\\\"
        }
        res += vec[vec.length - 1] + "\\end{bmatrix}"
        return res
    }
}



let sbsNode =
{
    crossProduct: function() {        
        let x = activeProb.val1;
        let y = activeProb.val2;

        let text = "We find the cross product as follows:\\begin{align*}";

        text += toTeX.vecComma(activeProb.val1) + " \\times " + toTeX.vecComma(activeProb.val2);
        text += " ~~&=~~ \\begin{vmatrix}\\hat{\\mathbf{i}}&\
            \\hat{\\mathbf{j}}&\\hat{\\mathbf{k}}\\\\"
            + x[0] + "&" + x[1] + "&" + x[2] + "\\\\"
            + y[0] + "&" + y[1] + "&" + y[2] + "\\end{vmatrix}\\\\";
        text += "~~&=~~ \\langle " + "(" + x[1] + ")" + "(" + y[2] + ")" + " - " + "(" + x[2] + ")" + "(" + y[1] + ")" + ",~~ " +
                      "(" + x[2] + ")" + "(" + y[0] + ")" + " - " + "(" + x[0] + ")" + "(" + y[2] + ")" + ",~~ " +
                      "(" + x[0] + ")" + "(" + y[1] + ")" + " - " + "(" + x[1] + ")" + "(" + y[0] + ")" + "\\rangle\\\\";
        text += "~~&=~~ \\langle " + (x[1] * y[2]) + (((x[2] * y[1]) < 0) ? " + " : " - ") + Math.abs(x[2] * y[1]) + ",~~ " +
                        (x[2] * y[0]) + (((x[0] * y[2]) < 0) ? " + " : " - ") + Math.abs(x[0] * y[2]) + ",~~ " +
                        (x[0] * y[1]) + (((x[1] * y[0]) < 0) ? " + " : " - ") + Math.abs(x[1] * y[0]) + "\\rangle\\\\";
        text += "~~&=~~ " + toTeX.vecComma(calc.crossProduct(activeProb.val1, activeProb.val2)) + "\\\\\\\\\\end{align*}";

        text += "To get this expression, we used the following cross product formula:\
        \\[\\left\\langle{}x_1,x_2,x_3\\right\\rangle \\times \
        \\left\\langle{}y_1,y_2,y_3\\right\\rangle = \
        \\left\\langle x_2y_3 - x_3y_2,~~ x_3y_1 - x_1y_3,~~ x_1y_2 - x_2y_1\\right\\rangle\\]\
        As a shortcut, we can derive this formula by thinking of it as the determinant of a matrix,\
        assembled as follows:\
        \\[\\left\\langle{}x_1,x_2,x_3\\right\\rangle \\times \
        \\left\\langle{}y_1,y_2,y_3\\right\\rangle = \
        \\begin{vmatrix}\\hat{\\mathbf{i}}&\
        \\hat{\\mathbf{j}}&\\hat{\\mathbf{k}}\\\\\
        x_1&x_2&x_3\\\\y_1&y_2&y_3\\end{vmatrix}\\]";

        let div = document.createElement("div");
        div.appendChild(document.createTextNode(text));
        return div;
    },

    vecProj: function() {
        let ontoTeX = toTeX.vecComma(activeProb.val1);
        let fromTeX = toTeX.vecComma(activeProb.val2);

        let text = "We first find the following intermediate results in order to use the vector projection formula:\\begin{align*}"
        text += ontoTeX + " \\cdot " + fromTeX + " = "; // TODO insert the dot calculation TeX
        text += "\\end{align*}"
    },

    mtxMult: function() {

    },

    luDecomp: function () {
        let div = document.createElement("div");
        let table = null;
        let onTable = [false];

        helper.dom.addText("In order to find the LU decomposition of the\
                            matrix, we perform the following row operations to\
                            convert the matrix into an upper triangular one,\
                            taking note of the elimination matrices that\
                            correspond to each row operation.\
                            The pivot currently being considered is boxed.",
                            onTable, table, div);
        
        let cpy = helper.fracs.mtxFracCopy(activeProb.val1);
        
        // add the first row to the table
        onTable[0] = true;
        table = document.createElement("table");
        helper.dom.addHeadersToTable(table, true);
        helper.dom.addMtxRow(((cpy[0][0][0] != 0) ? toTeX.fracMtxWBox(cpy, 0, 0)
                             : toTeX.fracMtx(cpy)), table, true);

        let n = cpy.length;
        // let L = helper.matrices.fracIdentity(n);        // acts as accumulator
        //     // you have to multiply new ones coming from the right
        let elims = []  // stores the elimination matrices
                        // in order of application
        let invs = []   // stores the inverses of the matrices in elims

        for (let pivRow = 0; pivRow < n; pivRow++) {
            // eliminate everything below the pivot
            for (let currRow = pivRow + 1; currRow < n; currRow++) {
                if (cpy[currRow][pivRow][0] === 0) continue;

                // eliminate it via a row operation
                let pivot = cpy[pivRow][pivRow];
                let multiplier = helper.fracs.multiply(cpy[currRow][pivRow],
                    helper.fracs.simplify([pivot[1], pivot[0]]));
                let negMultiplier = helper.fracs.multiply([-1,1], multiplier);
                helper.matrices.rowop(cpy, currRow, pivRow, negMultiplier);

                // // find the inverse of the elimination matrix corresponding
                // // to that row operation; multiply it into the accumulator
                let elim = helper.matrices.fracIdentity(n);
                elim[currRow][pivRow] = negMultiplier;
                elims.push(elim);
                let inv = helper.matrices.fracIdentity(n);
                inv[currRow][pivRow] = multiplier;
                invs.push(inv);

                helper.dom.addRowOp("\\[\\text{R}" + (currRow + 1) + 
                    " = \\text{R}" + (currRow + 1) +
                    ((Math.abs(negMultiplier[0]) === 1 && negMultiplier[1] === 1) ?
                    ((negMultiplier[0] === 1) ? " + " : " - ") :
                    (((negMultiplier[0] < 0) ? " - " : " + ") +
                    toTeX.frac([Math.abs(negMultiplier[0]), negMultiplier[1]]))) +
                    "\\text{R}" + (pivRow + 1)
                    + "\\]",
                    toTeX.fracMtxWBox(cpy, pivRow, pivRow),
                    onTable, table, "\\[E_{" + elims.length + "}=" + toTeX.fracMtx(elim) + "\\]");
            }
        }

        helper.dom.addText("We have now produced an upper triangular matrix.\
                        If we call this upper triangular matrix \\(U\\) \
                        and the original matrix \\(A\\), \
                        then we now know that", onTable, table, div);

        let str = "\\begin{align*}";
        for (let i = elims.length; i > 0; i--)
            str += "E_{" + i + "} ";
        str += "A &= U\\\\\\implies ~~~~~~~~~~~~~~~~~ A &= "
        for (let i = 1; i < elims.length + 1; i++)
            str += "E_{" + i + "}^{-1} ";
        str += "U \\end{align*}"

        helper.dom.addText(str, onTable, table, div);

        helper.dom.addText("Thus, we can find \\(L\\) by " +
            ((invs.length > 1) ? "first finding the inverses of \
            the elimination matrices" : "finding the inverse of \
            the elimination matrix") + ", by considering the opposite of \
            the row operation" + ((invs.length > 1) ? "s" : "") + 
            " we performed.", onTable, table, div);

        str = "\\begin{align*}"
        for (let i = 0; i < invs.length; i++) {
            str += "E_{" + (i+1) + "}=" + toTeX.fracMtx(elims[i]) + 
                    "~~&\\implies~~ E_{" + (i+1) + "}^{-1}=" +
                    toTeX.fracMtx(invs[i]) + "\\\\";
        }
        str += "\\end{align*}"
        helper.dom.addText(str, onTable, table, div);

        if (invs.length > 1) {
            helper.dom.addText("We calculate \\(L\\) by multiplying the \
                inverses of the elimination matrices in order, all of which \
                are lower triangular.",
                onTable, table, div);

            str = "\\begin{align*}&" + toTeX.fracMtxArr(invs) + "\\\\";
            while (invs.length > 1) {
                let tmp = calc.fracMtxMult(invs[invs.length-2], invs[invs.length-1]);
                invs.splice(invs.length - 2, 2, tmp);
                str += "=~~ &" + toTeX.fracMtxArr(invs) + "\\\\"
            }
            str += "\\end{align*}"
            helper.dom.addText(str, onTable, table, div);
        }

        helper.dom.addText("Our result is a lower triangular matrix. Thus, \
            our final answer is as follows. We can check our work by \
            multiplying \\(L\\) and \\(U\\) and noting that the result is \
            the original matrix \\(A\\), as expected.", onTable, table, div);

        helper.dom.addText("\\[L=" + toTeX.fracMtx(invs[0]) + 
                           ",~~ U=" + toTeX.fracMtx(cpy) + "\\]",
                           onTable, table, div);

        return div;
        
        // debug and finish this, it's very close to being done
    },

    det: function() {
        let div = document.createElement("div");
        
        let M = activeProb.val1;
        let n = M.length;
        if (n === 2) {
            helper.dom.addPara(div, "We use the formula for \\(2 \\times 2\\) \
            determinants:");
            helper.dom.addPara(div, "\\begin{align*} \\det\\left(" + 
                toTeX.mtx(M) + "\\right) ~~&=~~ (" +
                (M[0][0]) + ")(" + (M[1][1]) + ") - (" +
                (M[0][1]) + ")(" + (M[1][0]) + ")\\\\ &=~~ " +
                (M[0][0] * M[1][1]) + ((M[0][1]*M[1][0] < 0) ? " + " : " - ") +
                Math.abs(M[0][1] * M[1][0]) + 
                "\\\\ &=~~" + calc.det(M, n) + "\\end{align*}");

        } else {
            helper.dom.addPara(div, "We use cofactors, expanding along \
                the " + "first row" + " of the matrix:");
            
            // TODO check all the rows and all the columns to find one with
            // the most zeros, then expand along that one
            let row = 0;    // this will represent the row along which to expand
            let subdets = []   // will store the submatrix determinants,
                               // to prevent too much unnecessary calculation

            // first simplification

            let str = "\\begin{align*} \\det\\left(" + toTeX.mtx(M) +
                "\\right) ~~&=~~~~~~~";
            for (let col = 0; col < n; col++) {
                str += "(-1)^{(" + (row+1) + "+" + (col+1) +
                    ")}(" + M[row][col] + ") \\cdot \\det\\left(";
                let sub = helper.matrices.getSub(M, n, row, col);
                subdets.push(calc.det(sub, n - 1));
                str += toTeX.mtx(sub) + "\\right)\\\\ &~~~~~+~~ ";
            }
            str = str.slice(0, str.length - 13);
            str += "\\end{align*}";
            helper.dom.addPara(div, str);

            // TODO cool exercise:
            // have buttons that you can click to show the step-by-step
            // computations of the recursive determinants
            // one option is to put them both in a container
            // and make them inline
            // have them link to the sbs page and run a script?
            // you could use floats?

            // creates reference to the link. Can't use addPara method
            let p = document.createElement("p");
            let t1 = document.createTextNode("We will omit the \
                calculations of the determinants of each of the submatrices. \
                You can see their step-by-step calculations by plugging them \
                into ");
            let a = document.createElement("a");
            a.appendChild(document.createTextNode("this step-by-step \
                calculator"));
            a.href = "stepbystep.html";  // TODO change this link
            a.setAttribute("target", "_blank");
            let t2 = document.createTextNode(" (clicking the link will open \
                another tab). Continuing to simplify, we get:")
            p.appendChild(t1); p.appendChild(a); p.appendChild(t2);
            div.appendChild(p);
            
            // second simplification

            str = "\\begin{align*}&";
            for (let col = 0; col < n; col++) {
                str += "(" + ((Math.pow(-1,row+col+2)) * M[row][col]) +
                        ")(" + subdets[col] + ") + ";
            }
            str = str.slice(0, str.length - 3) + "\\\\";
            
            // third simplification

            str += " =~~ &";
            for (let col = 0; col < n; col++) {
                str += "(" + (Math.pow(-1,row+col+2)) * M[row][col] * 
                    subdets[col] + ") + ";
            }
            str = str.slice(0, str.length - 2) + "\\\\";

            // fourth simplification
            
            str += " =~~ &" + solText.textContent + "\\\\\\end{align*}";
            helper.dom.addPara(div, str);
        }

        return div;
    },

    mtxInverse: function () {

    },

    rref: function() {
        let div = document.createElement("div");
        let table = null;
        let onTable = [false];

        // addText("Remember that a matrix in reduced row echelon form " +
        //         "must satisfy the following conditions: "

        helper.dom.addText("To put the matrix into reduced row " +
                "echelon form, we perform the following row operations. " +
                "Where applicable, the current pivot being considered \
                is boxed.", onTable, table, div);

        let cpy = helper.fracs.mtxFracCopy(activeProb.val1);
        
        // add the first row to the table
        onTable[0] = true;
        table = document.createElement("table");
        helper.dom.addHeadersToTable(table);
        helper.dom.addMtxRow(((cpy[0][0][0] != 0) ? toTeX.fracMtxWBox(cpy, 0, 0)
                             : toTeX.fracMtx(cpy)), table);
        

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
                
                    helper.matrices.swap(cpy, pivRow, rowToSwap);
                    helper.dom.addRowOp("\\[\\text{Swap } \\text{R}" + (pivRow + 1) +
                             " \\text{ and } \\text{R}" + (rowToSwap + 1) + "\\]",
                             toTeX.fracMtxWBox(cpy, pivRow, pivCol), onTable, table);
            }
            
            pivot = cpy[pivRow][pivCol];
            pivRecip = helper.fracs.simplify([pivot[1], pivot[0]]);
            // one-ify the pivot row
            helper.matrices.multrow(cpy, pivRow, pivRecip);
            helper.dom.addRowOp("\\[\\text{R}" + (pivRow + 1) + " = " +
                     ((pivRecip[0] === 1 && pivRecip[1] === 1) ? "" :
                     toTeX.frac(pivRecip)) + "\\text{R}" + (pivRow + 1) + "\\]",
                     toTeX.fracMtxWBox(cpy, pivRow, pivCol), onTable, table);

            // eliminate the stuff below the pivot, skipping zeros
            currRow = pivRow + 1;
            while (currRow < cpy.length) {
                if (cpy[currRow][pivCol][0] !== 0) {
                    // gotta make it zero, using a row operation
                    let negB = helper.fracs.multiply([-1,1], cpy[currRow][pivCol]);
                    // let scalar = helper.fracs.multiply(negB, pivRecip);
                    helper.matrices.rowop(cpy, currRow, pivRow, negB);
                    helper.dom.addRowOp("\\[\\text{R}" + (currRow + 1) + 
                             " = \\text{R}" + (currRow + 1) +
                             ((Math.abs(negB[0]) === 1 && negB[1] === 1) ?
                             ((negB[0] === 1) ? " + " : " - ") :
                             (((negB[0] < 0) ? " - " : " + ") +
                             toTeX.frac([Math.abs(negB[0]), negB[1]]))) +
                             "\\text{R}" + (pivRow + 1)
                             + "\\]",
                             toTeX.fracMtxWBox(cpy, pivRow, pivCol),
                             onTable, table);
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
                    helper.dom.addRowOp("\\[\\text{R}" + (currRow + 1) + 
                             " = \\text{R}" + (currRow + 1) +
                             ((negB[0] < 0) ? " - " : " + ") +
                             toTeX.frac([Math.abs(negB[0]), negB[1]]) +
                             "\\text{R}" + (pivRow + 1)
                             + "\\]",
                             toTeX.fracMtxWBox(cpy, pivRow, pivCol),
                             onTable, table);
                }
                currRow--;
            }

            // move on to the next pivot
            pivCol++;
            pivRow++;
        }

        if (onTable[0]) {  // in case it ends in a table
            onTable[0] = false;
            div.append(table);
        }
        helper.dom.addText("The matrix is now in reduced row echelon form.",
                            onTable, table, div);
        return div;
    },
}


// main driver

const genButton = document.getElementById("generate-button");
const genText = document.getElementById("problem-text");
const solButton = document.getElementById("solution-button");
const solText = document.getElementById("solution-text");
const sbsButton = document.getElementById("step-by-step-button");
const sbsSection = document.getElementById("sbs-section");

// this object represents the current active problem
let activeProb = {
    type: null,  // will store problem type (camel case)
    val1: null,  // will store first (or only) problem item repr.
    val2: null   // will store second problem item repr. (if applicable)
};

let genAndShow =
{
    crossProduct: function() {
        activeProb.val1 = generate.vec(3);
        activeProb.val2 = generate.vec(3);
        genText.textContent = 
            "\\[" + toTeX.vecComma(activeProb.val1) + " \\times " +
                    toTeX.vecComma(activeProb.val2) + "\\]";
    },

    vecProj: function() {
        let n = helper.randint(settings.minDim, settings.maxDim);
        
        // note, you're projecting val2 onto val1
        // TODO: make sure sum of squares of val1 is a manageable denominator?
        activeProb.val1 = generate.vec(n);
        activeProb.val2 = generate.vec(n);

        genText.textContent =
            '\\[ \\mathrm{proj}_{' + toTeX.vecComma(activeProb.val1) +
            "} " + toTeX.vecComma(activeProb.val2) + "\\]";
    },

    mtxMult: function() {
        let m = helper.randint(settings.minDim, settings.maxDim);
        let n = helper.randint(settings.minDim, settings.maxDim);
        let p = helper.randint(settings.minDim, settings.maxDim);

        activeProb.val1 = generate.mtx(m, n);
        activeProb.val2 = generate.mtx(n, p);

        genText.textContent = 
            "\\[" + toTeX.mtx(activeProb.val1) + 
                    toTeX.mtx(activeProb.val2) + "\\]";
    },

    luDecomp: function() {
        let n = helper.randint(settings.minDim, settings.maxDim);
        
        function works(mtx) {
            // checks all principal leading submatrices for singularity
            for (let k = 1; k <= mtx.length; k++)
                if (calc.det(mtx, k) === 0) return false;
            return true;
        }

        let candidate = generate.mtx(n, n);
        while (!works(candidate)) {
            console.log("Found a matrix for which there does not exist a pure \
                         LU decomposition: " + toTeX.mtx(candidate));
            candidate = generate.mtx(n, n);
        }

        activeProb.val1 = candidate;
        genText.textContent = "\\[" + toTeX.mtx(candidate) + "\\]";
    },

    det: function() {
        let n = helper.randint(settings.minDim, settings.maxDim);
        activeProb.val1 = generate.mtx(n, n);

        genText.textContent = "\\[" + toTeX.mtx(activeProb.val1) + "\\]";
        solText.textContent = "";

        MathJax.typesetClear(genText);
        MathJax.typeset([genText]);
    },

    mtxInverse: function() {genAndShow.det()},   // this has to be actually invertible

    rref: function() {
        // TODO why don't you make it so that a fourth of the time the
        // matrix is singular? The random ones you're generating
        // tend not to be singular.

        // You can test if a matrix is singular by seeing if one of
        // its rows is a multiple of one of the others.

        let m = helper.randint(settings.minDim, settings.maxDim);
        let n = helper.randint(settings.minDim, settings.maxDim);
        activeProb.val1 = generate.mtx(m, n);

        genText.textContent = "\\[" + toTeX.mtx(activeProb.val1) + "\\]";
    },


}


let showSolution =
{
    crossProduct: function() {
        let sol = calc.crossProduct(activeProb.val1, activeProb.val2);
        solText.textContent = "\\[" + toTeX.vecComma(sol) + "\\]";
    },

    vecProj: function() {
        let sol = calc.vecProj(activeProb.val1, activeProb.val2);
        
        let res = "\\[\\bigg\\langle ";
        for (let i = 0; i < sol.length; i++) {
            res += toTeX.frac(sol[i]) + ",";
        }
        res = res.slice(0, res.length - 1) + "\\bigg\\rangle \\]";
        solText.textContent = res;
    },

    mtxMult: function() {
        let sol = calc.mtxMult(activeProb.val1, activeProb.val2);
        solText.textContent = "\\[" + toTeX.mtx(sol) + "\\]";
    },

    luDecomp: function() {
        let decomp = calc.luDecomp(activeProb.val1);
        solText.textContent = "\\[L=" + toTeX.fracMtx(decomp[0]) + 
                              ",~~ U=" + toTeX.fracMtx(decomp[1]) + "\\]"
    },

    det: function() {
        solText.textContent = "\\[" + (calc.det(activeProb.val1, 
            activeProb.val1.length)) + "\\]"
    },

    rref: function() {
        let sol = calc.rref(activeProb.val1);
        solText.textContent = "\\[" + toTeX.fracMtx(sol) + "\\]";
    },
}


// attach event handlers

// generating and solving
genButton.onclick = function() {
    genAndShow[activeProb.type]();
    solText.textContent = "";
    sbsButton.classList.add("inactive");
    helper.dom.removeAllChildren(sbsSection);
    MathJax.typesetClear(genText); MathJax.typeset([genText]);
}
solButton.onclick = function() {
    showSolution[activeProb.type]();
    MathJax.typesetClear(solText); MathJax.typeset([solText]);
    sbsButton.classList.remove("inactive");
}
sbsButton.onclick = function() {
    helper.dom.removeAllChildren(sbsSection);
    sbsSection.appendChild(sbsNode[activeProb.type]());
    MathJax.typesetClear(sbsSection); MathJax.typeset([sbsSection]);
}
window.onkeydown = function(e) {
    switch (e.key) {
        case settings.genShortcut:
            genButton.click();
            break;
        case settings.solShortcut:
            solButton.click();
            break;
        case settings.sbsShortcut:
            solButton.click();
            sbsButton.click();
            break;
    }
}

// sidebar problem type buttons
let titleProbType = document.getElementById("title-problem-type");
let typeButtons = document.querySelectorAll("#problem-type-sidebar button");
typeButtons.forEach(function(b1) {
    b1.onclick = function() {
        if (b1.classList.contains("active")) return;
        typeButtons.forEach(function(b2) {
            b2.classList.remove("active");  // TODO store active one instead?
        });
        b1.classList.add("active");
        activeProb.type = b1.id;
        titleProbType.innerText = b1.innerText;
        genButton.click();
    }
});

// set up first problem, based on first item in list
// TODO this stuff executes only after everything is loaded
// TODO - make this based on local storage somehow?
typeButtons[0].classList.add("active");
activeProb.type = typeButtons[0].id;
titleProbType.innerText = typeButtons[0].innerText;
genButton.click();