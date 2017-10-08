/* global createjs */

class RenderEngine {
  constructor(game) {
    this.game = game;
    this.BLOCK_WIDTH = 30;
    this.BOARD_WIDTH = this.BLOCK_WIDTH * this.game.width;
    this.BOARD_HEIGHT = this.BLOCK_WIDTH * this.game.height;
    this.stage = new createjs.Stage('gameboard');
    this.stage.canvas.width = this.BOARD_WIDTH;
    this.stage.canvas.height = this.BOARD_HEIGHT;

    this.NEXT_BOARD_WIDTH = this.BLOCK_WIDTH * 5;
    this.NEXT_BOARD_HEIGHT = this.BLOCK_WIDTH * 5;
    this.nextStage = new createjs.Stage('nextboard');
    this.nextStage.canvas.width = this.NEXT_BOARD_WIDTH;
    this.nextStage.canvas.height = this.NEXT_BOARD_HEIGHT;

    this.currTetrominoId = -1;
    this.tetrominoColors = [
      ['', '', ''],
      ['rgb(0,201,255)', 'rgb(56,255,255)', 'rgb(0,224,255)', 'rgb(100, 240, 253)'], // cyan
      ['rgb(28,117,188)', 'rgb(0,224,255)', 'rgb(0,165,224)', 'rgb(63, 187, 231)'], // blue
      ['rgb(241,90,41)', 'rgb(251,176,64)', 'rgb(247,148,30)', 'rgb(247, 172, 86)'], // orange
      ['rgb(255,189,0)', 'rgb(255,255,50)', 'rgb(255,227,87)', 'rgb(252, 237, 145)'], // yellow
      ['rgb(57,161,74)', 'rgb(156,255,0)', 'rgb(84,214,0)', 'rgb(123, 219, 69)'], // green
      ['rgb(127,63,152)', 'rgb(235,184,255)', 'rgb(201,115,255)', 'rgb(213, 148, 252)'], // purple
      ['rgb(190,30,45)', 'rgb(255,148,150)', 'rgb(255,36,55)', 'rgb(254, 102, 115)'], // red
    ]; // dark, light, base
  }

  // draw a single square at (x, y)
  drawBlock(i, j, colorArray, stage, strokeStyle) {
    // light
    const block = new createjs.Shape();
    block.graphics
      .beginFill(colorArray[1])
      .drawRect(this.BLOCK_WIDTH * j, this.BLOCK_WIDTH * i, this.BLOCK_WIDTH - 1, this.BLOCK_WIDTH - 1);

    // dark
    block.graphics
      .setStrokeStyle(1)
      .beginFill(colorArray[0])
      .moveTo(this.BLOCK_WIDTH * j, this.BLOCK_WIDTH * i)
      .lineTo(this.BLOCK_WIDTH * j, this.BLOCK_WIDTH * i + this.BLOCK_WIDTH - 1)
      .lineTo(this.BLOCK_WIDTH * j + this.BLOCK_WIDTH - 1, this.BLOCK_WIDTH * i + this.BLOCK_WIDTH - 1)
      .endFill();

    // base
    const bevelThickness = this.BLOCK_WIDTH / 6;
    block.graphics
      .beginFill(colorArray[2])
      .drawRect(
        this.BLOCK_WIDTH * j + bevelThickness,
        this.BLOCK_WIDTH * i + bevelThickness,
        this.BLOCK_WIDTH - 1 - bevelThickness * 2,
        this.BLOCK_WIDTH - 1 - bevelThickness * 2,
      );

    // highlight
    const highlightThickness = bevelThickness / 2;
    block.graphics
      .setStrokeStyle(0.5)
      .beginFill(colorArray[3])
      .moveTo(this.BLOCK_WIDTH * j + bevelThickness, this.BLOCK_WIDTH * i + bevelThickness)
      .lineTo(
        this.BLOCK_WIDTH * j + bevelThickness,
        this.BLOCK_WIDTH * i + bevelThickness + (this.BLOCK_WIDTH - bevelThickness * 2),
      )
      .lineTo(
        this.BLOCK_WIDTH * j + bevelThickness + (this.BLOCK_WIDTH - bevelThickness * 2),
        this.BLOCK_WIDTH * i + bevelThickness + (this.BLOCK_WIDTH - bevelThickness * 2),
      )
      .lineTo(
        this.BLOCK_WIDTH * j + bevelThickness + highlightThickness,
        this.BLOCK_WIDTH * i + bevelThickness + (this.BLOCK_WIDTH - bevelThickness * 2) - highlightThickness,
      )
      .endFill();
    stage.addChild(block);
  }

  renderGhost() {
    let potentialGhostTopLeftRow = this.game.currTetromino.topLeft.row;
    let ghostTopLeftRow = this.game.currTetromino.topLeft.row;
    const ghostTopLeftCol = this.game.currTetromino.topLeft.col;

    while (
      this.game.checkCollisions(
        ++potentialGhostTopLeftRow,
        this.game.currTetromino.topLeft.col,
        this.game.currTetromino,
      )
    ) {
      ghostTopLeftRow = potentialGhostTopLeftRow;
    }

    // render the current Tetromino
    for (let i = 0; i < this.game.currTetromino.length; i++) {
      for (let j = 0; j < this.game.currTetromino[0].length; j++) {
        if (this.game.currTetromino[i][j]) {
          const block = new createjs.Shape();
          block.graphics
            .beginFill('grey')
            .drawRect(
              this.BLOCK_WIDTH * (j + ghostTopLeftCol) + 1,
              this.BLOCK_WIDTH * (i + ghostTopLeftRow) + 1,
              this.BLOCK_WIDTH - 3,
              this.BLOCK_WIDTH - 3,
            );
          this.stage.addChild(block);
        }
      }
    }
  }

  renderLandedGrid() {
    for (let i = 0; i < this.game.landedGrid.length; i++) {
      for (let j = 0; j < this.game.landedGrid[0].length; j++) {
        if (this.game.landedGrid[i][j]) {
          this.drawBlock(i, j, this.tetrominoColors[this.game.landedGrid[i][j]], this.stage, 'black');
        }
      }
    }
  }

  renderNextBoard() {
    this.nextStage.removeAllChildren();
    // calculate the middle of this tetriminto
    const nextTetrominoMiddleH = this.game.nextTetromino.length / 2;
    const nextTetrominoMiddleW = this.game.nextTetromino[0].length / 2;

    const nextBoardMiddleH = this.NEXT_BOARD_HEIGHT / this.BLOCK_WIDTH / 2;
    const nextBoardMiddleW = this.NEXT_BOARD_WIDTH / this.BLOCK_WIDTH / 2;

    const heightOffset = nextBoardMiddleH - nextTetrominoMiddleH;
    const widthOffset = nextBoardMiddleW - nextTetrominoMiddleW;

    // render the next board
    for (let i = 0; i < this.game.nextTetromino.length; i++) {
      for (let j = 0; j < this.game.nextTetromino[0].length; j++) {
        if (this.game.nextTetromino[i][j]) {
          this.drawBlock(
            heightOffset + i,
            widthOffset + j,
            this.tetrominoColors[this.game.nextTetromino[i][j]],
            this.nextStage,
            'white',
          );
        }
      }
    }

    this.nextStage.update();
  }

  // draws the landed board and the current Tetromino
  render() {
    this.stage.removeAllChildren();
    this.renderLandedGrid();
    this.renderGhost();

    // render the current Tetromino
    // this.stage.removeChild(this.currTetrominoContainer);
    this.currTetrominoContainer = new createjs.Container();
    this.currTetrominoContainer.regX = this.game.currTetromino.topLeft.col * this.BLOCK_WIDTH;
    this.currTetrominoContainer.regY = this.game.currTetromino.topLeft.row * this.BLOCK_WIDTH;
    this.currTetrominoId = this.game.currTetromino.id;

    for (let i = 0; i < this.game.currTetromino.length; i++) {
      for (let j = 0; j < this.game.currTetromino[0].length; j++) {
        if (this.game.currTetromino[i][j]) {
          this.drawBlock(
            this.game.currTetromino.topLeft.row + i,
            this.game.currTetromino.topLeft.col + j,
            this.tetrominoColors[this.game.currTetromino[i][j]],
            this.currTetrominoContainer,
            'white',
          );
        }
      }
    }

    this.stage.addChild(this.currTetrominoContainer);
    this.currTetrominoContainer.x = this.game.currTetromino.topLeft.col * this.BLOCK_WIDTH;
    this.currTetrominoContainer.y = this.game.currTetromino.topLeft.row * this.BLOCK_WIDTH;
    this.stage.update();
  }
}

export default RenderEngine;
