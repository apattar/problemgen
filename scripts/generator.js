
let settings =
{
    // all bounds are inclusive
    min: -5,
    max: 6,
    minMtxDim: 2,
    maxMtxDim: 3,
    genShortcut: "g",
    solShortcut: "s"
}



let helper =
{
    randint: function(min, max) {
        return min + Math.floor(Math.random() * ((max + 1) - min));
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
    crossProduct: function(vec1, vec2) {
        // REQUIRES: Inputs are both 1D number arrays of length 3
        return [vec1[1] * vec2[2] - vec1[2] * vec2[1],
                vec1[2] * vec2[0] - vec1[0] * vec2[2],
                vec1[0] * vec2[1] - vec1[1] * vec2[0]]
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
    }
}


let toTeX =
{
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
        res = "\\langle ";
        for (let i = 0; i < vec.length - 1; i++) {
            res += vec[i] + ", ";
        }
        res += vec[vec.length - 1] + " \\rangle";
        return res;
    },

    vecCol: function(vec) {
        // REQUIRES: input is 1D array with strictly positive length
        res = "\\begin{bmatrix}"
        for (let i = 0; i < vec.length - 1; i++) {
            res += vec[i] + "\\\\"
        }
        res += vec[vec.length - 1] + "\\end{bmatrix}"
        return res
    }
}



let sbs =
{
    crossProduct: function(vec1, vec2) {
        // TODO
    }
}


// main driver

const genButton = document.getElementById("generate-button");
const genText = document.getElementById("problem-text");
const solButton = document.getElementById("solution-button");
const solText = document.getElementById("solution-text");

// this object represents the current active problem
let activeProb = {
    type: "crossProduct",  // problem type (camel case)
    val1: generate.vec(3),  // first (or only) problem item repr.
    val2: generate.vec(3)   // second problem item repr. (if applicable)
};


let genAndShow =
{
    crossProduct: function() {
        if (activeProb.type != "crossProduct")  // TODO remove?
            activeProb.type = "crossProduct";

        activeProb.val1 = generate.vec(3);
        activeProb.val2 = generate.vec(3);

        genText.textContent = 
            "\\[" + toTeX.vecComma(activeProb.val1) + " \\times " +
                    toTeX.vecComma(activeProb.val2) + "\\]";
        solText.textContent = "";

        MathJax.typesetClear(genText);
        MathJax.typeset([genText]);
    },

    mtxMult: function() {
        if (activeProb.type != "mtxMult")   // TODO remove?
            activeProb.type = "mtxMult";

        let m = helper.randint(settings.minMtxDim, settings.maxMtxDim);
        let n = helper.randint(settings.minMtxDim, settings.maxMtxDim);
        let p = helper.randint(settings.minMtxDim, settings.maxMtxDim);

        activeProb.val1 = generate.mtx(m, n);
        activeProb.val2 = generate.mtx(n, p);

        genText.textContent = 
            '\\[' + toTeX.mtx(activeProb.val1) + 
                    toTeX.mtx(activeProb.val2) + "\\]";
        solText.textContent = "";

        MathJax.typesetClear(genText);
        MathJax.typeset([genText]);
    }
}


let showSolution =
{
    crossProduct: function() {
        if (activeProb.type != "crossProduct") {    // TODO remove?
            console.error("Problem Type Error: The current active problem is not a cross product.");
            return;
        }

        let sol = calc.crossProduct(activeProb.val1, activeProb.val2);
        solText.textContent = "\\[" + toTeX.vecComma(sol) + "\\]";

        MathJax.typesetClear(solText);
        MathJax.typeset([solText]);
    },

    mtxMult: function() {
        if (activeProb.type != "mtxMult") {    // TODO remove?
            console.error("Problem Type Error: The current active problem is not a matrix multiplication problem.");
            return;
        }

        let sol = calc.mtxMult(activeProb.val1, activeProb.val2);
        solText.textContent = "\\[" + toTeX.mtx(sol) + "\\]";

        MathJax.typesetClear(solText);
        MathJax.typeset([solText]);
    }
}


genButton.onclick = genAndShow.mtxMult;
solButton.onclick = showSolution.mtxMult;
window.onkeydown = function(e) {
    switch (e.key) {
        case settings.genShortcut:
            genAndShow.mtxMult();
            break;
        case settings.solShortcut:
            showSolution.mtxMult();
            break;
    }
}

genAndShow.mtxMult();