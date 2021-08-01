// for utilities that aren't main calculators or generators
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

    randint: function(min, max) {
        return min + Math.floor(Math.random() * ((max + 1) - min));
    },

    matrices: {
        identity: function(n) {     // TODO remove?
            let res = [];
            for (let i = 0; i < n; i++) {
                res.push([]);
                for (let j = 0; j < n; j++)
                    res[i].push((i === j) ? 1 : 0);
            }
            return res;
        },

        fracIdentity: function(n) {
            let res = [];
            for (let i = 0; i < n; i++) {
                res.push([]);
                for (let j = 0; j < n; j++)
                    res[i].push((i === j) ? ([1,1]) : ([0,1]));
            }
            return res;
        },

        swap: function(arr, i1, i2) {
            let tmp = arr[i1];
            arr.splice(i1, 1, arr[i2]);
            arr.splice(i2, 1, tmp);
        },

        multrow: function(mtx, row, scaleFactorFrac) {
            for (let col = 0; col < mtx[0].length; col++)
                mtx[row][col] = helper.fracs.multiply(mtx[row][col], scaleFactorFrac);
        },

        rowop: function(mtx, toChange, toAdd, scaleFactorFrac) {
            for (let col = 0; col < mtx[0].length; col++) {
                mtx[toChange][col] = helper.fracs.add(mtx[toChange][col], helper.fracs.multiply(mtx[toAdd][col], scaleFactorFrac));
            }
        },
    
        getSub: function(mtx, n, rowToOmit, colToOmit) {
            let sub = []
            for (let srow = 0; srow < n; srow++) {
                if (srow === rowToOmit) continue;
                sub.push([]);
                for (let scol = 0; scol < n; scol++) {
                    if (scol === colToOmit) continue;
                    sub[sub.length - 1].push(mtx[srow][scol]);
                }
            }
            return sub;
        },

        isUpperTriangular: function(mtx) {
            for (let i = 0; i < mtx.length; i++)
                for (let j = 0; j < i; j++)
                    if (mtx[i][j]) return false;
            return true;
        },

        // returns the row or col with the most zeros,
        // a boolean value representing if it's a col,
        // and a boolean value representing if they're all zeros
        mostZeros: function(mtx, n) {
            let row0s = {}; let col0s = {};
            for (let i = 0; i < n; i++) {row0s[i] = 0; col0s[i] = 0;}
            let maxRow = 0; maxCol = 0;

            for (let row = 0; row < n; row++)
                for (let col = 0; col < n; col++)
                    if (!mtx[row][col]) {
                        row0s[row]++; col0s[col]++;
                        if (row0s[row] > row0s[maxRow]) maxRow = row;
                        if (col0s[col] > col0s[maxCol]) maxCol = col;
                    }
            
            if (row0s[maxRow] === n) return [maxRow, false, true];
            if (col0s[maxCol] === n) return [maxCol, true, true];
            if (row0s[maxRow] < col0s[maxCol]) return [maxCol, true, false];
            return [maxRow, false, false];
        }
    },

    fracs: {        
        // randCompatibleFracs: function(_amount) {
        //     // want fractions that can easily be added together
        //     // make it so the common denominator isn't too large.
        //     // you can randomly generate the common denom, then get its divisors,
        //     // and generate the denominators from that
        // },

        mtxFracCopy: function(mtx) {
            res = []
            for (let i = 0; i < mtx.length; i++) {
                res.push([]);
                for (let j = 0; j < mtx[0].length; j++) {
                    res[i].push([mtx[i][j],1]);
                }
            }
            return res;
        },
        
        simplify: function(frac) {
            // REQUIRES: frac.length == 2
            if (frac[0] === 0) return [0, 1];
            if (frac[1] < 0) {
                frac[0] *= -1;
                frac[1] *= -1;
            }
            let d = helper.gcd(Math.abs(frac[0]), Math.abs(frac[1]));
            return [frac[0] / d, frac[1] / d];
        },

        add: function(f1, f2) {
            comDenom = f1[1] * f2[1];
            return helper.fracs.simplify([f1[0] * f2[1] + f2[0] * f1[1], comDenom]);
        },

        multiply: function(f1, f2) {
            return helper.fracs.simplify([f1[0] * f2[0], f1[1] * f2[1]]);
        },

        recip: function(frac) {
            return helper.fracs.simplify([frac[1], frac[0]]);
        },

        negate: function(frac) {
            return helper.fracs.multiply([-1,1], frac);
        }
    },

    dom: {    
        removeAllChildren: function(node) {
            while (node.firstChild)
                node.removeChild(node.firstChild);
        },
        addHeadersToTable: function(table, lu) {
            let trow = document.createElement("tr");
            let header1 = document.createElement("th");
            let header2 = document.createElement("th");
            header1.append(document.createTextNode("Row Operation"))
            header2.append(document.createTextNode("Matrices"));
            trow.append(header1);
            trow.append(header2);
            if (lu) {
                let header3 = document.createElement("th");
                header3.append(document.createTextNode("" + 
                    "Elimination Matrices"));
                trow.append(header3);
            }
            table.append(trow);
        },
        addText: function(text, onTable, table, div) {
            if (onTable[0]) {
                onTable[0] = false;
                div.append(table);
            }
            let p = document.createElement("p");
            p.append(document.createTextNode(text));
            div.append(p);
        },
        addMtxRow: function(mtxTeX, table, lu) {
            // assumes onTable is true
            row = document.createElement("tr");
            col2 = document.createElement("td");
            col2.append(document.createTextNode(mtxTeX));
            row.append(document.createElement("td"));
            row.append(col2);
            if (lu) row.append(document.createElement("td"));   // TODO I guess you don't need this?
            table.append(row);
        },
        addRowOp: function(rowopTeX, mtxTeX, onTable, table, elimMtxTeX) {
            if (!onTable[0]) {
                onTable[0] = true;
                let oldmtxrow = null;
                if (table !== null) oldmtxrow = table.lastElementChild;
                table = document.createElement("table");
                helper.dom.addHeadersToTable(table);
                if (oldmtxrow) table.append(oldmtxrow.cloneNode(true));
            }
            let row = document.createElement("tr");
            let col1 = document.createElement("td");
            let col2 = document.createElement("td");
            col1.append(document.createTextNode(rowopTeX));
            col2.append(document.createTextNode("\\[\\Bigg\\downarrow\\]"));
            row.append(col1);
            row.append(col2);
            if (elimMtxTeX) {
                let col3 = document.createElement("td");
                col3.append(document.createTextNode(elimMtxTeX));
                row.append(col3);
            }
            table.append(row);
            
            helper.dom.addMtxRow(mtxTeX, table, elimMtxTeX);
        },
    
        addPara: function(div, text) {
            let p = document.createElement("p");
            p.append(document.createTextNode(text));
            div.appendChild(p);
        }
    },

    expr: {
        mergeMult: function(e) {
            // this function inductively applies a series of rules.
            // i.e. it applies them to interior expressions, then enforces
            // them on the outer expression with the assumption that all
            // interior expressions follow the rules.

            // (1) coeff types should not be directly nested.
            // (2) products should not have either of their expressions as
            //      coeffs or constants.
            // (3) quotients should not have either of their expressions as
            //      coeffs. (Constants are fine, but see next rule)
            // (4) if a coeff type has a quotient inside it whose numerator
            //      is a constant, the coefficient should be merged into it.

            // TODO merge variables too
            // of the same type with the same power.
            // Works by recursively merging all sub-expressions, then
            // doing the merging at top level.

            // remember - never modify expressions in-place!
            // there might be other things referencing them
            // you can modify the reference structure though

            if (e.type === "coeff") {
                helper.expr.mergeMult(e.expr);
                if (e.expr.type === "coeff") {   // (1)
                    return new exprCstr.coeff(e.constant * e.expr.constant,
                                              e.expr.expr);
                } else if (e.expr.type === "quotient" &&
                           e.expr.expr1.type === "constant") {  // (4)
                    return new exprCstr.quotient(
                        e.expr.expr1.constant * e.constant, e.expr.expr2);
                }
            } else if (e.type === "sum") {
                helper.expr.mergeMult(e.expr1);
                helper.expr.mergeMult(e.expr2);
            } else if (e.type === "product") {
                helper.expr.mergeMult(e.expr1);
                helper.expr.mergeMult(e.expr2);

                // (2)
                let coeffAcc = 1;
                if (e.expr1.type === "coeff") {
                    coeffAcc *= e.expr1.constant;
                    e.expr1 = e.expr1.expr;
                }
                if (e.expr2.type === "coeff") {
                    coeffAcc *= e.expr2.constant;
                    e.expr2 = e.expr2.expr;
                }
                if (e.expr1.type === "constant") {
                    coeffAcc *= e.expr1.constant;
                    return (coeffAcc === 1) ? e.expr2 :
                        new exprCstr.coeff(coeffAcc, e.expr2);
                }
                if (e.expr2.type === "constant") {
                    coeffAcc *= e.expr2.constant;
                    return (coeffAcc === 1) ? e.expr1 :
                        new exprCstr.coeff(coeffAcc, e.expr1);
                }
                return (coeffAcc === 1) ? e : new exprCstr.coeff(coeffAcc, e);

            } else if (e.type === "quotient") {
                helper.expr.mergeMult(e.expr1);
                helper.expr.mergeMult(e.expr2);

                // (3)
                let coeffAcc = 1;
                if (e.expr1.type === "coeff") {
                    coeffAcc *= e.expr1.constant;
                    e.expr1 = e.expr1.expr;
                }
                if (e.expr2.type === "coeff") {
                    coeffAcc *= e.expr2.constant;
                    e.expr2 = e.expr2.expr;
                }
                return (coeffAcc === 1) ? e : new exprCstr.coeff(coeffAcc, e);
                
            } else if (e.type === "power") {
                helper.expr.mergeMult(e.expr);
            } else if (e.type === "etothe") {
                helper.expr.mergeMult(e.expr);
            } else if (trigFns.includes(e.type)) {
                helper.expr.mergeMult(e.expr);
            }
        },
        mergePlus: function(e) {

        },

        isNegative: function(e) {
            // this function returns null if e is positive
            // or a positive version of e if e is negative
            if (e.type === "constant" && e.constant < 0) {
                return new exprCstr.constant(e.constant * -1);
            } else if (e.type === "coeff" && e.constant < 0) {
                return new exprCstr.coeff(e.constant * -1, e.expr);
            } else if (e.type === "quotient" && e.expr1.type === "constant" && e.expr1.constant < 0) {
                return new exprCstr.quotient(new exprCstr.constant(e.expr1.constant * -1), e.expr2); 
            } else if (e.type === "quotient" && e.expr1.type === "coeff" && e.expr1.constant < 0) {
                return new exprCstr.quotient(new exprCstr.coeff(e.expr1.constant * -1, e.expr1.expr), e.expr2);
            }
            return null;
        },

        findUnmatchedRDelim: function(delims, str, start) {
            // delims : String, like "{}"
            let count = 0;
            for (let i = start; i < str.length; i++) {
                if (str.charAt(i) === delims.charAt(0)) count++;
                if (str.charAt(i) === delims.charAt(1)) count--;
                if (count < 0) return i;
            }
            return null;
        },

        parse: function(str) {
            // accepts only specific syntax, and returns null on parsing error
            // [] for sum/difference/quotient/power, {} for coeff,
            // () for product, e^{} for etothe

            if (str === "x") return new exprCstr.x();
            else if (str === "y") return new exprCstr.y();
            else if (str === "z") return new exprCstr.z();
            
            // coeff
            else if (str.charAt(0) === "{") {
                let braceIdx = helper.expr.findUnmatchedRDelim("{}", str, 1);
                if (braceIdx === null || braceIdx >= str.length-2 ||
                    str.charAt(braceIdx + 1) !== "{" ||
                    str.charAt(str.length - 1) !== "}") return null;
                let constant = Number.parseInt(str.slice(1, braceIdx));
                let expr = helper.expr.parse(str.slice(braceIdx + 2, str.length - 1));
                if (Number.isNaN(constant) || expr === null) return null;
                return new exprCstr.coeff(constant, expr);
            }

            // product
            else if (str.charAt(0) === "(") {
                let parenIdx = helper.expr.findUnmatchedRDelim("()", str, 1);
                if (parenIdx === null || parenIdx >= str.length-2 ||
                    str.charAt(parenIdx + 1) !== "(" ||
                    str.charAt(str.length - 1) !== ")") return null;
                let expr1 = helper.expr.parse(str.slice(1, parenIdx));
                let expr2 = helper.expr.parse(str.slice(parenIdx + 2, str.length - 1));
                if (expr1 === null || expr2 === null) return null;
                return new exprCstr.product(expr1, expr2);
            }

            // sum, difference, quotient, power
            else if (str.charAt(0) === "[") {
                let brackIdx = helper.expr.findUnmatchedRDelim("[]", str, 1);
                if (brackIdx === null || brackIdx >= str.length-5 ||
                    str.charAt(brackIdx + 1) !== " " ||
                    str.slice(brackIdx + 3, brackIdx + 5) !== " [" ||
                    str.charAt(str.length - 1) !== "]") return null;
                let op = str.charAt(brackIdx + 2);
                let expr1 = helper.expr.parse(str.slice(1, brackIdx));
                if (op === "^") {
                    let constant = Number.parseInt(str.slice(brackIdx + 5, str.length - 1));
                    if (expr1 === null || Number.isNaN(constant)) return null;
                    return new exprCstr.power(expr1, constant);
                }
                let expr2 = helper.expr.parse(str.slice(brackIdx + 5, str.length - 1));
                if (expr1 === null || expr2 === null) return null;
                if (op === "+") {
                    return new exprCstr.sum(expr1, expr2);
                } else if (op === "-") {
                    return new exprCstr.sum(expr1, new exprCstr.coeff(-1, expr2));
                } else if (op === "/") {
                    return new exprCstr.quotient(expr1, expr2);
                } else return null;
            }

            // etothe
            else if (str.length > 3 && str.slice(0, 3) === "e^{") {
                if (str.charAt(str.length - 1) !== "}") return null;
                let expr = helper.expr.parse(str.slice(3, str.length - 1));
                if (expr === null) return null;
                return new exprCstr.etothe(expr);
            }

            // constant
            let match = str.match(/^\-?\d+$/);
            if (match) {
                return new exprCstr.constant(Number.parseInt(str));
            }
            
            // no matches
            else return null;
        },
    },
}