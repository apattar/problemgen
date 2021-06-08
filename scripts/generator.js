
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
        if (frac[0] < 0 && frac[1] < 0) {
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
    }
}


let toTeX =
{
    frac: function(frac) {
        // REQUIRES: input is fraction
        if (frac[1] == 1) return "" + frac[0];
        return "\\dfrac{" + frac[0] + "}{" + frac[1] + "}";
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
        solText.textContent = "";

        MathJax.typesetClear(genText);
        MathJax.typeset([genText]);
    },

    vecProj: function() {
        let n = helper.randint(settings.minDim, settings.maxDim);
        
        // note, you're projecting val2 onto val1
        // TODO: make sure sum of squares of val1 is a manageable denominator
        activeProb.val1 = generate.vec(n);
        activeProb.val2 = generate.vec(n);

        genText.textContent =
            '\\[ \\mathrm{proj}_{' + toTeX.vecComma(activeProb.val1) +
            "} " + toTeX.vecComma(activeProb.val2) + "\\]";
        solText.textContent = "";

        MathJax.typesetClear(genText);
        MathJax.typeset([genText]);
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
        solText.textContent = "";

        MathJax.typesetClear(genText);
        MathJax.typeset([genText]);
    },

    luDecomp: function() {
        genText.textContent = "unimplemented"
    }
}


let showSolution =
{
    crossProduct: function() {
        let sol = calc.crossProduct(activeProb.val1, activeProb.val2);
        solText.textContent = "\\[" + toTeX.vecComma(sol) + "\\]";

        MathJax.typesetClear(solText);
        MathJax.typeset([solText]);
    },

    vecProj: function() {
        let sol = calc.vecProj(activeProb.val1, activeProb.val2);
        
        let res = "\\[\\bigg\\langle ";
        for (let i = 0; i < sol.length; i++) {
            res += toTeX.frac(sol[i]) + ",";
        }
        res = res.slice(0, res.length - 1) + "\\bigg\\rangle \\]";
        solText.textContent = res;

        MathJax.typesetClear(solText);
        MathJax.typeset([solText]);
    },

    mtxMult: function() {
        let sol = calc.mtxMult(activeProb.val1, activeProb.val2);
        solText.textContent = "\\[" + toTeX.mtx(sol) + "\\]";

        MathJax.typesetClear(solText);
        MathJax.typeset([solText]);
    }
}


// attach event handlers

// generating and solving
genButton.onclick = function() {genAndShow[activeProb.type]();}
solButton.onclick = function() {showSolution[activeProb.type]();}
window.onkeydown = function(e) {
    switch (e.key) {
        case settings.genShortcut:
            genAndShow[activeProb.type]();
            break;
        case settings.solShortcut:
            showSolution[activeProb.type]();
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
        genAndShow[activeProb.type]();
    }
});

// set up first problem, based on first item in list
// TODO this stuff executes only after everything is loaded
// TODO - make this based on local storage somehow?
typeButtons[0].classList.add("active");
activeProb.type = typeButtons[0].id;
titleProbType.innerText = typeButtons[0].innerText;
genAndShow[activeProb.type]();