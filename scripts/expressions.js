

// you should work all possible simplification into these constructors
let exprCstr =
{
    x: function() {
        this.type = "x";
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
    }, // quotient not necessary; can multiply by (expr)^{-1}
    power: function(expr, constant) {
        if (constant === 1) {
            console.log(expr.type);
            Object.assign(this, expr);
            console.log(this.type);
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



// there are going to be mutability issues here.
// ok, establishing these rules:
// e.expr<x> should never appear on its own without a differentiate() or
// Object.assign({}, ) (i.e. shallow copy) around it.
// you can easily write a recursive deep copy function, but is that necessary?
let differentiate = function(e) {
    if (e.type === "x") {
        return (new exprCstr.constant(1));
    } else if (e.type === "constant") {
        return (new exprCstr.constant(0));
    } else if (e.type === "coeff") {
        return (new exprCstr.coeff(e.constant, differentiate(e.expr)));
    } else if (e.type === "sum") {
        return (new exprCstr.sum(differentate(e.expr1), differentiate(e.expr2)));
    } else if (e.type === "product") {
        return (new exprCstr.sum(new exprCstr.product(Object.assign({}, e.expr1), differentiate(e.expr2)),
                                 new exprCstr.product(differentiate(e.expr1), Object.assign({}, e.expr2))));
    } else if (e.type === "power") {
        return (new exprCstr.product(new exprCstr.coeff(e.constant, new exprCstr.power(Object.assign({}, e.expr), e.constant - 1)), differentiate(e.expr)));
    } else if (e.type === "etothe") {
        return (new exprCstr.product(Object.assign({}, e), differentiate(e.expr)));
    } else if (e.type === "sin") {
        return (new exprCstr.product(new exprCstr.cos(Object.assign({}, e.expr)), differentiate(e.expr)));
    } else if (e.type === "cos") {
        return (new exprCstr.coeff(-1, new exprCstr.product(new exprCstr.sin(Object.assign({}, e.expr)), differentiate(e.expr))));
    } else if (e.type === "tan") {
        return new exprCstr.power(new exprCstr.sec(Object.assign({}, e.expr)), 2);
    } else if (e.type === "csc") {
        return new exprCstr.coeff(-1, new exprCstr.product(new exprCstr.product(new exprCstr.csc(Object.assign({}, e.expr)), new exprCstr.cot(Object.assign({}, e.expr))), differentiate(e.expr)));
    } else if (e.type === "sec") {
        return (new exprCstr.product(new exprCstr.product(new exprCstr.sec(Object.assign({}, e.expr)), new exprCstr.tan(Object.assign({}, e.expr))), differentiate(e.expr)));
    } else if (e.type === "cot") {
        return new exprCstr.coeff(-1, new exprCstr.power(new exprCstr.csc(Object.assign({}, e.expr)), 2));
    }
}

// write simplification function that merges constant multipliers and constants in a sum?