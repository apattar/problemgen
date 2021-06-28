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
}

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
    }
}