function RenderEngine(game) {
    this.canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
    this.ctx = canvas.getContext( '2d' );
    this.game = game;
    this.BLOCK_WIDTH = 20;
    this.BLOCK_HEIGHT = 20; 
    this.BOARD_WIDTH = this.canvas.width;
    this.BOARD_HEIGHT = this.canvas.height;
    
};


//draw a single square at (x, y)
Tetris.prototype.drawBlock = function( x, y ) {
    this.ctx.fillRect( BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1 , BLOCK_H - 1 );
    this.ctx.strokeRect( BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1 , BLOCK_H - 1 );
};

// draws the board and the moving shape
Tetris.prototype.render = function() {
    this.ctx.clearRect( 0, 0, W, H );

    this.ctx.strokeStyle = 'black';
    for ( var x = 0; x < COLS; ++x ) {
        for ( var y = 0; y < ROWS; ++y ) {
            if ( board[ y ][ x ] ) {
                ctx.fillStyle = colors[ board[ y ][ x ] - 1 ];
                this.drawBlock( x, y );
            }
        }
    }

    this.ctx.fillStyle = 'red';
    this.ctx.strokeStyle = 'black';
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                this.ctx.fillStyle = colors[ current[ y ][ x ] - 1 ];
                this.drawBlock( currentX + x, currentY + y );
            }
        }
    }
};