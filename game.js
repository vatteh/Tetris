function Tetris(height, width, testing) {
	this.landedGrid = this.generateBoard(height, width);
	this.height = this.landedGrid.length;
	this.width = this.landedGrid[0].length;
	this.currTetromino;
	this.tetrominoOrder = [];
	this.rotationIndex = 0; 
	this.intervalID;
	this.addTetromino();
	this.setUpKeyEvents(true);
	this.testing = testing;
	this.renderEngine = new RenderEngine(this, testing);
	this.renderEngine.render();
	this.setPlay(2000);
}

Tetris.prototype.newRow = function (width) {
	var aRay = new Array();
	for (var i = 0; i < width; i++)
	   	aRay[i] = 0;

	return aRay;
};

Tetris.prototype.generateBoard = function (height, width) {

	var gameArray = [];

	// crete empty height x width board
	for (var i = 0; i < height; i++) {
		gameArray.push(this.newRow(width));
   	}

   	// give each of the 
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

Tetris.prototype.setUpKeyEvents = function (startGame) {
	var that = this;

	if(startGame) {
		document.body.onkeydown = function ( e ) {
			if (e.keyCode === 37 || e.keyCode === 40 || e.keyCode === 39 || e.keyCode === 32)
				that.moveTetromino(e.keyCode, that.currTetromino);
			else if (e.keyCode === 38)
				that.rotateTetromino(e.keyCode);
		};
	} else {
				
		document.body.onkeydown = function ( e ) {

		}
	}
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

// Rotates this.currTetromino
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

Tetris.prototype.moveTetromino = function (keyCode, tetromino) {

	var potentialTopLeftRow;
	var potentialTopLeftCol;

	if (keyCode === 37) { // Left
		potentialTopLeftRow = tetromino.topLeft.row;
		potentialTopLeftCol = tetromino.topLeft.col - 1;
	} else if (keyCode === 39) { // Right
		potentialTopLeftRow = tetromino.topLeft.row;
		potentialTopLeftCol = tetromino.topLeft.col + 1;
	} else if (keyCode === 40) { // Down
		potentialTopLeftRow = tetromino.topLeft.row + 1;
		potentialTopLeftCol = tetromino.topLeft.col;
	} else if (keyCode === 32 || keyCode === -1) { // SpaceBar
		potentialTopLeftRow = tetromino.topLeft.row;
		potentialTopLeftCol = tetromino.topLeft.col;
		while (this.checkCollisions(++potentialTopLeftRow, potentialTopLeftCol, tetromino)) {
			tetromino.topLeft.row = potentialTopLeftRow;
		}
	} else {
		return false;
	}
	
	if (this.checkCollisions(potentialTopLeftRow, potentialTopLeftCol, tetromino)) {
		// the Tetromino can move to new position 
   		tetromino.topLeft.row = potentialTopLeftRow;
   		tetromino.topLeft.col = potentialTopLeftCol;
   		this.renderEngine.render();
   		return true;
	} else {
    	if (keyCode === 40 || keyCode === 32 || keyCode === -1) { // the Tetromino cannot move down so the shape will land
    		this.landTetromino(tetromino);
    		if (keyCode !== -1)
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

Tetris.prototype.landTetromino = function (tetromino) {
   	for (var row = 0; row < tetromino.length; row++) {
    	for (var col = 0; col < tetromino[row].length; col++) {
	        if (tetromino[row][col] != 0) 
	        	this.landedGrid[tetromino.topLeft.row + row][tetromino.topLeft.col + col] = tetromino[row][col];
	    }
   	}

   	this.clearRowsAdvance();
   	this.addTetromino();

};

Tetris.prototype.addTetromino = function () {
	if (this.tetrominoOrder.length === 0) 
		this.randomizeTetrominoOrder();

	this.currTetromino = this.tetrominoOrder.pop();
	this.currTetromino.topLeft = {row: 0, col: Math.floor(this.width/2) - Math.floor(this.currTetromino[0].length/2)};
	

	if (!this.checkCollisions(this.currTetromino.topLeft.row, this.currTetromino.topLeft.col, this.currTetromino)) {
		this.gameOver();
	}

	 

};

Tetris.prototype.clearRowsBasic = function () {

	for (var i = 0, len = this.landedGrid.length; i < len; i++) {
		if (this.landedGrid[i].indexOf(0) === -1)  { // no 0's means row is filled
			this.landedGrid.splice(i, 1);
			this.landedGrid.unshift(this.newRow(this.width));
		}
	}
};

Tetris.prototype.clearRowsAdvance = function () {
	var lastRowCleared;

	for (var i = 0, len = this.landedGrid.length; i < len; i++) {
		if (this.landedGrid[i].indexOf(0) === -1)  { // no 0's means row is filled
			this.landedGrid.splice(i, 1, this.newRow(this.width));
			lastRowCleared = i;
		}
	}

	if (lastRowCleared !== undefined) {

		var clumps = this.findClumps(lastRowCleared); // from this row up, we need to find the 'clumps' of blocks and treat them as falling Tetrominos
		
		while (clumps.length > 0) {
			this.moveTetromino(-1, clumps.pop());
		}
	}
};

// need to remove found clumps from game board, then treat them as falling tetriminos
Tetris.prototype.findClumps = function (clearedRowIndex) {
	var clumps = [];

	var remainderBoard = this.landedGrid.slice(0, clearedRowIndex);
	var remainderBoardCopy = this.deepCopy(remainderBoard);
	
	for (var i = 0, len = remainderBoard.length; i < len; i++) {
		for (var j = 0, len2 = remainderBoard[i].length; j < len2; j++) {
			if (remainderBoard[i][j] > 0) {
				var rowColRange = { minRow: i, minCol: j, maxRow: i, maxCol: j };
				this.findRowColRange(i, j, rowColRange, remainderBoard);
				
				var clump = [];

				for (var k = rowColRange.minRow; k <= rowColRange.maxRow; k++)
					clump.push(this.newRow((rowColRange.maxCol + 1) - rowColRange.minCol));
				clump.topLeft = {row: rowColRange.minRow, col: rowColRange.minCol};

				clumps.push(clump);				
			}
		}
	}

	clumps.forEach( function(clump) {

		for (var a = 0, len = clump.length; a < len; a++) {
			for (var b = 0, len2 = clump[0].length; b < len2; b++) {
				if ( remainderBoardCopy[clump.topLeft.row + a][clump.topLeft.col + b] > 0 ) {
					//console.log("Row: " + (clump.topLeft.row + a) + " Col: " + (clump.topLeft.col + b));
					clump[a][b] = remainderBoardCopy[clump.topLeft.row + a][clump.topLeft.col + b];
				}
			}
		}

	});

	return clumps;
};

Tetris.prototype.deepCopy = function (outerArray) { 
	return outerArray.map(function(innerArray) {
    	return innerArray.slice();
	}); 
};

Tetris.prototype.findRowColRange = function (boardRow, boardCol, rowColRange, remainderBoard) {
	if (remainderBoard[boardRow] && remainderBoard[boardRow][boardCol] && remainderBoard[boardRow][boardCol] > 0) {
        
        if (boardRow < rowColRange.minRow)
        	rowColRange.minRow = boardRow;

        if (boardCol < rowColRange.minCol)
        	rowColRange.minCol = boardCol;

        if (boardRow > rowColRange.maxRow)
        	rowColRange.maxRow = boardRow;

        if (boardCol > rowColRange.maxCol)
        	rowColRange.maxCol = boardCol;

        remainderBoard[boardRow][boardCol] = 0; // mark the board as -1 when finding clump ranges. When we copy the clump to the board we 
        this.findRowColRange(boardRow, boardCol + 1, rowColRange, remainderBoard);
        this.findRowColRange(boardRow + 1, boardCol, rowColRange, remainderBoard);
        this.findRowColRange(boardRow - 1, boardCol, rowColRange, remainderBoard);
        this.findRowColRange(boardRow, boardCol - 1, rowColRange, remainderBoard);
    }
};

Tetris.prototype.gameOver = function () { 
	clearInterval(this.intervalID);
	this.renderEngine.render();
	this.setUpKeyEvents(false);
};

Tetris.prototype.setPlay = function (speed) {
	if (this.testing)
		return;

	clearInterval(this.intervalID);
	
	var that = this;

	this.intervalID = window.setInterval( function() {
 		that.moveTetromino(40, that.currTetromino);
 	}, speed );
};

