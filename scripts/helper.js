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
        rearrange: function(e) {
            // I think the end result is that this function isn't necessary.
            // Because the rules are either obvious cosmetic changes that are enough to just put in the constructors so they can be relied on,
            // or they can just be handled for in simplify.

            // puts expressions into a more uniform format, so they can
            // be more easily simplified.
            // if no rearranging was performed, returns null; otherwise, returns
            // the rearranged expression.

            // REARRANGING RULES (these only change the look of expressions, but they do change look, so they're important!)
            // these should all be applied at once, w/ text "rearranging"
            
            // if exactly one of a product's expressions is a constant, make coeff.
            // products should not have coeffs as either of their expressions; move them to the outside. Maybe this isn't necessary? You can just add a clause to the multiplication merging simplification steps to handle this case and merge those two coefficients.
            // quotients? Don't do anything with quotients just yet

            // make sure to always apply recursively!

        },

        zerosAndOnesAll: function(e) {
            // gets rid of special zeros and ones from the outside in
            // (i.e. does outer expression before recursively
            // applying to inner expression) and returns (maybe) modified
            // expression

            if (e.type === "coeff") {
                if (e.constant === 0) return new exprCstr.constant(0);
                else if (e.constant === 1)
                    return helper.expr.zerosAndOnesAll(e.expr);
                else return new exprCstr.coeff(e.constant, helper.expr.zerosAndOnesAll(e.expr));
            } else if (e.type === "sum") {
                // check, then apply to inside, then check again
                if (e.expr1.type === "constant" && e.expr1.constant === 0)
                    return helper.expr.zerosAndOnesAll(e.expr2);
                if (e.expr2.type === "constant" && e.expr2.constant === 0)
                    return helper.expr.zerosAndOnesAll(e.expr1);

                let expr1Simplified = helper.expr.zerosAndOnesAll(e.expr1);
                let expr2Simplified = helper.expr.zerosAndOnesAll(e.expr2);
                
                if (expr1Simplified.type === "constant" && expr1Simplified.constant === 0)
                    return helper.expr.zerosAndOnesAll(expr2Simplified);
                if (expr2Simplified.type === "constant" && expr2Simplified.constant === 0)
                    return helper.expr.zerosAndOnesAll(expr1Simplified);
                
                return new exprCstr.sum(expr1Simplified, expr2Simplified);
            } else if (e.type === "product") {
                // check, then apply to inside, then check again
                if (e.expr1.type === "constant") {
                    // they must both be constants, based on the constructors' properties
                    if (e.expr1.constant === 0 || e.expr2.constant === 0)
                        return new exprCstr.constant(0);
                    if (e.expr1.constant === 1) return e.expr2;  // these are constants, no need to simplify
                    if (e.expr2.constant === 1) return e.expr1;
                }

                let expr1Simplified = helper.expr.zerosAndOnesAll(e.expr1);
                let expr2Simplified = helper.expr.zerosAndOnesAll(e.expr2);
                let newExpr = new exprCstr.product(expr1Simplified, expr2Simplified);

                // just in case the product became a coeff with a zero or one constant:
                if (newExpr.type === "coeff")
                    return helper.expr.zerosAndOnesAll(newExpr);

                if (newExpr.expr1.type === "constant") {
                    // they are both constants
                    if (newExpr.expr1.constant === 0 || newExpr.expr2.constant === 0)
                        return new exprCstr.constant(0);
                    if (newExpr.expr1.constant === 1) return newExpr.expr2;
                    if (newExpr.expr2.constant === 1) return newExpr.expr1;
                }
    
                return newExpr;
            } else if (e.type === "quotient") {
                // check, then apply to inside, then check again
                if (e.expr2.type === "constant" && e.expr2.constant === 1)
                    return helper.expr.zerosAndOnesAll(e.expr1);
                if (e.expr1.type === "constant" && e.expr1.constant === 0)
                    return new exprCstr.constant(0);

                let numSimplified = helper.expr.zerosAndOnesAll(e.expr1);
                let denSimplified = helper.expr.zerosAndOnesAll(e.expr2);

                if (numSimplified.type === "constant" && numSimplified.constant === 0)
                    return new exprCstr.constant(0);
                if (denSimplified.type === "constant" && denSimplified.constant === 1)
                    return helper.expr.zerosAndOnesAll(e.expr1);
                // TODO check for zero denominator? You can easily modify
                // other clauses to simplify the inside so zero denominators will always be caught
                // but it's unnecessary if it's impossible to generate something with a zero denominator
                return new exprCstr.quotient(numSimplified, denSimplified);
            } else if (e.type === "power") {
                if (e.constant === 0) return new exprCstr.constant(1);
                else if (e.constant === 1)
                    return helper.expr.zerosAndOnesAll(e.expr);
                else return new exprCstr.power(helper.expr.zerosAndOnesAll(e.expr), e.constant);
            } else if (e.type === "etothe") {
                // since this is not guaranteed to be a constant, need to check, simplify, then check again
                if (e.expr.type === "constant" && e.expr.constant === 0)
                    return new exprCstr.constant(1);

                let exprSimplified = helper.expr.zerosAndOnesAll(e.expr);

                if (exprSimplified.type === "constant" && exprSimplified.constant === 0)
                    return new exprCstr.constant(1);

                return new exprCstr.etothe(exprSimplified);
            } else if (trigFns.includes(e.type)) {
                // perhaps you can add some of the simple 0 evaluation to this, but for now, just apply recursively
                return new exprCstr[e.type](helper.expr.zerosAndOnesAll(e.expr));
            }

            return e;   // in case of x, y, z, constant, no changes needed, and no need to apply recursively
        },

        zerosAndOnesStep: function(e) {
            // version of above function that only applies one step,
            // returning the new expression along with text describing
            // the simplification that was made.
        },

        simplifyAll: function(e) {
            // what if nothing here can result in an extra zero or one in the wrong place? Then you'll know that
            // you only have to apply zerosAndOnesAll once

            // this function inductively applies a series of rules.
            // i.e. it applies them to interior expressions, then enforces
            // them on the outer expression with the assumption that all
            // interior expressions follow the rules.

            // these functions are just about applying rules. You can change the orders in which the rules are applied all you like.
            // keep this list of rules somewhere

            // MULTIPLICATION MERGING RULES - CONSTANTS
            
            // - coeff types should not be directly nested.
            // - if product is both constants, multiply them.
            // - if product is both coeffs, multiply the coeffs and move them to the outside.
            // - if one of the product exprs is a coeff, move it to the outside.
            // - multiply nested powers
            // - if etothe has power around it, make it a coefficient of the etothe's expression
            
            // MULTIPLICATION MERGING RULES - VARIABLES
            
            // - if a product has two variables of the same type (might be in powers), merge them into a power. Do this even if there are coefficients for either
            // - if a quotient has two variables of the same type (might be powers), subtract the powers into a simplified power or quotient. Do this even if there are coefficients for either
            // if product or quotient has both etothes, do the addition/subtraction

            // ADDITION MERGING RULES - CONSTANTS

            // if a sum has two variables of the same type, make into coeff. Do this even if there are coefficients
            // if a sum has two powers with the same variable and power, make into coeff with power. Do this even if there are coefficients

            // ADDITION MERGING RULES - VARIABLES


            // there are two possible sets of rules for quotients.
            // either add the following rules to the following stages:
            //      (REARRANGE) if there's anything multiplied on the outside of a quotient, move it to the quotient's numerator.
            //      (END OF EVERYTHING) if expression is sum wherein one is quotient, use common denominators to merge everything.
            // or, do this:
            //      (REARRANGE) take everything out of the numerator, and put it into a product or coeff.
            // with no common denominator merging at the end. Alternatively, you can do some sort of test to see if merging would
            // be easy (if they both have the same common denom already, for example), and merge them only in that case
            // or, you could not do anything with the quotients.
            // This could be one of the settings. But you might want to see all three simplifications at once, so there should be a way to do that


            // remember - never modify expressions in-place!
            // there might be other things referencing them
            // you can modify the reference structure though

            if (e.type === "coeff") {
                let innerSimplified = helper.expr.simplifyAll(e.expr);
                if (innerSimplified.type === "coeff") {
                    return new exprCstr.coeff(e.constant * innerSimplified.constant,
                                              innerSimplified.expr);
                // } else if (e.expr.type === "quotient" &&
                //            e.expr.expr1.type === "constant") {
                //     return new exprCstr.quotient(
                //         e.expr.expr1.constant * e.constant, e.expr.expr2);
                } else if (innerSimplified.type === "constant") {
                    // this is necessary since, if this wasn't here, the resulting
                    // product won't be simplified if you just use the constructor
                    return new exprCstr.constant(e.constant * innerSimplified.constant);
                } else return new exprCstr.coeff(e.constant, innerSimplified);
            } else if (e.type === "sum") {
                return new exprCstr.sum(helper.expr.simplifyAll(e.expr1),
                    helper.expr.simplifyAll(e.expr2));
            } else if (e.type === "product") {
                let expr1Simplified = helper.expr.simplifyAll(e.expr1);
                let expr2Simplified = helper.expr.simplifyAll(e.expr2);

                // need to check for both since simplification could have changed things
                if (expr1Simplified.type === "constant" && expr2Simplified.type === "constant")
                    return new exprCstr.constant(expr1Simplified.constant * expr2Simplified.constant);
                
                else if (expr1Simplified.type === "coeff" && expr2Simplified.type === "coeff")
                    return new exprCstr.coeff(expr1Simplified.constant * expr2Simplified.constant,
                            helper.expr.simplifyAll(new exprCstr.product(expr1Simplified.expr, expr2Simplified.expr)));  // need to handle for if these new ones are mergeable


                // move single coefficients to the outside
                else if (expr1Simplified.type === "coeff")
                    return new exprCstr.coeff(expr1Simplified.constant,
                            helper.expr.simplifyAll(new exprCstr.product(expr1Simplified.expr, expr2Simplified)));
                else if (expr2Simplified.type === "coeff")
                    return new exprCstr.coeff(expr2Simplified.constant,
                            helper.expr.simplifyAll(new exprCstr.product(expr1Simplified, expr2Simplified.expr)));


                else if (exprVariables.includes(expr1Simplified.type) && expr1Simplified.type === expr2Simplified.type)
                    // both are the same type of variable
                    return new exprCstr.power(new exprCstr[expr1Simplified.type](), 2);

                else if (exprVariables.includes(expr1Simplified.type) &&
                        (expr2Simplified.type === "power" && expr1Simplified.type === expr2Simplified.expr.type))
                    // first is a variable and second is a power of that variable
                    return new exprCstr.power(new exprCstr[expr1Simplified.type](), 1 + expr2Simplified.constant);
            
                else if (exprVariables.includes(expr2Simplified.type) &&
                        (expr1Simplified.type === "power" && expr2Simplified.type === expr1Simplified.expr.type))
                    // second is a variable and first is a power of that variable
                    return new exprCstr.power(new exprCstr[expr2Simplified.type](), 1 + expr1Simplified.constant);
                
                else if (expr1Simplified.type === "power" && expr2Simplified.type === "power" &&
                            exprVariables.includes(expr1Simplified.expr.type) &&
                            expr1Simplified.expr.type === expr2Simplified.expr.type)
                    // both are powers of the same variable
                    return new exprCstr.power(new exprCstr[expr1Simplified.expr.type](), expr1Simplified.constant + expr2Simplified.constant);

                // using the constructor again will take care of making it a coeff if necessary
                else return new exprCstr.product(expr1Simplified, expr2Simplified);
            } else if (e.type === "quotient") {
                let expr1Simplified = helper.expr.simplifyAll(e.expr1);
                let expr2Simplified = helper.expr.simplifyAll(e.expr2);

                // deal with coeffs and then call recursively on the remaining stuff
                if (expr1Simplified.type === "coeff" || expr2Simplified.type === "coeff") {
                    // extract the coeffs from the main expressions
                    let oldCoeffs = null;
                    let oldMain = null;
                    if (expr1Simplified.type === "coeff" && expr2Simplified.type === "coeff") {
                        oldCoeffs = [expr1Simplified.constant, expr2Simplified.constant];
                        oldMain = new exprCstr.quotient(expr1Simplified.expr, expr2Simplified.expr)
                    } else if (expr1Simplified.type === "coeff") {
                        oldCoeffs = [expr1Simplified.constant, 1];
                        oldMain = new exprCstr.quotient(expr1Simplified.expr, expr2Simplified);
                    } else {
                        oldCoeffs = [expr2Simplified.constant, 1];
                        oldMain = new exprCstr.quotient(expr1Simplified, expr2Simplified.expr);
                    }

                    // recursively call simplify on coeff-less quotient, in case there's variable merging necessary
                    // this could either return a quotient, a constant, or a variable
                    let newMain = helper.expr.simplifyAll(oldMain);

                    // try to simplify the resulting fraction
                    let newCoeffs = helper.fracs.simplify(oldCoeffs);

                    if (newMain.type === "quotient") {
                        // just insert the new coeffs if they're not 1
                        return new exprCstr.quotient((newCoeffs[0] === 1) ? newMain.expr1 : helper.expr.simplifyAll(new exprCstr.coeff(newCoeffs[0], newMain.expr1)),
                                                     (newCoeffs[1] === 1) ? newMain.expr2 : helper.expr.simplifyAll(new exprCstr.coeff(newCoeffs[1], newMain.expr2)));
                    } else if (newCoeffs[1] !== 1) {
                        // need a denominator anyway
                        return new exprCstr.quotient((newCoeffs[0] === 1) ? newMain : helper.expr.simplifyAll(new exprCstr.coeff(newCoeffs[0], newMain)),
                                                     newCoeffs[1]);
                    } else {
                        // no need for a denominator
                        return (newCoeffs[0] === 1) ? newMain : helper.expr.simplifyAll(new exprCstr.coeff(newCoeffs[0], newMain));
                    }   
                }

                else if (exprVariables.includes(expr1Simplified.type) && expr1Simplified.type === expr2Simplified.type)
                    // both are the same type of variable
                    return new exprCstr.constant(1);

                else if (exprVariables.includes(expr1Simplified.type) &&
                        (expr2Simplified.type === "power" && expr1Simplified.type === expr2Simplified.expr.type)) {
                    // first is a variable and second is a power of that variable
                    let newDenomPow = expr2Simplified.constant - 1;
                    if (newDenomPow === 1)
                        return new exprCstr.quotient(new exprCstr.constant(1), new exprCstr[expr1Simplified.type]());
                    else
                        return new exprCstr.quotient(new exprCstr.constant(1),
                                new exprCstr.power(new exprCstr[expr1Simplified.type](), expr2Simplified.constant - 1));
                }


                else if (exprVariables.includes(expr2Simplified.type) &&
                        (expr1Simplified.type === "power" && expr2Simplified.type === expr1Simplified.expr.type)) {
                    // second is a variable and first is a power of that variable
                    let newDenomPow = expr1Simplified.constant - 1;
                    if (newDenomPow === 1)
                        return new exprCstr[expr2Simplified.type]();
                    else
                        return new exprCstr.power(new exprCstr[expr2Simplified.type](), newDenomPow);
                }
                
                else if (expr1Simplified.type === "power" && expr2Simplified.type === "power" &&
                            exprVariables.includes(expr1Simplified.expr.type) &&
                            expr1Simplified.expr.type === expr2Simplified.expr.type) {
                    // both are powers of the same variable
                    let variableName = expr1Simplified.expr.type;
                    let newDenomPow = expr1Simplified.constant - expr2Simplified.constant;
                    if (newDenomPow < -1) {
                        return new exprCstr.quotient(new exprCstr.constant(1), new exprCstr.power(new exprCstr[variableName](), newDenomPow * -1));
                    } else if (newDenomPow === -1) {
                        return new exprCstr.quotient(new exprCstr.constant(1), new exprCstr[variableName]());
                    } else if (newDenomPow === 0) {
                        return new exprCstr.constant(1);
                    } else if (newDenomPow === 1) {
                        return new exprCstr[variableName]();
                    } else {
                        return new exprCstr.power(new exprCstr[variableName](), newDenomPow);
                    }
                }

                else return new exprCstr.quotient(helper.expr.simplifyAll(e.expr1),
                    helper.expr.simplifyAll(e.expr2));
            } else if (e.type === "power") {
                let innerSimplified = helper.expr.simplifyAll(e.expr);
                if (innerSimplified.type === "power")
                    return new exprCstr.power(innerSimplified.expr,
                        innerSimplified.constant * e.constant);
                else if (innerSimplified.type === "etothe")
                    return new exprCstr.etothe(new exprCstr.coeff(e.constant, innerSimplified.expr));
                else return new exprCstr.power(innerSimplified, e.constant);
            } else if (e.type === "etothe") {
                return new exprCstr.etothe(helper.expr.simplifyAll(e.expr));
            } else if (trigFns.includes(e.type)) {
                return new exprCstr[e.type](helper.expr.simplifyAll(e.expr));
            }

            return e;   // this is in the case that e is x, y, z, or a constant
        },
        
        simplifyStep: function(e) { 
            // version of above function that returns one-step simplified expression,
            // as well as text describing the simplification
            // and null if no further simplification is possible
            
        },

        isNegative: function(e) {
            // this function returns null if e is positive
            // or a positive version of e (which will be an expr object) if e is negative.
            // sums are a special case since they aren't one expression; they're considered positive by default.
            if (e.type === "constant" && e.constant < 0) {
                return new exprCstr.constant(e.constant * -1);
            } else if (e.type === "coeff" && e.constant < 0) {
                return new exprCstr.coeff(e.constant * -1, e.expr);
            } else if (e.type === "quotient" && e.expr1.type === "constant" && e.expr1.constant < 0) {  // TODO you can just call isNegative recursively for quotient?
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
            // TODO this is originally intended for debugging, but
            // it might serve as a starting point for a better parser
            // you can work on it to make it accept LaTeX
            // or other unambiguous paren-based input methods
            
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