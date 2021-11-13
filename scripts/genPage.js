
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
        while (!works(candidate)) candidate = generate.mtx(n, n);

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

    mtxInverse: function() {
        let n = helper.randint(settings.minDim, settings.maxDim);

        let candidate = generate.mtx(n, n);
        while (!calc.det(candidate, n)) candidate = generate.mtx(n, n);

        activeProb.val1 = candidate;
        genText.textContent = "\\[" + toTeX.mtx(candidate) + "\\]";
    },

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

    derivative: function() {
        let steps = helper.randint(settings.minDerivSteps, settings.maxDerivSteps);
        activeProb.val1 = generate.expr(steps, ["x"], []);

        genText.textContent = "\\[" + toTeX.expr(activeProb.val1) + "\\]";
    }
}

let showSolution =
{
    crossProduct: function() {
        let sol = calc.crossProduct(activeProb.val1, activeProb.val2);
        solText.textContent = "\\[" + toTeX.vecComma(sol) + "\\]";
    },

    vecProj: function() {
        let sol = calc.vecProj(activeProb.val1, activeProb.val2);
        solText.textContent = "\\[" + toTeX.fracVecComma(sol) + "\\]";
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

    mtxInverse: function() {
        solText.textContent =
            "\\[" + toTeX.fracMtx(calc.mtxInverse(activeProb.val1)) + "\\]"
    },

    rref: function() {
        let sol = calc.rref(activeProb.val1);
        solText.textContent = "\\[" + toTeX.fracMtx(sol) + "\\]";
    },

    derivative: function() {
        let sol = calc.derivative(activeProb.val1, "x");
        solText.textContent = "\\[" + toTeX.expr(sol) + "\\]";
    }
}

let probTypeInstructions =
{
    // TODO add instructions in an associative dict here, like:
    // and then TODO implement them
    crossProduct: "Find the following cross product.",
    vecProj: "Find the following vector projection.",
    mtxMult: "Find the following matrix product.",
    luDecomp: "Find the LU decomposition of the following matrix.",
    det: "Find the determinant of the following matrix.",
    mtxInverse: "Find the inverse of the following matrix, using the Gauss-Jordan method.",
    rref: "Find the reduced row echelon form of the following matrix.",
    derivative: "Find the derivative of the following expression.",
}


// attach event handlers

// generating and solving
genButton.onclick = function() {
    genAndShow[activeProb.type]();
    solText.textContent = "";
    sbsButton.classList.add("inactive");
    helper.dom.removeAllChildren(sbsSection);
    sbsSection.style.display = "none";
    MathJax.typesetClear(genText); MathJax.typeset([genText]);
}
solButton.onclick = function() {
    showSolution[activeProb.type]();
    MathJax.typesetClear(solText); MathJax.typeset([solText]);
    sbsButton.classList.remove("inactive");
}
sbsButton.onclick = function() {
    sbsSection.style.display = "block";
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
let instructions = document.getElementById("instructions");
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
        instructions.innerText = probTypeInstructions[b1.id];
        genButton.click();
    }
});

// settings dialog
let settingsDialogCtnr = document.getElementById("settings-dialog-container");
document.getElementById("change-settings-button").onclick = function() {
    settingsDialogCtnr.classList.remove("inactive");
}
document.getElementById("settings-save-changes-button").onclick = function() {
    // TODO update the settings global variable with changes to settings
    settingsDialogCtnr.classList.add("inactive");
}
document.getElementById("settings-cancel-button").onclick = function() {
    // reset settings controls to their defaults?
    settingsDialogCtnr.classList.add("inactive");
}


// set up first problem, based on first item in list
// TODO this stuff executes only after everything is loaded
// TODO - make this based on local storage somehow?
typeButtons[0].classList.add("active");
activeProb.type = typeButtons[0].id;
titleProbType.innerText = typeButtons[0].innerText;
instructions.innerText = probTypeInstructions[typeButtons[0].id];
genButton.click();