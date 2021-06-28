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