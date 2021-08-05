
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
    expr: function(steps, variables) {
        // variables argument should be like ["x", "y"]
        if (steps <= 0) {
            let choice = variables[Math.floor(Math.random() * variables.length)];
            return new exprCstr[choice]();
        }
        let res = null
        let fn = exprLV2[Math.floor(Math.random() * exprLV2.length)];
        if (fn === "coeff") {
            let coefficient = helper.randint(settings.min, settings.max);
            while (coefficient === 0 || coefficient === 1)
                coefficient = helper.randint(settings.min, settings.max);   // make sure it can't just be zero and/or one, or this loops infinitely
            res = new exprCstr.coeff(coefficient, generate.expr(steps - 1, variables));
        } else if (fn === "sum") {
            // have chance of one being a nonzero constant?
            res = new exprCstr.sum(generate.expr(steps - 1, variables),
                                    generate.expr(steps - 1, variables));
        } else if (fn === "product") {
            res = new exprCstr.product(generate.expr(steps - 1, variables),
                                        generate.expr(steps - 1, variables));
        } else if (fn === "quotient") {
            // have chance of one being a constant?
            res = new exprCstr.quotient(generate.expr(steps - 1, variables),
                                         generate.expr(steps - 1, variables));
            // TODO make it impossible to generate 0 in the denominator
        } else if (fn === "power") {
            // since there's a quotient type, negative powers not necessary
            // 7/10 chance of 2, 1/5 chance of 3, 1/10 chance of 4
            let choice = helper.randint(1, 10);
            let power = (choice < 8) ? 2 : ((choice < 10 ? 3 : 4));
            res = new exprCstr.power(generate.expr(steps - 1, variables),
                                      power);
        } else if (fn === "etothe") {
            res = new exprCstr.etothe(generate.expr(steps - 1, variables));
        } else if (fn === "trig") {
            let tfn = trigFns[Math.floor(Math.random() * trigFns.length)];
            res = new exprCstr[tfn](generate.expr(steps - 1, variables));
        }
        res = helper.expr.simplifyAll(res);
        // res = helper.expr.zerosAndOnesAll(res);    // is this necessary? There is no way to have a zero or one in the wrong spot, right
        return res;
    }
}