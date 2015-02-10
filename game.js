function Tetris() {
	this.width = 10;
	this.height = 16;
	this.speedLevels = [2000, 1600, 1200, 1000, 800]; 
	this.currSpeed = speedLevels[0];
	this.landedGrid = gameGrid;
	this.currTetromino;
	this.intervalID;
}

Tetris.prototype.setUpBoard = function () {

};

Tetris.prototype.clearCanvas = function () {

};

Tetris.prototype.checkMove = function (keyCode) {

	var potentialTopLeftRow;
	var potentialTopLeftCol;

	if (keyCode === 37) { // Left
		potentialTopLeftRow = currTetromino.topLeft.row;
		potentialTopLeftCol = currTetromino.topLeft.col - 1;
	} else if (keyCode === 39) { // Right
		potentialTopLeftRow = currTetromino.topLeft.row;
		potentialTopLeftCol = currTetromino.topLeft.col + 1;
	} else if (keyCode === 38) { // Down
		potentialTopLeftRow = currTetromino.topLeft.row + 1;
		potentialTopLeftCol = currTetromino.topLeft.col;
	} else {

	}
	
	for (var row = 0; row < this.currTetromino.length; row++) {
    	for (var col = 0; col < this.currTetromino[row].length; col++) {

	        if ((this.currTetromino[row][col] != 0) &&  // is this block actually part of the Tetromino shape?
	        	((landedGrid[potentialTopLeftRow + row] === undefined || landedGrid[potentialTopLeftRow + row][potentialTopLeftCol + col] === undefined) || // is this block of the Tetromino now out of bounds?
	        	(landedGrid[potentialTopLeftRow + row][potentialTopLeftCol + col] != 0))) { // is there already a landed block at this spot? 
	                //the space is taken

	            	// the Tetromino cannot move to the left or right
	            	if (keyCode === 37 || keyCode === 39) {
	            		return;
	            	} else { // the Tetromino cannot move down so the shape will land
	            		this.landTetromino();
	            	}
	        }
	    }
   	}

   	// the Tetromino can move to new position 
   	currTetromino.topLeft.row = potentialTopLeftRow;
   	currTetromino.topLeft.col = potentialTopLeftCol;

};

Tetris.prototype.landTetromino = function () {
   	for (var row = 0; row < this.currTetromino.length; row++) {
    	for (var col = 0; col < this.currTetromino[row].length; col++) {
	        if (this.currTetromino[row][col] != 0) 
	        	landedGrid[currTetromino.topLeft.row + row][currTetromino.topLeft.col + col] = this.currTetromino[row][col];
	    }
   	}


};

Tetris.prototype.drawCanvas = function () {
	for (var row = 0; row < gameGrid.length; row++) {
    	for (var col = 0; col < gameGrid[row].length; col++) {
	        if (gameGrid[row][col] != 0) {
	            //draw block at position corresponding to row and col
	            //remember, row gives y-position, col gives x-position
	        }
     	}
    }
};

Tetris.prototype.setPlay = function (speed) {
	clearInterval(this.intervalID);
	
	this.intervalID = this.setInterval( function() {
		this.clearCanvas();
 		this.fallOneRow();
 		this.drawCanvas();
 	}, speed );
};



