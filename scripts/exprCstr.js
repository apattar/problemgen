

// you should work all possible simplification into these constructors.
// when you want to show steps, you can test in the sbsNode function itself
// before using the constructors

// you could have a function that probes recursively into the structure,
// and returns after making one simplification, and then another that does
// many simplifications at once for the generator

// the one-step simplifier can also return text describing what was done
let exprCstr =
{
    x: function() {
        this.type = "x";
    },
    y: function() {
        this.type = "y";
    },
    z: function() {
        this.type = "z";
    },
    constant: function(constant) {
        this.type = "constant";
        this.constant = constant;
    },
    coeff: function(constant, expr) {
        if (constant === 1) {
            Object.assign(this, expr);
        } else if (constant === 0) {
            this.type = "constant";
            this.constant = 0;
        } else if (expr.type === "constant") {
            this.type = "constant";
            this.constant = constant * expr.constant;
        } else {
            this.type = "coeff";
            this.constant = constant;
            this.expr = expr;
        }
    },
    sum: function(expr1, expr2) {
        let expr1is0 = expr1.type === "constant" && expr1.constant === 0;
        let expr2is0 = expr2.type === "constant" && expr2.constant === 0;
        if (expr1is0) {     // this also handles the case if they're both zero
            Object.assign(this, expr2);
        } else if (expr2is0) {
            Object.assign(this, expr1);
        } else {
            this.type = "sum";
            this.expr1 = expr1;
            this.expr2 = expr2;
        }
    },
    product: function(expr1, expr2) {
        // maybe instead, if either is a constant delegate to coeff
        // which will take care of zeros and ones
        // and if both are constants, multiply and delegate to constant
        let expr1is0 = expr1.type === "constant" && expr1.constant === 0;
        let expr2is0 = expr2.type === "constant" && expr2.constant === 0;
        let expr1is1 = expr1.type === "constant" && expr1.constant === 1;
        let expr2is1 = expr2.type === "constant" && expr2.constant === 1;
        if (expr1is0 || expr2is0) {
            this.type = "constant";
            this.constant = 0;
        } else if (expr1is1) {
            Object.assign(this, expr2);
        } else if (expr2is1) {
            Object.assign(this, expr1);
        } else {
            this.type = "product";
            this.expr1 = expr1;
            this.expr2 = expr2;
        }
    },
    quotient: function(expr1, expr2) {
        let expr1is0 = expr1.type === "constant" && expr1.constant === 0;
        let expr2is0 = expr2.type === "constant" && expr2.constant === 0;
        let expr2is1 = expr2.type === "constant" && expr2.constant === 1;
        if (expr2is0) alert("division by 0!");
        else if (expr1is0) {
            this.type = "constant";
            this.constant = 0;
        } else if (expr2is1) {
            Object.assign(this, expr1);
        } else {
            this.type = "quotient";
            this.expr1 = expr1;
            this.expr2 = expr2;
        }
    },
    power: function(expr, constant) {
        if (constant === 1) {
            Object.assign(this, expr);
        } else if (constant === 0) {
            this.type = "constant"
            this.constant = 1;
        } else {
            this.type = "power";
            this.expr = expr;
            this.constant = constant;
        }
    },
    etothe: function(expr) {
        // represents e^(expr)
        // should be treated like a variable, regardless of what "expr" is.
        if (expr.type === "constant" && expr.constant === 0) {
            this.type = "constant";
            this.constant = 1;
        } else {
            this.type = "etothe";
            this.expr = expr;
        }
    },
}

let trigFns = ["sin", "cos", "tan", "csc", "sec", "cot"]; // inverse trig?
for (let i = 0; i < trigFns.length; i++) {
    let tfn = trigFns[i];
    exprCstr[tfn] = function(expr) {
        this.type = tfn;
        this.expr = expr;
    }
}

let exprLV2 = ["coeff", "sum", "product", "quotient", "power", "etothe", "trig"];

// write simplification function that merges constant multipliers and constants in a sum?