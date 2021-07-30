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

    fracMtxArr: function (mtxArr) {
        let res = ""
        for (let i = 0; i < mtxArr.length; i++) {
            res += toTeX.fracMtx(mtxArr[i]);
        }
        return res;
    },

    augFracMtx: function(mtx1, mtx2) {
        let res = "\\[\\left[\\begin{matrix}";
        for (let i = 0; i < mtx1.length; i++) {
            for (let j = 0; j < mtx1[i].length - 1; j++)
                res += toTeX.frac(mtx1[i][j]) + "&"
            res += toTeX.frac(mtx1[i][mtx1[i].length - 1]) + "\\\\";
        }
        res += "\\end{matrix}\\left|\\,\\begin{matrix}";
        for (let i = 0; i < mtx2.length; i++) {
            for (let j = 0; j < mtx2[i].length - 1; j++)
                res += toTeX.frac(mtx2[i][j]) + "&"
            res += toTeX.frac(mtx2[i][mtx2[i].length - 1]) + "\\\\";
        }
        return res + "\\end{matrix}\\right.\\right]\\]";
    },

    fracMtxWBox: function(mtx, boxRow, boxCol) {
        let res = "\\begin{bmatrix}"
        for (let i = 0; i < mtx.length; i++) {
            for (let j = 0; j < mtx[i].length - 1; j++) {
                if (i === boxRow && j === boxCol)
                    res += "\\fbox{\\(" + toTeX.frac(mtx[i][j]) + "\\)}&";
                else res += toTeX.frac(mtx[i][j]) + "&";
            }
            if (i === boxRow && mtx[i].length - 1 === boxCol) {
                res += "\\fbox{\\(" +
                       toTeX.frac(mtx[i][mtx[i].length - 1]) + "\\)}\\\\";
            } else
                res += toTeX.frac(mtx[i][mtx[i].length - 1]) + "\\\\";
        }
        return res.slice(0, res.length - 2) + "\\end{bmatrix}"
    },

    prodSum: function(arr, subtract) {
        res = "";
        for (let i = 0; i < arr.length; i++) {
            res += "("
            for (let j = 0; j < arr[i].length - 1; j++)
                res += arr[i][j] + ")(";
            res += arr[i][arr[i].length - 1] + ")"
            res += ((subtract) ? " - " : " + ");
        }
        return res.slice(0, res.length - 3);
    },

    sum: function(arr) {    // you can multiply numbers by -1 to subtract
        // assumes arr.length >= 1
        if (arr.length === 1) return "(" + arr[0] + ")";
        res = arr[0] + ((arr[1] < 0) ? " - " : " + ");
        for (let i = 1; i < arr.length - 1; i++)
            res += Math.abs(arr[i]) + ((arr[i+1] < 0) ? " - " : " + ");
        return res + Math.abs(arr[arr.length - 1]);
    },

    dot2Steps: function(x, y) {
        let arrStep1 = []
        let arrStep2 = []
        for (let i = 0; i < x.length; i++) {
            arrStep1.push([x[i], y[i]]);
            arrStep2.push(x[i]*y[i]);
        }
        return [toTeX.prodSum(arrStep1), toTeX.sum(arrStep2)];
    },

    rowop: function(modifiedRow, modifierRow, coeffFrac) {
        let res = "\\text{R}" + (modifiedRow + 1); res += "=" + res;
        let coeffTeX = toTeX.frac(coeffFrac);
        if (coeffTeX === "1") res += "+";
        else if (coeffTeX === "-1") res += "-";
        else res += ((coeffTeX[0] === "-") ? "" : "+") + coeffTeX;
        return res + "\\text{R}" + (modifierRow + 1);
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
    },


    expr: function(e) {
        // converts an equation object to LaTeX, recursively
        // this should be able to be relied on for any expression, even if
        // it isn't simplified. First order of business, nested coefficients.
        if (e.type === "x") {
            return "x";
        } else if (e.type === "y") {
            return "y";
        } else if (e.type === "z") {
            return "z";
        } else if (e.type === "constant") {
            return e.constant.toString();
        } else if (e.type === "coeff") {
            if ("x y z product power etothe".split(" ").concat(trigFns).includes(e.expr.type)) {
                return e.constant.toString() + "{" + toTeX.expr(e.expr) + "}";
            } else return e.constant.toString() + "\\left( " +
                          toTeX.expr(e.expr) + " \\right)";
        } else if (e.type === "sum") {
            let expr1TeX = "{" + toTeX.expr(e.expr1) + "}";
            let retval = helper.expr.isNegative(e.expr2);
            if (retval === null) {
                return "{" + toTeX.expr(e.expr1) + "} + {" + toTeX.expr(e.expr2) + "}";
            } else {
                return "{" + toTeX.expr(e.expr1) + "} - {" + toTeX.expr(retval) + "}";
            }
        } else if (e.type === "product") {  // product always has parens
            return "\\left(" + toTeX.expr(e.expr1) + "\\right)\\left(" + toTeX.expr(e.expr2) + "\\right)";
        } else if (e.type === "quotient") {
            return "\\dfrac{" + toTeX.expr(e.expr1) + "}{" + toTeX.expr(e.expr2) + "}";
        } else if (e.type === "power") {
            return "{\\left(" + toTeX.expr(e.expr) + "\\right)}^{" + e.constant + "}";
        } else if (e.type === "etothe") {
            if (e.expr.type === "constant" && e.expr.constant === 1) return "e";
            if ("x y z constant product".split(" ").concat(trigFns).includes(e.expr.type)) {
                return "e^{" + toTeX.expr(e.expr) + "}";
            } else return "e^{\\left(" + toTeX.expr(e.expr) + "\\right)}";
        } else { // is a trig function
            return "\\" + e.type + "\\left(" + toTeX.expr(e.expr) + "\\right)";
        }
    }
}