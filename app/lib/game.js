var tetrominos = require('./tetrominos');
var RenderEngine = require('./render');

function Tetris(height, width, speed) {
	this.landedGrid = this.generateBoard(height, width);
	this.height = this.landedGrid.length;
	this.width = this.landedGrid[0].length;
	this.currTetromino;
	this.nextTetromino;
	this.tetrominoOrder = [];
	this.rotationIndex = 0; 
	this.currScore = 0;
	this.currLevel = 1;
	this.currLinesCleared = 0;
	this.renderEngine = new RenderEngine(this);
	this.randomizeTetrominoOrder();
	this.addTetromino();
	this.setUpKeyEvents(true);
	this.renderEngine.renderGameBoard();
	this.intervalID;
	
	if (speed) {
		this.playSpeed = speed;
		this.setPlay(this.playSpeed);
	}

	this.keyCodes = {
		37: 'left',
		39: 'right',
		40: 'down',
		38: 'up',
		32: 'spacebar'
	};
}

Tetris.prototype.newRow = function (width) {
	var row = [];
	for (var i = 0; i < width; i++) {
	   	row[i] = null;
	}

	return row;
};

// create empty height x width board
Tetris.prototype.generateBoard = function (height, width) {
	var gameArray = [];

	for (var i = 0; i < height; i++) {
		gameArray.push(this.newRow(width));
   	}

	return gameArray;
};

Tetris.prototype.setUpKeyEvents = function (startGame) {
	var that = this;

	if(startGame) {
		document.body.onkeydown = function ( e ) {
			if (e.keyCode === 37 || e.keyCode === 40 || e.keyCode === 39 || e.keyCode === 32)
				that.moveTetromino(that.keyCodes[e.keyCode], that.currTetromino);
			else if (e.keyCode === 38)
				that.rotateTetromino();
		};
	} else {	
		document.body.onkeydown = function ( e ) {}
	}
};

Tetris.prototype.randomizeTetrominoOrder = function () {
	//Randomize array element order in-place. Using Fisher-Yates shuffle algorithm.
	var shuffleArray = function (tetrominos) {
	    for (var i = tetrominos.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = tetrominos[i];
	        tetrominos[i] = tetrominos[j];
	        tetrominos[j] = temp;
	    }
	}

	this.tetrominoOrder = [
		this.copyTetromino(tetrominos.I), 
		this.copyTetromino(tetrominos.J), 
		this.copyTetromino(tetrominos.L),
		this.copyTetromino(tetrominos.O), 
		this.copyTetromino(tetrominos.S), 
		this.copyTetromino(tetrominos.T), 
		this.copyTetromino(tetrominos.Z), 
	];
	
	shuffleArray(this.tetrominoOrder);
};

// Create a deep copy of the tetromino
Tetris.prototype.copyTetromino = function (tetromino) {
	var copy = [];

	for (var i = 0, len = tetromino.length; i < len; i++) {
		if (!copy[i]) {
			copy[i] = [];
		}

		for (var j = 0, len2 = tetromino[i].length; j < len2; j++) {
			copy[i][j] = tetromino[i][j] === null ? null : {color: tetromino[i][j].color, block: tetromino[i][j].block}
		}
	}

	return copy;
};

// Rotates this.currTetromino 90 degrees clockwise and checks if collisions occur
Tetris.prototype.rotateTetromino = function () {
	// place rotated currTetromino into potentialTetromino
	var potentialTetromino = []; 
	for (var i = 0, len = this.currTetromino.length; i < len; i++) {
		for (var j = 0, len2 = this.currTetromino[i].length; j < len2; j++) {
			if (!potentialTetromino[j]) {
				potentialTetromino[j] = [];
			}

			potentialTetromino[j].unshift(this.currTetromino[i][j]);	
		}
	}

	// check if the rotated tetromino can fit on the board
	potentialTetromino.topLeft = this.currTetromino.topLeft;
	if (this.checkCollisions(potentialTetromino.topLeft.row, potentialTetromino.topLeft.col, potentialTetromino)) {
		this.currTetromino = potentialTetromino;
		this.renderEngine.renderGameBoard();
		return true;
	} else {
		return false;
	}
};

Tetris.prototype.moveTetromino = function (keyCode, tetromino) {

	var potentialTopLeftRow;
	var potentialTopLeftCol;

	if (keyCode === 'left') {
		potentialTopLeftRow = tetromino.topLeft.row;
		potentialTopLeftCol = tetromino.topLeft.col - 1;
	} else if (keyCode === 'right') {
		potentialTopLeftRow = tetromino.topLeft.row;
		potentialTopLeftCol = tetromino.topLeft.col + 1;
	} else if (keyCode === 'down') {
		potentialTopLeftRow = tetromino.topLeft.row + 1;
		potentialTopLeftCol = tetromino.topLeft.col;
		this.renderEngine.drawScore(++this.currScore);
	} else if (keyCode === 'tick') { 
		potentialTopLeftRow = tetromino.topLeft.row + 1;
		potentialTopLeftCol = tetromino.topLeft.col;
	} else if (keyCode === 'spacebar') { 
		potentialTopLeftRow = tetromino.topLeft.row;
		potentialTopLeftCol = tetromino.topLeft.col;

		var rowsDropped = 0;
		while (this.checkCollisions(++potentialTopLeftRow, potentialTopLeftCol, tetromino)) {
			tetromino.topLeft.row = potentialTopLeftRow;
			rowsDropped++;
		}

		this.currScore += rowsDropped * 2;
		this.renderEngine.drawScore(this.currScore);
	} else if (keyCode === 'clumpdrop') {
		potentialTopLeftRow = tetromino.topLeft.row;
		potentialTopLeftCol = tetromino.topLeft.col;

		while (this.checkCollisions(++potentialTopLeftRow, potentialTopLeftCol, tetromino)) {
			tetromino.topLeft.row = potentialTopLeftRow;
		}

	} else {
		return false;
	}
	
	if (this.checkCollisions(potentialTopLeftRow, potentialTopLeftCol, tetromino)) { // the Tetromino can move to new position 
   		tetromino.topLeft.row = potentialTopLeftRow;
   		tetromino.topLeft.col = potentialTopLeftCol;

   		this.renderEngine.renderGameBoard();
   		return true;
	} else {
    	if (keyCode === 'down' || keyCode === 'spacebar' || keyCode === 'clumpdrop' || keyCode === 'tick') { // the Tetromino cannot move down so the shape will land
    		this.landTetromino(tetromino);
    		if (keyCode !== 'clumpdrop') {
   				this.addTetromino();
    			this.renderEngine.renderGameBoard();
    		}
   			return true;
    	}

    	return false;
	}
};

Tetris.prototype.checkCollisions = function (potentialTopLeftRow, potentialTopLeftCol, potentialTetromino) {
	for (var row = 0, len = potentialTetromino.length; row < len; row++) {
    	for (var col = 0, len2 = potentialTetromino[row].length; col < len2; col++) {

	        if ((potentialTetromino[row][col] !== null) &&  // Is this block actually part of the Tetromino shape? And either:
	        	((this.landedGrid[potentialTopLeftRow + row] === undefined || this.landedGrid[potentialTopLeftRow + row][potentialTopLeftCol + col] === undefined) || // this block of the Tetromino is now out of bounds, Or:
	        	(this.landedGrid[potentialTopLeftRow + row][potentialTopLeftCol + col] !== null))) { // there is already a landed block at this spot
	                //if so, then the space is taken
	            return false;
	        }
	    }
   	}

   	return true;
};

Tetris.prototype.landTetromino = function (tetromino) {
   	for (var row = 0, len = tetromino.length; row < len; row++) {
    	for (var col = 0, len2 = tetromino[row].length; col < len2; col++) {
	        if (tetromino[row][col] !== null) 
	        	this.landedGrid[tetromino.topLeft.row + row][tetromino.topLeft.col + col] = tetromino[row][col];
	    }
   	}

   	this.clearRowsAdvance();
};

Tetris.prototype.addTetromino = function () {
	this.currTetromino = this.tetrominoOrder.shift();

	if (this.tetrominoOrder.length === 0) {
		this.randomizeTetrominoOrder();
	}

	// Point at the next tetromino in the queue for the 'next' board can render it
	this.nextTetromino = this.tetrominoOrder[0];
	this.renderEngine.renderNextBoard();
	this.currTetromino.topLeft = {row: 0, col: Math.floor(this.width/2) - Math.floor(this.currTetromino[0].length/2)};
	
	// the game is over when a new tetromino is placed on the board but immediatly collides with another tetromino 
	if (!this.checkCollisions(this.currTetromino.topLeft.row, this.currTetromino.topLeft.col, this.currTetromino)) {
		this.gameOver();
	}
};

Tetris.prototype.clearRowsBasic = function () {
	var rowsCleared = 0;

	for (var i = 0, len = this.landedGrid.length; i < len; i++) {
		if (this.landedGrid[i].indexOf(null) === -1)  { // no null's means row is filled
			this.landedGrid.splice(i, 1);
			this.landedGrid.unshift(this.newRow(this.width));
			rowsCleared++;
		}
	}

	this.calculateRowCombo(rowsCleared);
};

Tetris.prototype.clearRowsAdvance = function () {
	var lastRowCleared;
	var rowsCleared = 0;
	for (var i = 0, len = this.landedGrid.length; i < len; i++) {
		if (this.landedGrid[i].indexOf(null) === -1)  { // no null's means row is filled. Need to replace it with empty row
			this.renderEngine.renderLineClearAnimation(this.landedGrid[i]); // line render animation will go here
			this.landedGrid.splice(i, 1, this.newRow(this.width));
			rowsCleared++;
			lastRowCleared = i;
		}
	}

	if (lastRowCleared !== undefined) {
		this.calculateRowCombo(rowsCleared);
		var clumps = this.findClumps(lastRowCleared); // from this row up, we need to find the 'clumps' of blocks and treat them as falling Tetrominos
		
		while (clumps.length > 0) {
			this.moveTetromino('clumpdrop', clumps.pop());
		}
	}

	this.renderEngine.renderGameBoard();
};

Tetris.prototype.calculateRowCombo = function (rowsCleared) {
	this.currLinesCleared += rowsCleared;
	this.currScore += (100 + (rowsCleared - 1) * 200) * this.currLevel;
	this.renderEngine.drawScore(this.currScore);
	this.renderEngine.drawLinesCleared(this.currLinesCleared);
	this.levelUp();
};

Tetris.prototype.levelUp = function() {
	if (this.currLinesCleared / 10 >= this.currLevel) {
		this.currLevel++;
		this.playSpeed = this.playSpeed / 1.3;
		this.setPlay(this.playSpeed);
		this.renderEngine.drawLevel(this.currLevel);
	}
};

// need to remove 'clumps' of blocks from game board, then treat them as falling tetriminos
Tetris.prototype.findClumps = function (clearedRowIndex) {
	var clumps = [];

	var remainderBoard = this.landedGrid.slice(0, clearedRowIndex);
	var bitArray = this.generateBitArray(remainderBoard); // 2d array representing the remaining board in 0's and 1's. Used to find the max/min height/length of clumps
	
	for (var i = 0, len = bitArray.length; i < len; i++) {
		for (var j = 0, len2 = bitArray[i].length; j < len2; j++) {
			if (bitArray[i][j] !== 0) { // a clump starts here. Now we use the findRowColRange to get the max/min height/length
				var rowColRange = { minRow: i, minCol: j, maxRow: i, maxCol: j };
				this.findRowColRange(i, j, rowColRange, bitArray); // recursive function to find max/min height/length of clump. Results will be placed in rowColRange variable
				clumps.push(this.extractClumpFromBoard(rowColRange, remainderBoard));
			}
		}
	}

	return clumps;
};

// After finding the first block of a clump, this function is called to find the clump's row/col range and remove it from the gameboard
Tetris.prototype.extractClumpFromBoard = function (rowColRange, remainderBoard) {
	// create the empty 2d clump array
	var clump = [];
	for (var k = rowColRange.minRow; k <= rowColRange.maxRow; k++) {
		clump.push(this.newRow((rowColRange.maxCol + 1) - rowColRange.minCol));
	}
	clump.topLeft = {row: rowColRange.minRow, col: rowColRange.minCol};

	// copy the shapes form the game board to the clump array and null the spot in the gameboard
	for (var a = 0, len = clump.length; a < len; a++) {
		for (var b = 0, len2 = clump[a].length; b < len2; b++) {
			if (remainderBoard[clump.topLeft.row + a][clump.topLeft.col + b] !== null) {
				clump[a][b] = remainderBoard[clump.topLeft.row + a][clump.topLeft.col + b];
				remainderBoard[clump.topLeft.row + a][clump.topLeft.col + b] = null;
			}
		}
	}

	return clump;
};

// creates a 2d array of the remaining board that will be used to find clump tetrominos
Tetris.prototype.generateBitArray = function (originalArray) { 

	var bitArray = [];

	for (var i = 0, len = originalArray.length; i < len; i++) {
		if (bitArray[i] === undefined) {
			bitArray[i] = [];
		}

		for (var j = 0, len2 = originalArray[i].length; j < len2; j++) {
			bitArray[i][j] = originalArray[i][j] === null ? 0 : 1;
		}
	}

	return bitArray;
};

// Recursive function to find the minRow, minCol, maxRow, and maxCol, of a clump. The blocks in this range are sliced out and become a clump.
// Uses Flood Fill alghoritm 
Tetris.prototype.findRowColRange = function (boardRow, boardCol, rowColRange, bitArray) {
	if (bitArray[boardRow] && bitArray[boardRow][boardCol] && bitArray[boardRow][boardCol] !== 0) {
        
        if (boardRow < rowColRange.minRow)
        	rowColRange.minRow = boardRow;

        if (boardCol < rowColRange.minCol)
        	rowColRange.minCol = boardCol;

        if (boardRow > rowColRange.maxRow)
        	rowColRange.maxRow = boardRow;

        if (boardCol > rowColRange.maxCol)
        	rowColRange.maxCol = boardCol;

        bitArray[boardRow][boardCol] = 0; // mark the board in the bitArray as 0 after evaluating this index, to avoid a infinite loop
        this.findRowColRange(boardRow, boardCol + 1, rowColRange, bitArray);
        this.findRowColRange(boardRow + 1, boardCol, rowColRange, bitArray);
        this.findRowColRange(boardRow - 1, boardCol, rowColRange, bitArray);
        this.findRowColRange(boardRow, boardCol - 1, rowColRange, bitArray);
    }
};

Tetris.prototype.gameOver = function () { 
	clearInterval(this.intervalID);
	this.renderEngine.renderGameBoard();
	this.setUpKeyEvents(false);

	this.renderEngine.drawGameOver();
};

Tetris.prototype.setPlay = function (speed) {
	clearInterval(this.intervalID);
	
	var that = this;

	this.intervalID = window.setInterval( function() {
 		that.moveTetromino('tick', that.currTetromino);
 	}, speed);
};

module.exports = Tetris;
