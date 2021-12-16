// storage location to read in the active problem
let activeProb = {
    type: null,
    val1: null,
    val2: null,
}

// create functions that set up inputs and instructions for each problem type
let vecInputs = document.querySelectorAll(".vec-input");
let matrixInputs = document.querySelectorAll(".mtx-input");
let instructionsPara = document.getElementById("instructions");
function switchToMatrix(instructions) {
    vecInputs.forEach(function(element) {
        if (!element.classList.contains("hidden")) element.classList.add("hidden");
    });
    matrixInputs.forEach(function(element) {
        if (element.classList.contains("hidden")) element.classList.remove("hidden");
    });
    instructionsPara.textContent = instructions;
    MathJax.typesetClear(instructionsPara); MathJax.typeset([instructionsPara]);
}
function switchToVectors(instructions) {
    vecInputs.forEach(function(element) {
        if (element.classList.contains("hidden")) element.classList.remove("hidden");
    });
    matrixInputs.forEach(function(element) {
        if (!element.classList.contains("hidden")) element.classList.add("hidden");
    });
    instructionsPara.textContent = instructions;
    MathJax.typesetClear(instructionsPara); MathJax.typeset([instructionsPara]);
}
prepareInputs = {
    crossProduct: function() {
        switchToVectors("Click \"Go\" to show a step-by-step calculation of " +
                        "\\(\\vec{a} \\times \\vec{b}\\).");
    },
    vecProj: function() {
        switchToVectors("Click \"Go\" to show a step-by-step calculation of " +
                        "\\(\\mathrm{proj}_{\\vec{a}}\\vec{b}\\).");
    },
    mtxMult: function() {
        switchToMatrix("Enter the first multiplicand matrix above, then click \"Next\".");
    },
    luDecomp: function() {
        switchToMatrix("Enter an invertible square matrix above, then click \"Go\" " +
                       "to show a step-by-step calculation of its LU decomposition.");
    },
    det: function() {
        switchToMatrix("Enter a square matrix above, then click \"Go\" to show " +
                       "a step-by-step calculation of its determinant.");
    },
    mtxInverse: function() {
        switchToMatrix("Enter an invertible square matrix above, then click \"Go\" " +
                       "to show a step-by-step calculation of its inverse.");
    },
    rref: function() {
        switchToMatrix("Enter a matrix above, then click \"Go\" to show " +
                       "a step-by-step calculation of its reduced row echelon form.")
    }
}

// create functions that run when the "Go" button is pressed
function retrieveVectors() {
    let v11 = parseInt(document.getElementById("vec-input-11").value);
    let v12 = parseInt(document.getElementById("vec-input-12").value);
    let v13 = parseInt(document.getElementById("vec-input-13").value);
    let v21 = parseInt(document.getElementById("vec-input-21").value);
    let v22 = parseInt(document.getElementById("vec-input-22").value);
    let v23 = parseInt(document.getElementById("vec-input-23").value);
    activeProb.val1 = [
        Number.isNaN(v11) ? 0 : v11,
        Number.isNaN(v12) ? 0 : v12,
        Number.isNaN(v13) ? 0 : v13
    ];
    activeProb.val2 = [
        Number.isNaN(v21) ? 0 : v21,
        Number.isNaN(v22) ? 0 : v22,
        Number.isNaN(v23) ? 0 : v23
    ];
}
let sbsSection = document.getElementById("sbs-section");
function displaySbs() {
    sbsSection.style.display = "block";
    helper.dom.removeAllChildren(sbsSection);
    sbsSection.appendChild(sbsNode[activeProb.type]());
    MathJax.typesetClear(sbsSection); MathJax.typeset([sbsSection]);
}
goAction = {
    crossProduct: function() {
        retrieveVectors();
        displaySbs();
    },
    vecProj: function() {

    }
}

// sidebar problem type buttons
let typeButtons = document.querySelectorAll("#problem-type-sidebar button");
let goButton = document.getElementById("go");
typeButtons.forEach(function(b1) {
    b1.onclick = function() {
        if (b1.classList.contains("active")) return;
        typeButtons.forEach(function(b2) {
            b2.classList.remove("active");
        });
        b1.classList.add("active");
        activeProb.type = b1.id;
        activeProb.val1 = null; // remove if unnecessary
        activeProb.val2 = null;
        helper.dom.removeAllChildren(sbsSection);
        sbsSection.style.display = "none";
        prepareInputs[b1.id]();
        goButton.onclick = goAction[activeProb.type];
    }
});
activeProb.type = typeButtons[0].id;
goButton.onclick = goAction.crossProduct;
typeButtons[0].classList.add("active");