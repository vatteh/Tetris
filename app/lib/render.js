require('easeljs');

function RenderEngine(game) {
    this.stage = new createjs.Stage("gameboard");

    this.game = game;
    this.BLOCK_WIDTH = 30;
    this.BLOCK_HEIGHT = 30; 
    this.BOARD_WIDTH = this.BLOCK_WIDTH * this.game.width;
    this.BOARD_HEIGHT = this.BLOCK_HEIGHT * this.game.height;
    this.stage.canvas.width = this.BOARD_WIDTH;
    this.stage.canvas.height = this.BOARD_HEIGHT; 
    this.tetrominoColors = [['','',''],
                            ['rgb(0,201,255)','rgb(56,255,255)','rgb(0,224,255)','rgb(100, 240, 253)'], // cyan
                            ['rgb(28,117,188)','rgb(0,224,255)','rgb(0,165,224)','rgb(63, 187, 231)'], // blue
                            ['rgb(241,90,41)','rgb(251,176,64)','rgb(247,148,30)','rgb(247, 172, 86)'], // orange
                            ['rgb(255,189,0)','rgb(255,255,50)','rgb(255,227,87)','rgb(252, 237, 145)'], // yellow
                            ['rgb(57,161,74)','rgb(156,255,0)','rgb(84,214,0)','rgb(123, 219, 69)'], // green
                            ['rgb(127,63,152)','rgb(235,184,255)','rgb(201,115,255)','rgb(213, 148, 252)'], // purple
                            ['rgb(190,30,45)','rgb(255,148,150)','rgb(255,36,55)','rgb(254, 102, 115)'] // red
                            ];     // dark, light, base

    this.nextStage = new createjs.Stage("nextboard");
    this.NEXT_BOARD_WIDTH = this.BLOCK_WIDTH * 5;
    this.NEXT_BOARD_HEIGHT = this.BLOCK_HEIGHT * 5;
    this.nextStage.canvas.width = this.NEXT_BOARD_WIDTH;
    this.nextStage.canvas.height = this.NEXT_BOARD_HEIGHT; 

    this.level = document.getElementById( 'level' );
    this.linesCleared = document.getElementById( 'linesCleared' );
    this.score = document.getElementById( 'score' );
    this.gameOver = document.getElementById( 'game-over' );

    this.drawLevel(1);
    this.drawLinesCleared(0);
    this.drawScore(0);

    this.ghostContainer = new createjs.Container();
    this.stage.addChild(this.ghostContainer);

};

RenderEngine.prototype.drawLevel = function( level ) {
    this.level.innerHTML = "Current Level: " + level;
};

RenderEngine.prototype.drawLinesCleared = function( linesCleared ) {
    this.linesCleared.innerHTML = "Lines Cleared: " + linesCleared;
};

RenderEngine.prototype.drawScore = function( score ) {
    this.score.innerHTML = "Score: " + score;
};

RenderEngine.prototype.drawGameOver = function() {
    this.gameOver.innerHTML = "Game Over";
};

//draw a single square at (x, y)
RenderEngine.prototype.drawBlock = function(colorArray, strokeColor) {    
    var block = new createjs.Shape();

    // light
    block.graphics
        .beginFill(colorArray[1])
        .setStrokeStyle(2, "round")
        .beginStroke(strokeColor)
        .drawRect(0, 0, this.BLOCK_WIDTH - 1, this.BLOCK_HEIGHT - 1)
        .endStroke()
        .endFill();

    // dark
    block.graphics
        .beginFill(colorArray[0])
        .moveTo(0, 0)
        .lineTo(0, this.BLOCK_HEIGHT - 1)
        .lineTo(this.BLOCK_WIDTH - 1, this.BLOCK_HEIGHT - 1)
        .endFill();

    // base
    var bevelThickness = this.BLOCK_WIDTH / 6;
    block.graphics
        .beginFill(colorArray[2])
        .drawRect(bevelThickness, bevelThickness, this.BLOCK_WIDTH - 1 - (bevelThickness * 2), this.BLOCK_HEIGHT - 1 - (bevelThickness * 2))
        .endFill();

    // highlight
    var highlightThickness = bevelThickness / 2;
    block.graphics
        .beginFill(colorArray[3])
        .moveTo(bevelThickness, bevelThickness)
        .lineTo(bevelThickness, bevelThickness + (this.BLOCK_HEIGHT - bevelThickness * 2))
        .lineTo(bevelThickness + (this.BLOCK_WIDTH - bevelThickness * 2), bevelThickness + (this.BLOCK_HEIGHT - bevelThickness * 2))
        .lineTo(bevelThickness + highlightThickness, bevelThickness + (this.BLOCK_HEIGHT - bevelThickness * 2) - highlightThickness)
        .closePath()
        .endFill();

    return block;
};

// draws the landed board and the current Tetromino
RenderEngine.prototype.renderGameBoard = function() {
    this.renderGhost();
    this.renderCurrTetromino();
    this.renderLandedGrid();

    this.stage.update();
};

RenderEngine.prototype.renderCurrTetromino = function() {
    for (var i = 0, len = this.game.currTetromino.length; i < len; i++) {
        for (var j = 0, len2 = this.game.currTetromino[i].length; j < len2; j++) {
            if (this.game.currTetromino[i][j] === null) {
                continue;
            } else if (this.game.currTetromino[i][j].block !== null) {
                this.game.currTetromino[i][j].block.x = this.BLOCK_WIDTH * (this.game.currTetromino.topLeft.col + j);
                this.game.currTetromino[i][j].block.y = this.BLOCK_HEIGHT * (this.game.currTetromino.topLeft.row + i);
            } else {
                var block = this.drawBlock(this.tetrominoColors[this.game.currTetromino[i][j].color], 'white');
                block.x = this.BLOCK_WIDTH * (this.game.currTetromino.topLeft.col + j);
                block.y = this.BLOCK_HEIGHT * (this.game.currTetromino.topLeft.row + i);

                this.game.currTetromino[i][j].block = block;
                this.stage.addChild(block);
            }
        }
    }
};

RenderEngine.prototype.renderLandedGrid = function(lineIndexArray) {
    for (var i = 0, len = this.game.landedGrid.length; i < len; i++) {
        for (var j = 0, len2 = this.game.landedGrid[i].length; j < len2; j++) {
            if (this.game.landedGrid[i][j] && this.game.landedGrid[i][j].block) {
                this.game.landedGrid[i][j].block.x = this.BLOCK_HEIGHT * j;
                this.game.landedGrid[i][j].block.y = this.BLOCK_WIDTH * i;
            } 

            // else {
            //     var block = this.drawBlock(this.tetrominoColors[this.game.landedGrid[i][j].color], 'black');
            //     block.x = this.BLOCK_HEIGHT * j;
            //     block.y = this.BLOCK_WIDTH * i;
            //     this.game.landedGrid[i][j].block = block;
            //     this.stage.addChild(block);
            // }
        }
    }
};

RenderEngine.prototype.renderLineClearAnimation = function(filledRow) {
    //this.stage.removeAllChildren();
    // TWEEN.removeAll();

    for (var i = 0, len = filledRow.length; i < len; i++) {
        if (filledRow[i].block !== undefined) {
            this.stage.removeChild(filledRow[i].block);
        }
    };
    
    // var that = this;
    // var lineContainers = this.renderLandedGrid(lineIndexArray);
    // lineContainers.forEach(function(element) { 

    //     createjs.Tween.get(element)
    //         .to({alpha: 0}, 300)


    //     createjs.Ticker.setFPS(60);
    //     createjs.Ticker.addEventListener("tick", that.stage);

    //     var tween = new TWEEN.Tween(element)
    //         .to({ alpha: 0 }, 300)
    //         .start();

    //     animate();
    //     function animate() {
    //         requestAnimationFrame(animate);  
    //         TWEEN.update();
    //     }
    // });
};

RenderEngine.prototype.renderGhost = function() {
    this.ghostContainer.removeAllChildren(); 

    var ghostTopLeftRow = potentialGhostTopLeftRow = this.game.currTetromino.topLeft.row;
    var ghostTopLeftCol = this.game.currTetromino.topLeft.col;

    while (this.game.checkCollisions(++potentialGhostTopLeftRow, this.game.currTetromino.topLeft.col, this.game.currTetromino)) {
        ghostTopLeftRow = potentialGhostTopLeftRow;
    }

    // render the ghost Tetromino
    for (var i = 0, len = this.game.currTetromino.length; i < len; i++) {
        for (var j = 0, len2 = this.game.currTetromino[i].length; j < len2; j++) {
            if (this.game.currTetromino[i][j] !== null) {

                var block = new createjs.Shape();

                block.graphics
                    .beginFill('grey')
                    .drawRect(this.BLOCK_WIDTH * (j + ghostTopLeftCol) + 1, this.BLOCK_HEIGHT * (i + ghostTopLeftRow) + 1, this.BLOCK_WIDTH - 3 , this.BLOCK_HEIGHT - 3)
                    .endFill();

                this.ghostContainer.addChild(block);
            }
        }
    }
};

RenderEngine.prototype.renderNextBoard = function() {
    this.nextStage.removeAllChildren();

    //calculate the middle of this tetriminto
    var nextTetrominoMiddleH = this.game.nextTetromino.length / 2; 
    var nextTetrominoMiddleW = this.game.nextTetromino[0].length / 2;

    var nextBoardMiddleH = this.NEXT_BOARD_HEIGHT / this.BLOCK_HEIGHT / 2;
    var nextBoardMiddleW = this.NEXT_BOARD_WIDTH / this.BLOCK_WIDTH / 2;

    var heightOffset = nextBoardMiddleH - nextTetrominoMiddleH;
    var widthOffset = nextBoardMiddleW - nextTetrominoMiddleW;

    // render the next board
    for (var i = 0, len = this.game.nextTetromino.length; i < len; i++) {
        for (var j = 0, len2 = this.game.nextTetromino[i].length; j < len2; j++) {
            if (this.game.nextTetromino[i][j] !== null) {
                var block = this.drawBlock(this.tetrominoColors[this.game.nextTetromino[i][j].color], 'white');
                block.x = this.BLOCK_WIDTH * (widthOffset + j);
                block.y = this.BLOCK_HEIGHT * (heightOffset + i);
                this.nextStage.addChild(block);
            }
        }
    }

    this.nextStage.update();
};

module.exports = RenderEngine;

