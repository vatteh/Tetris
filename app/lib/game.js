var tetrominos = require('./tetrominos');
var RenderEngine = require('./render');

function Tetris(height, width, testing) {
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
	this.renderEngine = new RenderEngine(this, testing);
	this.randomizeTetrominoOrder();
	this.addTetromino();
	this.setUpKeyEvents(true);
	this.testing = testing;
	this.renderEngine.renderGameBoard();

	this.intervalID;
	this.playSpeed = 1000;
	this.setPlay(this.playSpeed);

	this.keyCodes = {
		37: 'left',
		39: 'right',
		40: 'down',
		38: 'up',
		32: 'spacebar'
	};

}

Tetris.prototype.newRow = function (width) {
	var row = new Array();
	for (var i = 0; i < width; i++)
	   	row[i] = undefined;

	return row;
};

Tetris.prototype.generateBoard = function (height, width) {

	var gameArray = [];

	// create empty height x width board
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
	var shuffleArray = function (aRay) {
	    for (var i = aRay.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = aRay[i];
	        aRay[i] = aRay[j];
	        aRay[j] = temp;
	    }
	}

	this.tetrominoOrder = [
		tetrominos.I, 
		tetrominos.J, 
		tetrominos.L, 
		tetrominos.O, 
		tetrominos.S, 
		tetrominos.T, 
		tetrominos.Z 
	   ];
	
	shuffleArray(this.tetrominoOrder);
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

	if (keyCode === 'left') { // Left
		potentialTopLeftRow = tetromino.topLeft.row;
		potentialTopLeftCol = tetromino.topLeft.col - 1;
	} else if (keyCode === 'right') { // Right
		potentialTopLeftRow = tetromino.topLeft.row;
		potentialTopLeftCol = tetromino.topLeft.col + 1;
	} else if (keyCode === 'down') { // Down
		potentialTopLeftRow = tetromino.topLeft.row + 1;
		potentialTopLeftCol = tetromino.topLeft.col;
		this.renderEngine.drawScore(++this.currScore);
	} else if (keyCode === 'tick') { // tick
		potentialTopLeftRow = tetromino.topLeft.row + 1;
		potentialTopLeftCol = tetromino.topLeft.col;
	} else if (keyCode === 'spacebar') { // SpaceBar
		potentialTopLeftRow = tetromino.topLeft.row;
		potentialTopLeftCol = tetromino.topLeft.col;

		var rowsDropped = 0;
		while (this.checkCollisions(++potentialTopLeftRow, potentialTopLeftCol, tetromino)) {
			tetromino.topLeft.row = potentialTopLeftRow;
			rowsDropped++;
		}

		this.currScore += rowsDropped * 2;
		this.renderEngine.drawScore(this.currScore);
	} else if (keyCode === 'clumpdrop') { // clump drop
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

};

Tetris.prototype.addTetromino = function () {
	this.currTetromino = this.tetrominoOrder.shift();

	if (this.tetrominoOrder.length === 0) {
		this.randomizeTetrominoOrder();
	}

	this.nextTetromino = this.tetrominoOrder[0];
	this.renderEngine.renderNextBoard();
	this.currTetromino.topLeft = {row: 0, col: Math.floor(this.width/2) - Math.floor(this.currTetromino[0].length/2)};
	
	if (!this.checkCollisions(this.currTetromino.topLeft.row, this.currTetromino.topLeft.col, this.currTetromino)) {
		this.gameOver();
	}

};

Tetris.prototype.clearRowsBasic = function () {

	var rowCombo = 0;

	for (var i = 0, len = this.landedGrid.length; i < len; i++) {
		if (this.landedGrid[i].indexOf(0) === -1)  { // no 0's means row is filled
			this.landedGrid.splice(i, 1);
			this.landedGrid.unshift(this.newRow(this.width));
			rowCombo++;
		}
	}

	this.calculateRowCombo(rowCombo);
};

Tetris.prototype.clearRowsAdvance = function () {
	var lastRowCleared;
	var rowCombo = 0;
	var lineClearIndexes = [];
	for (var i = 0, len = this.landedGrid.length; i < len; i++) {
		if (this.landedGrid[i].indexOf(0) === -1)  { // no 0's means row is filled
			lineClearIndexes.push(i);
			rowCombo++;
			lastRowCleared = i;
		}
	}

	//this.renderEngine.renderLineClearAnimation(lineClearIndexes);

	// find way to pause
	lineClearIndexes.forEach(function(element) {
		this.landedGrid.splice(element, 1, this.newRow(this.width));
	}.bind(this));

	if (lastRowCleared !== undefined) {
		this.calculateRowCombo(rowCombo);
		var clumps = this.findClumps(lastRowCleared); // from this row up, we need to find the 'clumps' of blocks and treat them as falling Tetrominos
		
		while (clumps.length > 0) {
			this.moveTetromino('clumpdrop', clumps.pop());
		}
	}

	this.renderEngine.renderGameBoard();

};

Tetris.prototype.calculateRowCombo = function( rowsCleared ) {
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

// need to remove found clumps from game board, then treat them as falling tetriminos
Tetris.prototype.findClumps = function ( clearedRowIndex ) {
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
	this.renderEngine.renderGameBoard();
	this.setUpKeyEvents(false);

	this.renderEngine.drawGameOver();
};

Tetris.prototype.setPlay = function (speed) {
	if (this.testing)
		return;

	clearInterval(this.intervalID);
	
	var that = this;

	this.intervalID = window.setInterval( function() {
 		that.moveTetromino('tick', that.currTetromino);
 	}, speed );
};

(function() {
	var game = new Tetris(16, 10, false);
})();

