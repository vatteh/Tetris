function RenderEngine(game, testing) {
    this.testing = testing;  

    if (testing)
        return;

    this.canvas = document.getElementById( 'gameboard' );
    this.ctx = this.canvas.getContext( '2d' );
    this.game = game;
    this.BLOCK_WIDTH = 30;
    this.BLOCK_HEIGHT = 30; 
    this.BOARD_WIDTH = this.BLOCK_WIDTH * this.game.width;
    this.BOARD_HEIGHT = this.BLOCK_HEIGHT * this.game.height;
    this.canvas.setAttribute("width", this.BOARD_WIDTH);
    this.canvas.setAttribute("height", this.BOARD_HEIGHT); 
    this.tetrominoColors = [['','',''],
                            ['rgb(0,201,255)','rgb(56,255,255)','rgb(0,224,255)','rgb(100, 240, 253)'], // cyan
                            ['rgb(28,117,188)','rgb(0,224,255)','rgb(0,165,224)','rgb(63, 187, 231)'], // blue
                            ['rgb(241,90,41)','rgb(251,176,64)','rgb(247,148,30)','rgb(247, 172, 86)'], // orange
                            ['rgb(255,189,0)','rgb(255,255,50)','rgb(255,227,87)','rgb(252, 237, 145)'], // yellow
                            ['rgb(57,161,74)','rgb(156,255,0)','rgb(84,214,0)','rgb(123, 219, 69)'], // green
                            ['rgb(127,63,152)','rgb(235,184,255)','rgb(201,115,255)','rgb(213, 148, 252)'], // purple
                            ['rgb(190,30,45)','rgb(255,148,150)','rgb(255,36,55)','rgb(254, 102, 115)'] // red
                            ];     // dark, light, base

    this.nextBoard = document.getElementById( 'nextboard' );
    this.nextCtx = this.nextBoard.getContext( '2d' );
    this.NEXT_BOARD_WIDTH = this.BLOCK_WIDTH * 5;
    this.NEXT_BOARD_HEIGHT = this.BLOCK_HEIGHT * 5;
    this.nextBoard.setAttribute("width", this.NEXT_BOARD_WIDTH);
    this.nextBoard.setAttribute("height", this.NEXT_BOARD_HEIGHT); 

    this.level = document.getElementById( 'level' );
    this.linesCleared = document.getElementById( 'linesCleared' );
    this.score = document.getElementById( 'score' );
    this.gameOver = document.getElementById( 'game-over' );

    this.drawLevel( 1 );
    this.drawLinesCleared( 0 );
    this.drawScore( 0 );

};

RenderEngine.prototype.drawLevel = function( level ) {
    if (this.testing)
        return;
    this.level.innerHTML = "Current Level: " + level;
};

RenderEngine.prototype.drawLinesCleared = function( linesCleared ) {
    if (this.testing)
        return;
    this.linesCleared.innerHTML = "Lines Cleared: " + linesCleared;
};

RenderEngine.prototype.drawScore = function( score ) {
    if (this.testing)
        return;
    this.score.innerHTML = "Score: " + score;
};

RenderEngine.prototype.drawGameOver = function() {
    if (this.testing)
        return;
    this.gameOver.innerHTML = "Game Over";
};

//draw a single square at (x, y)
RenderEngine.prototype.drawBlock = function( i, j, colorArray, ctx) {
    
    // light
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.fillStyle = colorArray[1];
    ctx.fillRect( this.BLOCK_WIDTH * j, this.BLOCK_HEIGHT * i, this.BLOCK_WIDTH - 1 , this.BLOCK_HEIGHT - 1 );

    // dark
    ctx.fillStyle = colorArray[0];
    ctx.beginPath();
    ctx.moveTo( this.BLOCK_WIDTH * j, this.BLOCK_HEIGHT * i);
    ctx.lineTo( this.BLOCK_WIDTH * j, this.BLOCK_HEIGHT * i + this.BLOCK_HEIGHT - 1 );
    ctx.lineTo( this.BLOCK_WIDTH * j + this.BLOCK_WIDTH - 1, this.BLOCK_HEIGHT * i + this.BLOCK_HEIGHT - 1 );
    ctx.fill();

    // base
    var bevelThickness = this.BLOCK_WIDTH / 6;
    ctx.fillStyle = colorArray[2];
    ctx.fillRect( this.BLOCK_WIDTH * j + bevelThickness, this.BLOCK_HEIGHT * i + bevelThickness, this.BLOCK_WIDTH - 1 - (bevelThickness * 2), this.BLOCK_HEIGHT - 1 - (bevelThickness * 2) );
    ctx.strokeRect( this.BLOCK_WIDTH * j, this.BLOCK_HEIGHT * i, this.BLOCK_WIDTH - 1 , this.BLOCK_HEIGHT - 1 );

    // highlight
    var highlightThickness = bevelThickness / 2;
    ctx.lineWidth = 0.5;
    ctx.fillStyle = colorArray[3];
    ctx.beginPath();
    ctx.moveTo( this.BLOCK_WIDTH * j + bevelThickness, this.BLOCK_HEIGHT * i + bevelThickness );
    ctx.lineTo( this.BLOCK_WIDTH * j + bevelThickness, this.BLOCK_HEIGHT * i + bevelThickness + (this.BLOCK_HEIGHT - bevelThickness*2) );
    ctx.lineTo( this.BLOCK_WIDTH * j + bevelThickness + (this.BLOCK_WIDTH - bevelThickness*2), this.BLOCK_HEIGHT * i + bevelThickness + (this.BLOCK_HEIGHT - bevelThickness*2) );
    ctx.lineTo( this.BLOCK_WIDTH * j + bevelThickness + highlightThickness, this.BLOCK_HEIGHT * i + bevelThickness + (this.BLOCK_HEIGHT - bevelThickness*2) - highlightThickness );
    ctx.closePath();
    ctx.fill();

};

// draws the landed board and the current Tetromino
RenderEngine.prototype.render = function() {
    if (this.testing)
        return;

    this.ctx.clearRect( 0, 0, this.BOARD_WIDTH, this.BOARD_HEIGHT );

    this.renderGhost();
    // render the landed grid
    this.ctx.strokeStyle = 'black';
    for ( var i = 0; i < this.game.landedGrid.length; i++ ) {
        for ( var j = 0; j < this.game.landedGrid[0].length; j++ ) {
            if ( this.game.landedGrid[ i ][ j ] ) {
                this.drawBlock( i, j, this.tetrominoColors[ this.game.landedGrid[ i ][ j ] ], this.ctx);
            }
        }
    }

    // render the current Tetromino
    this.ctx.strokeStyle = 'white';
    for ( var i = 0; i < this.game.currTetromino.length; i++ ) {
        for ( var j = 0; j < this.game.currTetromino[0].length; j++ ) {
            if ( this.game.currTetromino[ i ][ j ] ) {
                this.drawBlock( this.game.currTetromino.topLeft.row + i, this.game.currTetromino.topLeft.col + j, this.tetrominoColors[ this.game.currTetromino[ i ][ j ] ], this.ctx);
            }
        }
    }
};

RenderEngine.prototype.renderGhost = function() {
    if (this.testing)
        return;
    var potentialGhostTopLeftRow = this.game.currTetromino.topLeft.row;
    var ghostTopLeftRow = this.game.currTetromino.topLeft.row;
    var ghostTopLeftCol = this.game.currTetromino.topLeft.col;

    while (this.game.checkCollisions(++potentialGhostTopLeftRow, this.game.currTetromino.topLeft.col, this.game.currTetromino)) {
        ghostTopLeftRow = potentialGhostTopLeftRow;
    }

    // render the current Tetromino
    this.ctx.lineWidth = 1.5;
    this.ctx.lineJoin = 'round';
    this.ctx.fillStyle = 'grey';
    for ( var i = 0; i < this.game.currTetromino.length; i++ ) {
        for ( var j = 0; j < this.game.currTetromino[0].length; j++ ) {
            if ( this.game.currTetromino[ i ][ j ] ) {
                this.ctx.fillRect( this.BLOCK_WIDTH * (j + ghostTopLeftCol) + 1, this.BLOCK_HEIGHT * (i + ghostTopLeftRow) + 1, this.BLOCK_WIDTH - 3 , this.BLOCK_HEIGHT - 3 );
            }
        }
    }
    
};

RenderEngine.prototype.renderNextBoard = function() {
    if (this.testing)
        return;

    this.nextCtx.clearRect( 0, 0, this.NEXT_BOARD_WIDTH, this.NEXT_BOARD_HEIGHT );

    //calculate the middle of this tetriminto
    var nextTetrominoMiddleH = this.game.nextTetromino.length / 2; 
    var nextTetrominoMiddleW = this.game.nextTetromino[0].length / 2;

    var nextBoardMiddleH = this.NEXT_BOARD_HEIGHT / this.BLOCK_HEIGHT / 2;
    var nextBoardMiddleW = this.NEXT_BOARD_WIDTH / this.BLOCK_WIDTH / 2;

    var heightOffset = nextBoardMiddleH - nextTetrominoMiddleH;
    var widthOffset = nextBoardMiddleW - nextTetrominoMiddleW;

    // render the next board
    this.nextCtx.strokeStyle = 'white';
    for ( var i = 0; i < this.game.nextTetromino.length; i++ ) {
        for ( var j = 0; j < this.game.nextTetromino[0].length; j++ ) {
            if ( this.game.nextTetromino[ i ][ j ] ) {
                this.drawBlock( heightOffset + i, widthOffset + j, this.tetrominoColors[ this.game.nextTetromino[ i ][ j ] ], this.nextCtx);
            }
        }
    }
};
