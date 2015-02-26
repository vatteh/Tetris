function Tetris(height, width) {
	this.landedGrid = this.generateBoard(height, width);
	this.height = this.landedGrid.length;
	this.width = this.landedGrid[0].length;
	this.currTetromino;
	this.tetrominoOrder = [];
	this.rotationIndex = 0; 
	this.intervalID;
	this.addTetromino();
	this.setUpKeyEvents();
	this.renderEngine = new RenderEngine(this);
	this.renderEngine.render();
	this.setPlay(2000);
}

Tetris.prototype.generateBoard = function (height, width) {

	var gameArray = [];

	for (var i = 0; i < height; i++) {
		gameArray.push(new Array());
    	for (var j = 0; j < width; j++)
	        gameArray[i][j] = 0;
   	}

   	for (var rotationArray in tetrominoRotations) {
		if (tetrominoRotations.hasOwnProperty( rotationArray )) {
			
			tetrominoRotations[rotationArray].forEach(function(val, index, array) {
				val.rotationIndex = index;
				val.tetrominoRotations = array;
			});
		}
	}


	return gameArray;
};

Tetris.prototype.setUpKeyEvents = function () {
	var that = this;
	document.body.onkeydown = function ( e ) {
		if (e.keyCode === 37 || e.keyCode === 40 || e.keyCode === 39 || e.keyCode === 32)
			that.moveTetromino(e.keyCode);
		else if (e.keyCode === 38)
			that.rotateTetromino(e.keyCode);
	};
};

Tetris.prototype.randomizeTetrominoOrder = function () {
	/**
	 * Randomize array element order in-place.
	 * Using Fisher-Yates shuffle algorithm.
	 */
	var shuffleArray = function (aRay) {
	    for (var i = aRay.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = aRay[i];
	        aRay[i] = aRay[j];
	        aRay[j] = temp;
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

Tetris.prototype.rotateTetromino = function () {

	var potentialTetromino; 
	if (this.currTetromino.rotationIndex < this.currTetromino.tetrominoRotations.length-1) {
		potentialTetromino = this.currTetromino.tetrominoRotations[this.currTetromino.rotationIndex + 1];
	} else {
		potentialTetromino = this.currTetromino.tetrominoRotations[0];
	}

	potentialTetromino.topLeft = this.currTetromino.topLeft;

	if(this.checkCollisions(potentialTetromino.topLeft.row, potentialTetromino.topLeft.col, potentialTetromino)) {
		this.currTetromino = potentialTetromino;
		this.renderEngine.render();
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
	} else if (keyCode === 40) { // Down
		potentialTopLeftRow = this.currTetromino.topLeft.row + 1;
		potentialTopLeftCol = this.currTetromino.topLeft.col;
	} else if (keyCode === 32) { // SpaceBar
		potentialTopLeftRow = this.currTetromino.topLeft.row;
		potentialTopLeftCol = this.currTetromino.topLeft.col;
		while (this.checkCollisions(++potentialTopLeftRow, potentialTopLeftCol, this.currTetromino)) {
			this.currTetromino.topLeft.row = potentialTopLeftRow;
		}
	} else {
		return false;
	}
	
	if (this.checkCollisions(potentialTopLeftRow, potentialTopLeftCol, this.currTetromino)) {
		// the Tetromino can move to new position 
   		this.currTetromino.topLeft.row = potentialTopLeftRow;
   		this.currTetromino.topLeft.col = potentialTopLeftCol;
   		this.renderEngine.render();
   		return true;
	} else {
    	if (keyCode === 40 || keyCode === 32) { // the Tetromino cannot move down so the shape will land
    		this.landTetromino();
    		this.renderEngine.render();
    		return true;
    	}

    	return false;
	}

};

Tetris.prototype.checkCollisions = function (potentialTopLeftRow, potentialTopLeftCol, potentialTetromino) {
	for (var row = 0; row < potentialTetromino.length; row++) {
    	for (var col = 0; col < potentialTetromino[row].length; col++) {

	        if ((potentialTetromino[row][col] !== 0) &&  // is this block actually part of the Tetromino shape?
	        	((this.landedGrid[potentialTopLeftRow + row] === undefined || this.landedGrid[potentialTopLeftRow + row][potentialTopLeftCol + col] === undefined) || // is this block of the Tetromino now out of bounds?
	        	(this.landedGrid[potentialTopLeftRow + row][potentialTopLeftCol + col] !== 0))) { // is there already a landed block at this spot? 
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
	        	this.landedGrid[this.currTetromino.topLeft.row + row][this.currTetromino.topLeft.col + col] = this.currTetromino[row][col];
	    }
   	}

   	this.clearLines();
   	this.addTetromino();

};

Tetris.prototype.clearLines = function () {

	for (var i = 0; i < this.landedGrid.length; i++) {
		if (this.landedGrid[i].indexOf(0) === -1)  { // no 0 means row is filled
			this.landedGrid.splice(i, 1);
			var aRay = new Array();
			for (var j = 0; j < this.width; j++)
	        	aRay[j] = 0;
			this.landedGrid.unshift(aRay);
		}
	}

};

Tetris.prototype.addTetromino = function () {
	if (this.tetrominoOrder.length === 0) 
		this.randomizeTetrominoOrder();

	this.currTetromino = this.tetrominoOrder.pop();
	this.currTetromino.topLeft = {row: 0, col: Math.floor(this.width/2) - Math.floor(this.currTetromino[0].length/2)};
	
	return this.checkCollisions(this.currTetromino.topLeft.row, this.currTetromino.topLeft.col, this.currTetromino);

};


// need to remove found clumps from game board, then treat them as falling tetriminos
Tetris.prototype.findClumps = function (clearedRowIndex) {
	var clumps = [];

	var remainderBoard = this.landedGrid.slice(clearedRowIndex);

	for (var i = 0, len = remainderBoard.length; i < len; i++) {
		for (var j = 0, len2 = remainderBoard[i].length; j < len2; j++) {
			if (remainderBoard[i][j] !== 0) {
				var clump = {};
				clump.topLeft = {row: i, col: j};
				clump = this.floodFill(i, j, clump, remainderBoard);
				clumps.push(clump);
			}
		}
	}

	return clumps;
};

Tetris.prototype.floodFill = function (row, col, clump, remainderBoard) {

};

Tetris.prototype.setPlay = function (speed) {
	clearInterval(this.intervalID);
	
	var that = this;

	this.intervalID = window.setInterval( function() {
 		that.moveTetromino(40);
 	}, speed );
};

