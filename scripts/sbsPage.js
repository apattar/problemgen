/* This file contains the logic used on the stepbystep.html page */

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
let goButton = document.getElementById("go");
function switchToMatrix(instructions) {
    vecInputs.forEach(function(element) {
        if (!element.classList.contains("hidden")) element.classList.add("hidden");
    });
    matrixInputs.forEach(function(element) {
        if (element.classList.contains("hidden")) element.classList.remove("hidden");
    });
    document.querySelectorAll("input").forEach(function(inputElement) {
        inputElement.value = "";
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
    document.querySelectorAll("input").forEach(function(inputElement) {
        inputElement.value = "";
    });
    instructionsPara.textContent = instructions;
    MathJax.typesetClear(instructionsPara); MathJax.typeset([instructionsPara]);
}
prepareInputs = {
    crossProduct: function() {
        switchToVectors("Click \"Go\" to show a step-by-step calculation of " +
                        "\\(\\vec{a} \\times \\vec{b}\\).");
        goButton.innerHTML = "Go";
    },
    vecProj: function() {
        switchToVectors("Click \"Go\" to show a step-by-step calculation of " +
                        "\\(\\mathrm{proj}_{\\vec{a}}\\vec{b}\\).");
        goButton.innerHTML = "Go";
    },
    mtxMult: function() {
        switchToMatrix("Enter the first multiplicand matrix above, then click \"Next\".");
        goButton.innerHTML = "Next";
    },
    luDecomp: function() {
        switchToMatrix("Enter a square matrix above, then click \"Go\" " +
                       "to show a step-by-step calculation of its LU decomposition. " +
                       "Note that this calculator does not work for all matrices; it " +
                       "unfortunately cannot handle matrices that require row swaps " +
                       "in order to be decomposed.");
        goButton.innerHTML = "Go";
    },
    det: function() {
        switchToMatrix("Enter a square matrix above, then click \"Go\" to show " +
                       "a step-by-step calculation of its determinant.");
        goButton.innerHTML = "Go";
    },
    mtxInverse: function() {
        switchToMatrix("Enter an invertible square matrix above, then click \"Go\" " +
                       "to show a step-by-step calculation of its inverse.");
        goButton.innerHTML = "Go";
    },
    rref: function() {
        switchToMatrix("Enter a matrix above, then click \"Go\" to show " +
                       "a step-by-step calculation of its reduced row echelon form.")
        goButton.innerHTML = "Go";
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
function displayError(message) {
    sbsSection.style.display = "block";
    helper.dom.removeAllChildren(sbsSection);
    errorPara = document.createElement("p");
    errorPara.textContent = "Error: " + message;
    errorPara.style.color = "red";
    sbsSection.appendChild(errorPara);
    MathJax.typesetClear(sbsSection); MathJax.typeset([sbsSection]);
}
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
        retrieveVectors();
        if (helper.vecsEqual(activeProb.val1, [0,0,0]))
            displayError("Vector \\(\\vec{a}\\) cannot be the zero vector.");
        else displaySbs();
    },
    mtxMult: function() {
        if (goButton.innerText === "Next") {
            activeProb.val1 = mwGetMatrix();
            switchToMatrix("You have entered the matrix \\(" + toTeX.mtx(activeProb.val1) + "\\). " + 
                           "Now, enter the second matrix. Make sure to use the correct dimensions. " +
                           "Click \"Go\" to see a step-by-step calculation of the matrices' product.");
            goButton.innerText = "Go";
        } else {
            activeProb.val2 = mwGetMatrix();
            if (activeProb.val1[0].length !== activeProb.val2.length)
                displayError("Since the first matrix had \\(" + activeProb.val1[0].length + "\\) " +
                             "columns, the second matrix must have this number of rows in order " +
                             "for matrix multiplication to be defined.")
            else displaySbs();
        }
    },
    luDecomp: function() {
        activeProb.val1 = mwGetMatrix();
        if (activeProb.val1.length !== activeProb.val1[0].length) {
            displayError("This matrix is not square."); return;
        }
        function works(mtx) {
            if (helper.matrices.isLowerTriangular(mtx)) return true;
            if (helper.matrices.isUpperTriangular(mtx)) return true;
            // checks all principal leading submatrices for singularity
            for (let k = 1; k <= mtx.length; k++)
                if (calc.det(mtx, k) === 0) return false;
            return true;
        }
        if (!works(activeProb.val1)) displayError("This matrix requires row swaps to be decomposed.");
        else displaySbs();
    },
    det: function() {
        activeProb.val1 = mwGetMatrix();
        if (activeProb.val1.length !== activeProb.val1[0].length)
            displayError("This matrix is not square.");
        else displaySbs();
    },
    mtxInverse: function() {
        activeProb.val1 = mwGetMatrix();
        if (activeProb.val1.length !== activeProb.val1[0].length)
            displayError("This matrix is not square.");
        else if (calc.det(activeProb.val1, activeProb.val1.length) === 0)
            displayError("This matrix is not invertible; its determinant is zero.");
        else displaySbs();
    },
    rref: function() {
        activeProb.val1 = mwGetMatrix();
        displaySbs();
    }
}

// sidebar problem type buttons
let typeButtons = document.querySelectorAll("#problem-type-sidebar button");
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