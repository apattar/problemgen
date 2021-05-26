
// helpers

function randint(min, max) {
    return min + Math.floor(Math.random() * ((max + 1) - min));
}   




// representation generators

function randMtx(m, n, min, max) {
    // REQUIRES: m and n are strictly positive, min <= max
    let res = []
    for (let i = 0; i < m; i++) {
        res.push([]);
        for (let j = 0; j < n; j++) {
            res[res.length - 1].push(randint(min, max));
        }
    }
    return res;
}

function randVec(n, min, max) {
    // REQUIRES: n is strictly positive, min <= max
    let res = [];
    for (let i = 0; i < n; i++) {
        res.push(randint(min, max));
    }
    return res;
}




// calculators

function crossProduct(vec1, vec2) {
    // REQUIRES: Inputs are both 1D number arrays of length 3
    return [vec1[1] * vec2[2] - vec1[2] * vec2[1],
            vec1[2] * vec2[0] - vec1[0] * vec2[2],
            vec1[0] * vec2[1] - vec1[1] * vec2[0]]
}





// from representation to TeX

function mtxToTeX(mtx) {
    // REQUIRES: input is 2D array, nonempty and no empty columns
    let res = "\\begin{bmatrix}"
    for (let i = 0; i < mtx.length; i++) {
        for (let j = 0; j < mtx[i].length - 1; j++)
            res += (mtx[i][j]) + "&"
        res += (mtx[i][mtx[i].length - 1]) + "\\\\"
    }
    return res.slice(0, res.length - 2) + "\\end{bmatrix}"
}

function vecToCommaTeX(vec) {
    // REQUIRES: input is 1D array with strictly positive length
    res = "\\langle ";
    for (let i = 0; i < vec.length - 1; i++) {
        res += vec[i] + ", ";
    }
    res += vec[vec.length - 1] + " \\rangle";
    return res;
}

function vecToColumnTeX(vec) {
    // REQUIRES: input is 1D array with strictly positive length
    res = "\\begin{bmatrix}"
    for (let i = 0; i < vec.length - 1; i++) {
        res += vec[i] + "\\\\"
    }
    res += vec[vec.length - 1] + "\\end{bmatrix}"
    return res
}




// step by step TeX

function crossProductSBSTeX(vec1, vec2) {
    // TODO
}



// on page load

$(function() {
    const genButton = $("#generate-button");
    const genPara = $("#generated-content-wrapper p");
    const solButton = $("#solution-button");

    let currProbState = {
        type: "cross product",
        vec1: randVec(3, -5, 9),
        vec2: randVec(3, -5, 9)
    };

    function genCrossProduct() {
        if (currProbState.type != "cross product")
            currProbState.type = "cross product";

        currProbState.vec1 = randVec(3, -5, 9);
        currProbState.vec2 = randVec(3, -5, 9);

        genPara.text("\\[" + vecToCommaTeX(currProbState.vec1) + " \\times " +
                             vecToCommaTeX(currProbState.vec2) + "\\]");
        MathJax.typeset(genPara);
    }

    genButton.click(genCrossProduct);
    genCrossProduct();
});