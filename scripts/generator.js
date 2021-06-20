
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
    solShortcut: "s"
}



let helper =
{
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

    gcd: function(a, b) {
        // REQUIRES: input is 2 POSITIVE integers
        if (a === 0) return b;
        if (b === 0) return a;
        if (a > b)
            return helper.gcd(a % b, b);
        return helper.gcd(a, b % a);
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

    randint: function(min, max) {
        return min + Math.floor(Math.random() * ((max + 1) - min));
    },

    randCompatibleFracs: function(_amount) {
        // make it so the common denominator isn't too large.
        // you can randomly generate the common denom, then get its divisors,
        // and generate the denominators from that
    },

    fracs: {
        add: function(f1, f2) {
            comDenom = f1[1] * f2[1];
            return helper.simplify([f1[0] * f2[1] + f2[0] * f1[1], comDenom]);
        },

        multiply: function(f1, f2) {
            return helper.simplify([f1[0] * f2[0], f1[1] * f2[1]]);
        }
    },

    removeAllChildren: function(node) {
        while (node.firstChild)
            node.removeChild(node.firstChild);
    }
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
            res.push(helper.simplify([multBy * vec1[i], divBy]));
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

    luDecomp: function(mtx) {
        // requires that mtx is square

        // start by locating the pivot
        // while you're locating the pivot is when things can go wrong
        
        // remember that when you swap rows, you have to store
        // that information; it will inform P

        let currPivotCol = 1;
        while (currPivotCol < mtx.length) {
            // eliminate the stuff below the pivot
        }
    },

    // maybe write different versions of rref for different number types?
    // this would be the integer version
    rref: function(mtx) {
        let cpy = helper.mtxFracCopy(mtx);

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
                else helper.swap(cpy, pivRow, rowToSwap);
            }
            
            pivot = cpy[pivRow][pivCol];
            pivRecip = helper.simplify([pivot[1], pivot[0]]);
            // one-ify the pivot row
            helper.multrow(cpy, pivRow, pivRecip);

            // solText.textContent += "\\[" + toTeX.fracMtx(cpy) + "\\]\n"

            // eliminate the stuff below the pivot, skipping zeros
            currRow = pivRow + 1;
            while (currRow < cpy.length) {
                if (cpy[currRow][pivCol][0] !== 0) {
                    // gotta make it zero, using a row operation
                    let negB = helper.fracs.multiply([-1,1], cpy[currRow][pivCol]);
                    // let scalar = helper.fracs.multiply(negB, pivRecip);
                    helper.rowop(cpy, currRow, pivRow, negB);
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
                    helper.rowop(cpy, currRow, pivRow, negB);
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

    fracMtxWBox: function(mtx, boxRow, boxCol) {
        let res = "\\begin{bmatrix}"
        for (let i = 0; i < mtx.length; i++) {
            for (let j = 0; j < mtx[i].length - 1; j++) {
                if (i === boxRow && j === boxCol)
                    res += "\\fbox{" + toTeX.frac(mtx[i][j]) + "}&";
                else res += toTeX.frac(mtx[i][j]) + "&";
            }
            if (i === boxRow && mtx[i].length - 1 === boxCol) {
                res += "\\fbox{" +
                       toTeX.frac(mtx[i][mtx[i].length - 1]) + "}\\\\";
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
        // TODO
    },

    rref: function() {
        let div = document.createElement("div");
        let table = null;
        let onTable = false;

        // if all this stuff ends up only being necessary for rref,
        // which we know it won't...
        // TODO add a "dom" object to helper (and maybe organize it more)
        function addHeadersToTable(table) {
            let trow = document.createElement("tr");
            let header1 = document.createElement("th");
            let header2 = document.createElement("th");
            header1.append(document.createTextNode("Row Operation"))
            header2.append(document.createTextNode("Matrices"));
            trow.append(header1);
            trow.append(header2);
            table.append(trow);
        }
        function addText(text) {
            if (onTable) {
                onTable = false;
                div.append(table);
            }
            let p = document.createElement("p");
            p.append(document.createTextNode(text));
            div.append(p);
        }
        function addMtxRow(mtxTeX) {
            // assumes onTable is true
            row = document.createElement("tr");
            col1 = document.createElement("td");
            col2 = document.createElement("td");
            col2.append(document.createTextNode(mtxTeX));
            row.append(col1);
            row.append(col2);
            table.append(row);
        }
        function addRowOp(rowopTeX, mtxTeX) {
            if (!onTable) {
                onTable = true;
                let oldmtxrow = null;
                if (table !== null) oldmtxrow = table.lastElementChild;
                table = document.createElement("table");
                addHeadersToTable(table);
                if (oldmtxrow) table.append(oldmtxrow.cloneNode(true));
            }
            let row = document.createElement("tr");
            let col1 = document.createElement("td");
            let col2 = document.createElement("td");
            col1.append(document.createTextNode(rowopTeX));
            col2.append(document.createTextNode("\\[\\Bigg\\downarrow\\]"));
            row.append(col1);
            row.append(col2);
            table.append(row);
            
            addMtxRow(mtxTeX);
        }

        // addText("Remember that a matrix in reduced row echelon form " +
        //         "must satisfy the following conditions: "

        addText("To put the matrix into reduced row " +
                "echelon form, we perform the following row operations. " +
                "Where applicable, the current \"pivot\" is boxed.");

        let cpy = helper.mtxFracCopy(activeProb.val1);
        
        // add the first row to the table
        onTable = true;
        table = document.createElement("table");
        addHeadersToTable(table);
        addMtxRow(((cpy[0][0][0] != 0) ? toTeX.fracMtxWBox(cpy, 0, 0)
                                       : toTeX.fracMtx(cpy)));
        

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
                
                    helper.swap(cpy, pivRow, rowToSwap);
                    addRowOp("\\[\\text{Swap } \\text{R}" + (pivRow + 1) +
                             " \\text{ and } \\text{R}" + (rowToSwap + 1) + "\\]",
                             toTeX.fracMtxWBox(cpy, pivRow, pivCol));
            }
            
            pivot = cpy[pivRow][pivCol];
            pivRecip = helper.simplify([pivot[1], pivot[0]]);
            // one-ify the pivot row
            helper.multrow(cpy, pivRow, pivRecip);
            addRowOp("\\[\\text{R}" + (pivRow + 1) + " = " +
                     toTeX.frac(pivRecip) + "\\text{R}" + (pivRow + 1) + "\\]",
                     toTeX.fracMtxWBox(cpy, pivRow, pivCol));

            // eliminate the stuff below the pivot, skipping zeros
            currRow = pivRow + 1;
            while (currRow < cpy.length) {
                if (cpy[currRow][pivCol][0] !== 0) {
                    // gotta make it zero, using a row operation
                    let negB = helper.fracs.multiply([-1,1], cpy[currRow][pivCol]);
                    // let scalar = helper.fracs.multiply(negB, pivRecip);
                    helper.rowop(cpy, currRow, pivRow, negB);
                    addRowOp("\\[\\text{R}" + (currRow + 1) + 
                             " = \\text{R}" + (currRow + 1) +
                             ((negB[0] < 0) ? " - " : " + ") +
                             toTeX.frac([Math.abs(negB[0]), negB[1]]) +
                             "\\text{R}" + (pivRow + 1)
                             + "\\]",
                             toTeX.fracMtxWBox(cpy, pivRow, pivCol));
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
                    helper.rowop(cpy, currRow, pivRow, negB);
                    addRowOp("\\[\\text{R}" + (currRow + 1) + 
                             " = \\text{R}" + (currRow + 1) +
                             ((negB[0] < 0) ? " - " : " + ") +
                             toTeX.frac([Math.abs(negB[0]), negB[1]]) +
                             "\\text{R}" + (pivRow + 1)
                             + "\\]",
                             toTeX.fracMtxWBox(cpy, pivRow, pivCol));
                }
                currRow--;
            }

            // move on to the next pivot
            pivCol++;
            pivRow++;
        }

        if (onTable) {  // TODO necessary?
            onTable = false;
            div.append(table);
        }
        addText("The matrix is now in reduced row echelon form.");
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

let genSqMtx = function() {
    let n = helper.randint(settings.minDim, settings.maxDim);
    activeProb.val1 = generate.mtx(n, n);

    genText.textContent = "\\[" + toTeX.mtx(activeProb.val1) + "\\]";
    solText.textContent = "";

    MathJax.typesetClear(genText);
    MathJax.typeset([genText]);
}

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

    luDecomp: genSqMtx,
    mtxInverse: genSqMtx,

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
    helper.removeAllChildren(sbsSection);
    MathJax.typesetClear(genText); MathJax.typeset([genText]);
}
solButton.onclick = function() {
    showSolution[activeProb.type]();
    MathJax.typesetClear(solText); MathJax.typeset([solText]);
    sbsButton.classList.remove("inactive");
}
sbsButton.onclick = function() {
    helper.removeAllChildren(sbsSection);
    sbsSection.appendChild(sbsNode[activeProb.type]());
    MathJax.typesetClear(sbsSection); MathJax.typeset([sbsSection]);
}
window.onkeydown = function(e) {
    switch (e.key) {
        case settings.genShortcut:
            genButton.click();
            break;
        case settings.solShortcut:
            genButton.click();
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