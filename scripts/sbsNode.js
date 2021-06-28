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