
let settings =
{
    // eventually store settings in local storage?
    // all bounds are inclusive
    min: -5,
    max: 6,
    minDim: 2,
    maxDim: 3,
    minDerivSteps: 2, // "this corresponds roughly to the number of steps you would need to differentiate an expression."
    maxDerivSteps: 3,
    colorscheme: "light", // | dark | custom - have this be the first thing that loads
    // computationLevel: "int",  // "frac", "sqrt", "complex" - TODO implement this
    genShortcut: "g",
    solShortcut: "s",
    sbsShortcut: "t",
}


let debugging =
{
    printMtx: function(mtx) {
        let str = "[\n";
        for (let row = 0; row < mtx.length; row++) {
            for (let col = 0; col < mtx[row].length; col++) {
                str += "\t" + mtx[row][col];
            }
            str += "\n"
        }
        console.log(str + "]");


        // let m = mtx.length;
        // let n = mtx[0].length;

        // maxColWidths = [];
        // for (let i = 0; i < n; i++) maxColWidths.push(1);
        
        // // sweep through the matrix once to get the widths
        // for (let i = 0; i < m; i++) {
        //     for (let j = 0; j < n; j++) {
        //         let width = ("" + mtx[i][j]).length;
        //         if (width > maxColWidths[j])
        //             maxColWidths[j] = width;
        //     }
        // }
 
        // // then generate the string
        // let str = "[\n";
        // for (let i = 0; i < m; i++) {
        //     for (let j = 0; j < n; j++) {
        //         let width = ("" + mtx[i][j]).length;
        //         let diff = maxColWidths[j] - width;
        //         for (let k = 0; k < diff; k++) str += " ";
        //         str += mtx[i][j];
        //         str += " ";
        //     }
        //     str += "\n"
        // }
        // str += "]";

        // console.log(str)
    }
}
