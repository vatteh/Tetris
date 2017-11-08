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

    this.landedBoardContainer = new createjs.Container();
    this.ghostContainer = new createjs.Container();

    this.stage.addChild(this.landedBoardContainer);
    this.stage.addChild(this.ghostContainer);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', this.stage);
  }

  // draw a single square at (x, y)
  drawBlock(i, j, colorArray, strokeStyle) {
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

    return block;
  }

  drawGhostBlock(i, j) {
    const block = new createjs.Shape();
    block.graphics
      .beginFill('grey')
      .drawRect(this.BLOCK_WIDTH * j + 1, this.BLOCK_WIDTH * i + 1, this.BLOCK_WIDTH - 3, this.BLOCK_WIDTH - 3);

    return block;
  }

  renderGhost() {
    this.ghostContainer.removeAllChildren();
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
          const block = this.drawGhostBlock(i + ghostTopLeftRow, j + ghostTopLeftCol);
          this.ghostContainer.addChild(block);
        }
      }
    }
  }

  renderLandedGrid() {
    this.landedBoardContainer.removeAllChildren();
    for (let i = 0; i < this.game.landedGrid.length; i++) {
      for (let j = 0; j < this.game.landedGrid[0].length; j++) {
        if (this.game.landedGrid[i][j]) {
          const block = this.drawBlock(i, j, this.tetrominoColors[this.game.landedGrid[i][j]], 'black');
          this.landedBoardContainer.addChild(block);
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
          const block = this.drawBlock(
            heightOffset + i,
            widthOffset + j,
            this.tetrominoColors[this.game.nextTetromino[i][j]],
            'white',
          );
          this.nextStage.addChild(block);
        }
      }
    }

    this.nextStage.update();
  }

  rotateCurrTetromino(deg) {
    if (this.game.currTetromino.tetrominoRotations.length > 1) {
      this.inRotateAnimation = true;
      this.renderGhost();
      const degTarget = this.currTetrominoContainer.rotation + deg;
      createjs.Tween
        .get(this.currTetrominoContainer)
        .to({ rotation: degTarget, override: true }, 30)
        .call(() => {
          this.inRotateAnimation = false;
        });
    }
  }

  clearRows(rowsCleared, callback) {
    const blocks = [];
    rowsCleared.forEach(row => {
      for (let i = 0; i < this.game.width; i++) {
        const x = i * this.BLOCK_WIDTH + this.BLOCK_WIDTH / 2;
        const y = row * this.BLOCK_WIDTH + this.BLOCK_WIDTH / 2;
        const block = this.landedBoardContainer.getObjectUnderPoint(x, y);
        block.scaleToX = x;
        block.scaleToY = y;
        blocks.push(block);
      }
    });

    return new Promise((resolve, reject) => {
      let animationsDone = 0;
      const oneDone = () => {
        animationsDone++;

        if (animationsDone === blocks.length) {
          resolve();
        }
      };

      blocks.forEach(block => {
        block.alpha = 1;
        createjs.Tween
          .get(block)
          .to({ scaleX: 0, scaleY: 0, x: block.scaleToX, y: block.scaleToY }, 150, createjs.Ease.backIn)
          .call(oneDone);
      });
    });
  }

  // draws the landed board and the current Tetromino
  render() {
    return new Promise((resolve, reject) => {
      this.renderGhost();
      this.renderLandedGrid();

      if (this.currTetrominoId !== this.game.currTetromino.id) {
        this.currTetrominoId = this.game.currTetromino.id;
        this.stage.removeChild(this.currTetrominoContainer);
        this.currTetrominoContainer = new createjs.Container();

        for (let i = 0; i < this.game.currTetromino.length; i++) {
          for (let j = 0; j < this.game.currTetromino[0].length; j++) {
            if (this.game.currTetromino[i][j]) {
              const block = this.drawBlock(i, j, this.tetrominoColors[this.game.currTetromino[i][j]], 'white');
              this.currTetrominoContainer.addChild(block);
            }
          }
        }

        this.currTetrominoContainer.regX = this.game.currTetromino.middle.col * this.BLOCK_WIDTH + this.BLOCK_WIDTH / 2;
        this.currTetrominoContainer.regY = this.game.currTetromino.middle.row * this.BLOCK_WIDTH + this.BLOCK_WIDTH / 2;
        this.currTetrominoContainer.x =
          this.game.currTetromino.topLeft.col * this.BLOCK_WIDTH + this.currTetrominoContainer.regX;
        this.currTetrominoContainer.y =
          this.game.currTetromino.topLeft.row * this.BLOCK_WIDTH + this.currTetrominoContainer.regY;
        this.stage.addChild(this.currTetrominoContainer);
      }

      const x = this.game.currTetromino.topLeft.col * this.BLOCK_WIDTH + this.currTetrominoContainer.regX;
      const y = this.game.currTetromino.topLeft.row * this.BLOCK_WIDTH + this.currTetrominoContainer.regY;
      createjs.Tween
        .get(this.currTetrominoContainer)
        .to({ x, y, override: true }, 50, createjs.Ease.quartOut)
        .call(resolve);
    });
  }
}

export default RenderEngine;
