// parameters
let mwBreathingRoom = 2;  // in px; for outer padding of container
let mwMinCells = 2;       // minimum # of rows or cols in matrix
let mwMaxCells = 4;       // maximum # of rows or cols in matrix
let mwMargin = 10;        // in px
let mwCellSize = 60;      // in px, sidelength plus one margin

let mwMinCtnrDim = mwMinCells * mwCellSize + mwMargin
let mwMaxCtnrDim = mwMaxCells * mwCellSize + mwMargin

let mwCtnr = $("#mw-container");
let mwHandle = $("#mw-handle");
let $window = $(window);
let mwXOffset = 0, mwYOffset = 0;   // stores the offset of the mouse
                                    // from the bottom right of the box
let mwRowsInput = $("#mw-rows-input");
let mwColsInput = $("#mw-cols-input");
let mwSubmitButton = $("#mw-submit");
let mwInputHTML =
    "<input type=\"text\" class=\"mw-inner-box\" pattern=\"-?[0-9]{0,3}\" />";

// initialize inner boxes model with 3 x 3 matrix
// this 2D array will store all the input elements
let mwInputs = [];
for (let i = 0; i < 3; i++) {
    mwInputs.push([]);
    for (let j = 0; j < 3; j++) {
        let input = $(mwInputHTML);
        mwInputs[i].push(input); mwCtnr.append(input);
    }
    mwCtnr.append($("<br />"));
}

function attachInputEventHandlers() {
    for (let i = 0; i < mwInputs.length; i++) {
        for (let j = 0; j < mwInputs[i].length; j++) {
            // arrow key movement
            mwInputs[i][j].on("keydown", function(event) {
                if (event.code === "ArrowUp" && i > 0) mwInputs[i-1][j].select();
                else if (event.code === "ArrowLeft" && j > 0) mwInputs[i][j-1].select();
                else if (event.code === "ArrowRight" && j < mwInputs[i].length - 1) mwInputs[i][j+1].select();
                else if (event.code === "ArrowDown" && i < mwInputs.length - 1) mwInputs[i+1][j].select();
            });
            // focusing
            mwInputs[i][j].on("focus", function() {
                $(this).on("keyup", function() {
                    $(this).off("keyup").select()
                });
            });
            // input validation
            mwInputs[i][j].on("input", function() {
                // remove the character that was just typed if it doesn't match
                if (this.validity.patternMismatch) {
                    this.value = this.value.slice(0, this.value.length - 1);
                }
            });
        }
    }
}
attachInputEventHandlers();

// set up the "Rows:" and "Columns:" inputs
function keydownHandler(event) {
    if (event.code === "Enter") mwSubmitButton.click();
}
mwRowsInput.on("keydown", keydownHandler);
mwColsInput.on("keydown", keydownHandler);
mwSubmitButton.click(function() {
    let rows = Number.parseInt(mwRowsInput.prop("value"));
    if (!Number.isNaN(rows) && mwMinCells <= rows && rows <= mwMaxCells) {
        mwCtnr.height(mwCellSize * rows + mwMargin);
        mwSetRows(mwInputs.length - rows);
    }
    let cols = Number.parseInt(mwColsInput.prop("value"));
    if (!Number.isNaN(cols) && mwMinCells <= cols && cols <= mwMaxCells) {
        mwCtnr.width(mwCellSize * cols + mwMargin);
        mwSetCols(mwInputs[0].length - cols);
    }
});

// helpers
function mwSetRows(rowDifference) {
    // add or remove rows until the dimensions are right
    if (rowDifference < 0) {
        let rowsToAdd = Math.abs(rowDifference);
        for (let i = 0; i < rowsToAdd; i++) {
            let len = mwInputs[mwInputs.length - 1].length;
            mwInputs.push([]);
            for (let j = 0; j < len; j++) {
                let newInput = $(mwInputHTML);
                mwCtnr.append(newInput);
                mwInputs[mwInputs.length - 1].push(newInput);
            }
            mwCtnr.append($("<br />"));
        }
    } else if (rowDifference > 0) {
        for (let i = 0; i < rowDifference; i++) {
            let toRemove = mwInputs.pop();
            for (let i = 0; i < toRemove.length; i++) {
                $(toRemove[i]).remove();
            }
            $("br", mwCtnr).last().remove();
        }
    }
    attachInputEventHandlers();
}
function mwSetCols(colDifference) {
    // add or remove cols until the dimensions are right
    if (colDifference < 0) {
        let colsToAdd = Math.abs(colDifference);
        for (let i = 0; i < colsToAdd; i++) {
            $("br", mwCtnr).each(function(index) {
                let newInput = $(mwInputHTML);
                $(this).before(newInput);
                mwInputs[index].push(newInput);
            });
        }
    } else if (colDifference > 0) {
        for (let i = 0; i < colDifference; i++) {
            $("br", mwCtnr).each(function(index) {
                $(mwInputs[index].pop()).remove();
            })
        }
    }
    attachInputEventHandlers();
}

// drag-resizing stuff
function resizingHandler(event) {
    // this will become the handler for pointermove until
    // pointerup is fired while resizing the matrix widget

    // set the new width and height of the widget container
    let ctnrOffset = mwCtnr.offset();
    let newWidth = (event.pageX - mwXOffset) - ctnrOffset.left
    let newHeight = (event.pageY - mwYOffset) - ctnrOffset.top

    if (newWidth > mwMaxCtnrDim) newWidth = mwMaxCtnrDim;
    else if (newWidth < mwMinCtnrDim) newWidth = mwMinCtnrDim;
    if (newHeight > mwMaxCtnrDim) newHeight = mwMaxCtnrDim;
    else if (newHeight < mwMinCtnrDim) newHeight = mwMinCtnrDim;
    mwCtnr.width(newWidth);
    mwCtnr.height(newHeight);

    // figure out what the dimensions of the model should be based on size
    let rowDifference = mwInputs.length - Math.floor((newHeight - mwBreathingRoom) / mwCellSize);
    let colDifference = mwInputs[0].length - Math.floor((newWidth - mwBreathingRoom) / mwCellSize);
    mwSetRows(rowDifference); mwSetCols(colDifference);
}
function doneResizingUninstaller(event) {
    // snap to nearest matrix size
    let ctnrOffset = mwCtnr.offset();
    let newWidth = mwMargin + mwCellSize *
        Math.floor((((event.pageX - mwXOffset) - ctnrOffset.left)
        - mwBreathingRoom) / mwCellSize);
    let newHeight = mwMargin + mwCellSize *
        Math.floor((((event.pageY - mwYOffset) - ctnrOffset.top)
        - mwBreathingRoom) / mwCellSize);
    if (newWidth > mwMaxCtnrDim) newWidth = mwMaxCtnrDim;
    else if (newWidth < mwMinCtnrDim) newWidth = mwMinCtnrDim;
    if (newHeight > mwMaxCtnrDim) newHeight = mwMaxCtnrDim;
    else if (newHeight < mwMinCtnrDim) newHeight = mwMinCtnrDim;
    mwCtnr.width(newWidth);
    mwCtnr.height(newHeight);

    // end resizing event state
    $window.off("pointermove", resizingHandler);
    $window.off("pointerup", doneResizingUninstaller);
}
mwHandle.on("pointerdown", function(event) {
    // store mouse's offset relative to the bottom right of the container
    let ctnrOffset = mwCtnr.offset();
    mwXOffset = event.pageX - ctnrOffset.left - mwCtnr.width();
    mwYOffset = event.pageY - ctnrOffset.top - mwCtnr.height();

    // start resizing event state
    $window.on("pointermove", resizingHandler);
    $window.on("pointerup ", doneResizingUninstaller)
});

// use arrow keys for resizing when handle has focus
mwHandle.on("keydown", function(event) {
    let rowChange = 0;
    let colChange = 0;
    if (event.code === "ArrowUp" && mwInputs.length > mwMinCells) rowChange++; 
    else if (event.code === "ArrowLeft" && mwInputs[0].length > mwMinCells) colChange++; 
    else if (event.code === "ArrowRight" && mwInputs[0].length < mwMaxCells) colChange--;
    else if (event.code === "ArrowDown" && mwInputs.length < mwMaxCells) rowChange--;
    mwSetRows(rowChange);
    mwSetCols(colChange);
    mwCtnr.height(mwMargin + mwCellSize * (mwInputs.length));
    mwCtnr.width(mwMargin + mwCellSize * (mwInputs[0].length));
})

// this function can be used to retrieve the input matrix
// as a JavaScript two-dimensional array
function mwGetMatrix() {
    let res = [];
    for (let i = 0; i < mwInputs.length; i++) {
        res.push([]);
        for (let j = 0; j < mwInputs[0].length; j++) {
            let thisVal = Number.parseInt(mwInputs[i][j].prop("value"));
            res[i].push((Number.isNaN(thisVal)) ? 0 : thisVal);     // interprets "" and "-" as 0s
        }
    }
    return res;
}