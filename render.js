function RenderEngine(game) {
    this.canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
    this.ctx = canvas.getContext( '2d' );
    this.game = game;
    this.BLOCK_WIDTH = 20;
    this.BLOCK_HEIGHT = 20; 
    this.BOARD_WIDTH = this.BLOCK_WIDTH * this.game.width;
    this.BOARD_HEIGHT = this.BLOCK_HEIGHT * this.game.height;
    this.canvas.setAttribute("width", this.BOARD_WIDTH);
    this.canvas.setAttribute("height", this.BOARD_HEIGHT);    
};


//draw a single square at (x, y)
RenderEngine.prototype.drawBlock = function( i, j ) {
    this.ctx.fillRect( this.BLOCK_WIDTH * j, this.BLOCK_HEIGHT * i, this.BLOCK_WIDTH - 1 , this.BLOCK_HEIGHT - 1 );
    this.ctx.strokeRect( this.BLOCK_WIDTH * j, this.BLOCK_HEIGHT * i, this.BLOCK_WIDTH - 1 , this.BLOCK_HEIGHT - 1 );
};

// draws the landed board and the current Tetromino
RenderEngine.prototype.render = function() {
    this.ctx.clearRect( 0, 0, this.BOARD_WIDTH, this.BOARD_HEIGHT );

    // render the landed grid
    this.ctx.fillStyle = 'green';
    this.ctx.strokeStyle = 'black';
    for ( var i = 0; i < this.game.height; i++ ) {
        for ( var j = 0; j < this.game.width; j++ ) {
            if ( this.game.landedGrid[ i ][ j ] ) {
                this.drawBlock( i, j );
            }
        }
    }

    // render the current Tetromino
    this.ctx.fillStyle = 'red';
    this.ctx.strokeStyle = 'black';
    for ( var i = 0; i < this.game.currTetromino.length; i++ ) {
        for ( var j = 0; j < this.game.currTetromino[0].length; j++ ) {
            if ( this.game.currTetromino[ i ][ j ] ) {
                // this.ctx.fillStyle = colors[ current[ y ][ x ] - 1 ];
                this.drawBlock( this.game.currTetromino.topLeft.row + i, this.game.currTetromino.topLeft.col + j );
            }
        }
    }
};