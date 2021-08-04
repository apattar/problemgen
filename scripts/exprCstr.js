

// you should work all possible simplification into these constructors.
// when you want to show steps, you can test in the sbsNode function itself
// before using the constructors

// you could have a function that probes recursively into the structure,
// and returns after making one simplification, and then another that does
// many simplifications at once for the generator

// the one-step simplifier can also return text describing what was done


// okay, here are the final rules.
// if it's something that would be done when writing an expression for the first time because it's obvious for cosmetic purposes, it can
// go into the constructors.
// it can then be relied on in the simplification functions.

// here are the rearrangements so far:

// if a coeff's expr is a constant, make it a product.
// if exactly one of a product's exprs is a constant, make it a coeff.

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
        if (expr.type === "constant") {
            this.type = "product";
            this.expr1 = new exprCstr.constant(constant);
            this.expr2 = expr;
        } else {
            this.type = "coeff";
            this.constant = constant;
            this.expr = expr;
        }
    },
    sum: function(expr1, expr2) {
        this.type = "sum";
        this.expr1 = expr1;
        this.expr2 = expr2;
    },
    product: function(expr1, expr2) {
        let expr1IsConst = expr1.type === "constant";
        let expr2IsConst = expr2.type === "constant";
        if (expr1IsConst && !expr2IsConst) {
            this.type = "coeff";
            this.constant = expr1.constant;
            this.expr = expr2;
        } else if (expr2IsConst && !expr1IsConst) {
            this.type = "coeff";
            this.constant = expr2.constant;
            this.expr = expr1;
        } else {
            this.type = "product";
            this.expr1 = expr1;
            this.expr2 = expr2;
        }
    },
    quotient: function(expr1, expr2) {
        this.type = "quotient";
        this.expr1 = expr1;
        this.expr2 = expr2;
    },
    power: function(expr, constant) {
        this.type = "power";
        this.expr = expr;
        this.constant = constant;
    },
    etothe: function(expr) {
        // represents e^(expr)
        // should be treated like a variable, regardless of what "expr" is.
        this.type = "etothe";
        this.expr = expr;
    },
}
// maybe add a special constant type meant for trig fns & etothes with constants? So they're treated like constants as a whole
// that's the kind of thing that should be taken care of in the constructors for etothe and trig

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