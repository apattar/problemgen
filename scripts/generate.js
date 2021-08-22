
// main generator
let generate =
{
    mtx: function(m, n) {
        // REQUIRES: m and n are strictly positive
        let res = []
        for (let i = 0; i < m; i++) {
            res.push([]);
            for (let j = 0; j < n; j++) {
                res[res.length - 1]
                    .push(helper.randint(settings.min, settings.max));
            }
        }
        return res;
    },

    vec: function(n) {
        // REQUIRES: n is strictly positive
        let res = [];
        for (let i = 0; i < n; i++) {
            res.push(helper.randint(settings.min, settings.max));
        }
        return res;
    },


    // let exprLV2 = ["coeff", "sum", "product", "quotient", "power", "etothe", "trig"];

    // there might be a way to guarantee that new levels actually correspond to new steps.
    // Have a way to restrict types at lower levels? Like pass in a list of restricted types?
    // Also have a way to restrict the types for the second expression given the type for the first?

    // make sure that it is impossible to generate an expression that simplifies to zero.

    // I want to make this function more customizable.
    // think about what you want the options to look like. You can let the user assign weights to each of the functions.
    // have a nice explanation of how it works, like "for example, if I assigned cos 2 and power 1, I would be twice as likely to get a cos"
    // but the user doesn't have to make them add up to a certain number, you can handle that in the function.
    // "and you can assign zero to disable it" - have it get greyed out if you assign zero, or something like that
    
    // also, you want to add an arg to expr that specifies something to exclude,
    // but only for reasons of avoiding quotients that simplify to 1 and the like
    // like that would be unrelated to the options thing.
    // make it so that in quotient you generate one expression, see its type, then prevent the next from having the same type
    expr: function(steps, variables, forbiddenFns) {
        // variables argument should be like ["x", "y"]
        // REQUIRES: all forbiddenFns[i] in exprLV2

        if (steps <= 0) {
            let varS = variables[Math.floor(Math.random() * variables.length)];
            let varExpr = new exprCstr[varS]();
            if (Math.random() > 0.5) {
                let coefficient = helper.randint(settings.min, settings.max);
                while (coefficient === 0 || coefficient === 1)
                    coefficient = helper.randint(settings.min, settings.max);
                return new exprCstr.coeff(coefficient, varExpr);
            } else return varExpr;
        }
        
        // get all allowed function classes and sum of their weights
        let fnChoices = exprLV2.filter(function(s) {
            return forbiddenFns.indexOf(s) === -1
        });
        let fnWeightsSum = settings.weightsSum;
        for (let i = 0; i < forbiddenFns.length; i++) {
            fnWeightsSum -= settings.weights[forbiddenFns[i]];
        }
        
        // pick an expression class from allowed functions
        let chooser = Math.floor(Math.random() * fnWeightsSum);
        let i = -1; let acc = 0;
        while (chooser >= acc) {
            i++;
            acc += settings.weights[fnChoices[i]];
        }
        let fn = fnChoices[i];

        let res = null;
        if (fn === "sum") {
            // TODO have chance of one being a nonzero constant?
            let first = generate.expr(steps - 1, variables, []);
            let second = generate.expr(steps - 1, variables, (exprLV2.indexOf(first.type) !== -1) ? [first.type] : []);
            res = new exprCstr.sum(first, second);
        } else if (fn === "product") {
            // TODO if the first one ends up a coefficient, next one shouldn't be.
            let first = generate.expr(steps - 1, variables, []);
            let second = generate.expr(steps - 1, variables, (exprLV2.indexOf(first.type) !== -1) ? [first.type] : []);
            res = new exprCstr.product(first, second);
        } else if (fn === "quotient") {
            if (steps === 1) {
                // one of the sub-expressions must be a nonzero constant,
                // to prevent nx/mx which will simplify to a constant
                let nonzeroConst = helper.randint(settings.min, settings.max);
                while (nonzeroConst === 0)
                    nonzeroConst = helper.randint(settings.min, settings.max);
                if (Math.random() > 0.5) {
                    // place in numerator
                    return new exprCstr.quotient(
                        new exprCstr.constant(nonzeroConst),
                        generate.expr(steps - 1, variables, [])
                    )
                } else {
                    // place in denominator; can't be 1 or -1 in this case
                    while (nonzeroConst === 1 ||
                           nonzeroConst === -1 ||
                           nonzeroConst === 0)
                        nonzeroConst = helper.randint(settings.min, settings.max);
                    return new exprCstr.quotient(
                        generate.expr(steps - 1, variables, []),
                        new exprCstr.constant(nonzeroConst)
                    )
                }
            } else {
                // TODO have chance of num being a nonzero constant?

                // the first and second exprs must be different expr types,
                // to avoid the quotient simplifying to 1
                // and since generate.expr will never produce a constant 0,
                // there can't be division by 0
                let first = generate.expr(steps - 1, variables, []);
                let second = generate.expr(steps - 1, variables, (exprLV2.indexOf(first.type) !== -1) ? [first.type] : []);
                res = new exprCstr.quotient(first, second);
            }
        } else if (fn === "power") {
            // since there's a quotient type, negative powers not necessary
            // 7/10 chance of 2, 1/5 chance of 3, 1/10 chance of 4
            let choice = helper.randint(1, 10);
            let constant = (choice < 8) ? 2 : ((choice < 10) ? 3 : 4);
            res = new exprCstr.power(generate.expr(steps - 1, variables, []),
                                      constant);
        } else if (fn === "etothe") {
            res = new exprCstr.etothe(generate.expr(steps - 1, variables, []));
        } else if (fn === "trig") {
            let tfn = trigFns[Math.floor(Math.random() * trigFns.length)];
            res = new exprCstr[tfn](generate.expr(steps - 1, variables, []));
        }

        // half chance of coeff for coeffable stuff
        if (coeffable.indexOf(res.type) !== -1 && Math.random() > 0.5) {
            let coefficient = helper.randint(settings.min, settings.max);
            while (coefficient === 0 || coefficient === 1)
                coefficient = helper.randint(settings.min, settings.max);
            res = new exprCstr.coeff(coefficient, res);
        }

        res = helper.expr.simplifyAll(res);
        // res = helper.expr.zerosAndOnesAll(res);    // is this necessary? There should be no way to have a zero or one in the wrong spot

        return res;
    }
}