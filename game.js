function Tetris(height, width) {
	this.landedGrid = this.generateBoard(height, width);
	console.log(this.landedGrid);
	this.height = this.landedGrid.length;
	this.width = this.landedGrid[0].length;
	this.currTetromino;
	this.tetrominoOrder = [];
	this.tetrominoRotations; //refrence to an array of the possible rotations of the current Tetromino
	this.rotationIndex; 
	this.speedLevels = [2000, 1600, 1200, 1000, 800]; 
	this.currSpeed = this.speedLevels[0];
	this.intervalID;
}

Tetris.prototype.generateBoard = function (height, width) {

	var gameArray = [];

	for (var i = 0; i < height; i++) {
		gameArray.push(new Array(width));

    	for (var j = 0; j < width; j++)
	        gameArray[i][j] = 0;
   	}
	
	return gameArray;
};

Tetris.prototype.setUpBoard = function () {


	
};

Tetris.prototype.randomizeTetrominoOrder = function () {
	/**
	 * Randomize array element order in-place.
	 * Using Fisher-Yates shuffle algorithm.
	 */
	var shuffleArray = function (array) {
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	}

	this.tetrominoOrder = [
							tetrominoRotations.I[0], tetrominoRotations.I[1], 
							tetrominoRotations.J[0], tetrominoRotations.J[1], 
							tetrominoRotations.L[0], tetrominoRotations.L[1],
							tetrominoRotations.O[0], tetrominoRotations.O[0],
							tetrominoRotations.S[0], tetrominoRotations.S[1],
							tetrominoRotations.T[0], tetrominoRotations.T[1],
							tetrominoRotations.Z[0], tetrominoRotations.Z[1]
						   ];

	shuffleArray(this.tetrominoOrder);
};

Tetris.prototype.clearCanvas = function () {

};

Tetris.prototype.rotateTetromino = function () {

	var potentialTetromino = this.tetrominoRotations.indexof(this.rotationIndex + 1) !== -1 ? this.tetrominoRotations[++this.rotationIndex] : this.tetrominoRotations[0]; 
	potentialTetromino.topLeft = this.currTetromino.topLeft;

	if(this.checkCollisions(potentialTetromino.topLeft.row, potentialTetromino.topLeft.col, potentialTetromino)) {
		this.currTetromino = potentialTetromino;
		return true;
	} else {
		return false;
	}

};

Tetris.prototype.moveTetromino = function (keyCode) {

	var potentialTopLeftRow;
	var potentialTopLeftCol;

	if (keyCode === 37) { // Left
		potentialTopLeftRow = this.currTetromino.topLeft.row;
		potentialTopLeftCol = this.currTetromino.topLeft.col - 1;
	} else if (keyCode === 39) { // Right
		potentialTopLeftRow = this.currTetromino.topLeft.row;
		potentialTopLeftCol = this.currTetromino.topLeft.col + 1;
	} else if (keyCode === 38) { // Down
		potentialTopLeftRow = this.currTetromino.topLeft.row + 1;
		potentialTopLeftCol = this.currTetromino.topLeft.col;
	} else {
		return false;
	}
	
	if (this.checkCollisions(potentialTopLeftRow, potentialTopLeftCol, this.currTetromino)) {
		// the Tetromino can move to new position 
   		this.currTetromino.topLeft.row = potentialTopLeftRow;
   		this.currTetromino.topLeft.col = potentialTopLeftCol;
   		return true;
	} else {
    	if (keyCode === 38) { // the Tetromino cannot move down so the shape will land
    		this.landTetromino();
    	}

    	return false;
	}

};

//TODO check if checkCollisions works on game over
Tetris.prototype.checkCollisions = function (potentialTopLeftRow, potentialTopLeftCol, potentialTetromino) {
	for (var row = 0; row < potentialTetromino.length; row++) {
    	for (var col = 0; col < potentialTetromino[row].length; col++) {

	        if ((potentialTetromino[row][col] !== 0) &&  // is this block actually part of the Tetromino shape?
	        	((landedGrid[potentialTopLeftRow + row] === undefined || landedGrid[potentialTopLeftRow + row][potentialTopLeftCol + col] === undefined) || // is this block of the Tetromino now out of bounds?
	        	(landedGrid[potentialTopLeftRow + row][potentialTopLeftCol + col] !== 0))) { // is there already a landed block at this spot? 
	                //the space is taken
	            return false;
	        }
	    }
   	}

   	return true;
};

Tetris.prototype.landTetromino = function () {
   	for (var row = 0; row < this.currTetromino.length; row++) {
    	for (var col = 0; col < this.currTetromino[row].length; col++) {
	        if (this.currTetromino[row][col] != 0) 
	        	landedGrid[currTetromino.topLeft.row + row][currTetromino.topLeft.col + col] = this.currTetromino[row][col];
	    }
   	}

   	this.addTetromino();

};

Tetris.prototype.addTetromino = function () {
	if (this.tetrominoOrder.length === 0) 
		this.randomizeTetrominoOrder();

	this.currTetromino = this.tetrominoOrder.pop();
	this.currTetromino.topLeft.row = 0;
	this.currTetromino.topLeft.col = Math.floor(this.width/2) - Math.floor(this.currTetromino[0].length/2);

	return this.checkCollisions(this.currTetromino.topLeft.row, this.currTetromino.topLeft.col, this.currTetromino);

};


Tetris.prototype.setPlay = function (speed) {
	clearInterval(this.intervalID);
	
	this.intervalID = this.setInterval( function() {
		this.clearCanvas();
 		this.moveTetromino(38);
 		this.drawCanvas();
 	}, speed );
};

