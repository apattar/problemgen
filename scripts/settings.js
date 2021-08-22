
// define some expr-related constants
let exprVariables = ["x", "y", "z"];
let trigFns = ["sin", "cos", "tan", "csc", "sec", "cot"]; // inverse trig?
let exprLV2 = ["sum", "product", "quotient", "power", "etothe", "trig"];
let coeffable = ["product", "power", "etothe"].concat(trigFns);

let settings =
{
    // eventually store settings in local storage?
    // all bounds are inclusive
    min: -5,
    max: 6, // make sure these can't be 0 and 1 -- how about this, if range includes only 0 and 1 nums, just disable coefficients
    minDim: 2,
    maxDim: 3,
    minDerivSteps: 3, // "this corresponds roughly to the number of steps you would need to differentiate an expression."
    maxDerivSteps: 3,

    weights: {},       // every time you update weights, must update the sum with the same difference (i.e. when "Save Changes" is clicked)
    weightsSum: 0,
    trigWeights: {},
    trigWeightsSum: 0,

    colorscheme: "light", // | dark | custom - have this be the first thing that loads
    // computationLevel: "int",  // "frac", "sqrt", "complex" - TODO implement this
    genShortcut: "g",
    solShortcut: "s",
    sbsShortcut: "t",
}

// set all expression and trig expression weights to 1
for (let i = 0; i < exprLV2.length; i++) {
    settings.weights[exprLV2[i]] = 1;
    settings.weightsSum++;
}
for (let i = 0; i < trigFns.length; i++) {
    settings.trigWeights[trigFns[i]] = 1;
    settings.trigWeightsSum++;
}





// debugging stuff

let printMtx = function(mtx) {
    let str = "[\n";
    for (let row = 0; row < mtx.length; row++) {
        for (let col = 0; col < mtx[row].length; col++) {
            str += "\t" + mtx[row][col];
        }
        str += "\n"
    }
    console.log(str + "]");
}