let sbsNode =
{
    crossProduct: function() {        
        let x = activeProb.val1;
        let y = activeProb.val2;

        let text = "We find the cross product as follows:\\begin{align*}";

        text += toTeX.vecComma(x) + " \\times " + toTeX.vecComma(y);
        text += " ~~&=~~ \\begin{vmatrix}\
            \\hat{\\mathbf{i}}&\\hat{\\mathbf{j}}&\\hat{\\mathbf{k}}\\\\"
            + x[0] + "&" + x[1] + "&" + x[2] + "\\\\"
            + y[0] + "&" + y[1] + "&" + y[2] + "\\end{vmatrix}\\\\";
            
        text += "~~&=~~ \\langle " +
            toTeX.prodSum([[x[1], y[2]], [x[2], y[1]]], true) + ",~~ " +
            toTeX.prodSum([[x[2], y[0]], [x[0], y[2]]], true) + ",~~ " +
            toTeX.prodSum([[x[0], y[1]], [x[1], y[0]]], true) + "\\rangle\\\\";
            
        text += "~~&=~~ \\langle " +
            toTeX.sum([x[1] * y[2], -x[2] * y[1]]) + ",~~ " +
            toTeX.sum([x[2] * y[0], -x[0] * y[2]]) + ",~~ " +
            toTeX.sum([x[0] * y[1], -x[1] * y[0]]) + "\\rangle\\\\";
        text += "~~&=~~ " + solText.textContent + "\\end{align*}";

        // // TODO does this really need to be here? If not, remove
        // text += "To get this expression, we used the following cross product formula:\
        // \\[\\left\\langle{}x_1,x_2,x_3\\right\\rangle \\times \
        // \\left\\langle{}y_1,y_2,y_3\\right\\rangle = \
        // \\left\\langle x_2y_3 - x_3y_2,~~ x_3y_1 - x_1y_3,~~ x_1y_2 - x_2y_1\\right\\rangle\\]\
        // As a shortcut, we can derive this formula by thinking of it as the determinant of a matrix,\
        // assembled as follows:\
        // \\[\\left\\langle{}x_1,x_2,x_3\\right\\rangle \\times \
        // \\left\\langle{}y_1,y_2,y_3\\right\\rangle = \
        // \\begin{vmatrix}\\hat{\\mathbf{i}}&\
        // \\hat{\\mathbf{j}}&\\hat{\\mathbf{k}}\\\\\
        // x_1&x_2&x_3\\\\y_1&y_2&y_3\\end{vmatrix}\\]";

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
        let div = document.createElement("div");

        helper.dom.addPara(div, "First, ")
    },

    luDecomp: function () {
        let div = document.createElement("div");

        // handle for if the matrix is already upper triangular
        if (helper.matrices.isUpperTriangular(activeProb.val1)) {
            helper.dom.addPara(div, "Notice that the matrix is already upper \
                triangular. This means that the only possible lower triangular \
                matrix that it can be multiplied by to return itself is the \
                identity matrix, which is shown as \\(L\\) in the solution \
                box.");
            return div;
        }

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

                // store elimination matrix and its inverse
                let elim = helper.matrices.fracIdentity(n);
                elim[currRow][pivRow] = negMultiplier;
                elims.push(elim);
                let inv = helper.matrices.fracIdentity(n);
                inv[currRow][pivRow] = multiplier;
                invs.push(inv);

                helper.dom.addRowOp(
                    "\\[" + toTeX.rowop(currRow, pivRow, negMultiplier) + "\\]",
                    toTeX.fracMtxWBox(cpy, pivRow, pivRow), onTable, table,
                    "\\[E_{" + elims.length + "}=" +
                    toTeX.fracMtx(elim) + "\\]");
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
    },

    det: function() {
        let div = document.createElement("div");
        
        let M = activeProb.val1;
        let n = M.length;
        let zerosInfo = helper.matrices.mostZeros(M, n);
        if (zerosInfo[2]) {
            helper.dom.addPara(div, "Since " +
                (zerosInfo[1] ? "column " : "row ") +
                (zerosInfo[0] + 1) + " of the matrix has all zeros, \
                the determinant of the entire matrix is zero.");
            return div;
        }

        if (n === 2) {
            helper.dom.addPara(div, "We use the formula for \\(2 \\times 2\\) \
            determinants:");
            helper.dom.addPara(div, "\\begin{align*}" +
                "\\det\\left(" + toTeX.mtx(M) + "\\right) ~~&=~~ " +
                toTeX.prodSum([[M[0][0], M[1][1]], [M[0][1], M[1][0]]], true)
                + "\\\\ &=~~ " +
                toTeX.sum([M[0][0]*M[1][1], -M[0][1]*M[1][0]])
                + "\\\\ &=~~" + solText.textContent + "\\end{align*}");

        } else {
            let subdets = []   // will store the submatrix determinants,
                               // to prevent too much unnecessary calculation

            let isCol = zerosInfo[1];
            let expandAlong = zerosInfo[0]
            helper.dom.addPara(div, "We use cofactors, expanding along " +
                (isCol ? "column " : "row ") + (expandAlong + 1) +
                " of the matrix" + ((!isCol && !expandAlong) ? "" :
                " (since it has the most zeros, to simplify the calculation)")
                + ":");

            // first simplification

            let str = "\\begin{align*} \\det\\left(" + toTeX.mtx(M) +
                "\\right) ~~&=~~~~~~~";
            if (isCol) {
                for (let row = 0; row < n; row++) {
                    str += "(-1)^{(" + (row+1) + "+" + (expandAlong+1) +
                        ")}(" + M[row][expandAlong] + ") \\cdot \\det\\left(";
                    let sub = helper.matrices.getSub(M, n, row, expandAlong);
                    subdets.push(calc.det(sub, n - 1));
                    str += toTeX.mtx(sub) + "\\right)\\\\ &~~~~~+~~ ";
                }
            } else {
                for (let col = 0; col < n; col++) {
                    str += "(-1)^{(" + (expandAlong+1) + "+" + (col+1) +
                        ")}(" + M[expandAlong][col] + ") \\cdot \\det\\left(";
                    let sub = helper.matrices.getSub(M, n, expandAlong, col);
                    subdets.push(calc.det(sub, n - 1));
                    str += toTeX.mtx(sub) + "\\right)\\\\ &~~~~~+~~ ";
                }
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
            let prodSumArr = []
            for (let i = 0; i < n; i++) {
                let curr = (isCol) ? M[i][expandAlong] : M[expandAlong][i];
                if (curr)
                    prodSumArr.push([(Math.pow(-1,expandAlong+i+2)) * curr,
                                     subdets[i]]);
                else prodSumArr.push([0]);
            }
            str += toTeX.prodSum(prodSumArr) + "\\\\";
            
            // third simplification

            str += " =~~ &";
            let sumArr = []
            for (let i = 0; i < n; i++) {
                let curr = (isCol) ? M[i][expandAlong] : M[expandAlong][i];
                if (curr)
                    sumArr.push([(Math.pow(-1,expandAlong+i+2)) * curr *
                                 subdets[i]]);
            }
            str += toTeX.sum(sumArr) + "\\\\";

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
        
        pivCol = 0; pivRow = 0;
        while (pivCol < cpy[0].length && pivRow < cpy.length) {
            // make sure pivot is nonzero
            if (cpy[pivRow][pivCol][0] === 0) {
                let rowToSwap = pivRow + 1;
                while (rowToSwap < cpy.length &&
                       cpy[rowToSwap][pivCol][0] === 0)
                    rowToSwap++;
                
                if (rowToSwap === cpy.length) {
                    pivCol++; continue;
                }
                
                helper.matrices.swap(cpy, pivRow, rowToSwap);
                helper.dom.addRowOp("\\[\\text{Swap } \\text{R}" + (pivRow + 1)
                    + " \\text{ and } \\text{R}" + (rowToSwap + 1) + "\\]",
                    toTeX.fracMtxWBox(cpy, pivRow, pivCol), onTable, table);
            }
            
            // one-ify the pivot row
            pivot = cpy[pivRow][pivCol];
            pivRecip = helper.fracs.simplify([pivot[1], pivot[0]]);
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
                    helper.matrices.rowop(cpy, currRow, pivRow, negB);
                    helper.dom.addRowOp(
                        "\\[" + toTeX.rowop(currRow, pivRow, negB) + "\\]",
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
                    helper.matrices.rowop(cpy, currRow, pivRow, negB);
                    helper.dom.addRowOp(
                        "\\[" + toTeX.rowop(currRow, pivRow, negB) + "\\]",
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