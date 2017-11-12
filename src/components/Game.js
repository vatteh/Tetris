/* global createjs */

import React, { Component } from 'react';

import RenderEngine from '../lib/render';
import SoundController, { MUSIC, ROTATE, DROP, LINE_CLEAR, MOVE, LEVEL_UP, GAME_OVER } from '../lib/soundController';
import tetrominoRotations from '../lib/tetrominoRotations';

class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      level: 1,
      linesCleared: 0,
      score: 0,
      gameOver: false,
    };

    this.soundController = new SoundController();
    this.landedGrid = Game.generateBoard(props.height, props.width);
    this.height = this.landedGrid.length;
    this.width = this.landedGrid[0].length;
    this.startGame();
  }

  startGame() {
    this.currTetromino = null;
    this.nextTetromino = null;
    this.tetrominoOrder = [];
    this.rotationIndex = 0;
    this.idIncrement = 0;
    this.randomizeTetrominoOrder();
    this.addTetromino();
    this.controlsEnabled = true;
    this.setUpKeyEvents(true);
    this.intervalID = null;
    this.playSpeed = 1000;
  }

  static newRow(width) {
    const aRay = [];
    for (let i = 0; i < width; i++) {
      aRay[i] = 0;
    }

    return aRay;
  }

  static stopSound(id) {
    return createjs.Sound.stop(id);
  }

  static deepCopy(outerArray) {
    return outerArray.map(innerArray => innerArray.slice());
  }

  static generateBoard(height, width) {
    const gameArray = [];

    // create empty height x width board
    for (let i = 0; i < height; i++) {
      gameArray.push(Game.newRow(width));
    }

    Object.entries(tetrominoRotations).forEach(pair => {
      const [tetrominoLetter, rotations] = pair;

      rotations.forEach((val, index, array) => {
        val.rotationIndex = index;
        val.tetrominoRotations = array;
      });
    });

    return gameArray;
  }

  componentDidMount() {
    this.renderEngine = new RenderEngine(this);
    this.renderEngine.render();
    this.renderEngine.renderNextBoard();
    this.setPlay(this.playSpeed);
  }

  setUpKeyEvents(startGame) {
    if (startGame) {
      document.body.onkeydown = e => {
        if ((e.keyCode === 37 || e.keyCode === 40 || e.keyCode === 39 || e.keyCode === 32) && this.controlsEnabled) {
          this.moveTetromino(e.keyCode, this.currTetromino);
        } else if (e.keyCode === 38 && this.controlsEnabled) {
          this.rotateTetromino(e.keyCode);
        }
      };
    } else {
      document.body.onkeydown = null;
    }
  }

  randomizeTetrominoOrder() {
    // Randomize array element order in-place.
    // Using Fisher-Yates shuffle algorithm.
    const shuffleArray = aRay => {
      for (let i = aRay.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = aRay[i];
        aRay[i] = aRay[j];
        aRay[j] = temp;
      }
    };

    this.tetrominoOrder = [
      tetrominoRotations.I[0],
      tetrominoRotations.I[1],
      tetrominoRotations.J[0],
      tetrominoRotations.J[1],
      tetrominoRotations.L[0],
      tetrominoRotations.L[1],
      tetrominoRotations.O[0],
      tetrominoRotations.O[0],
      tetrominoRotations.S[0],
      tetrominoRotations.S[1],
      tetrominoRotations.T[0],
      tetrominoRotations.T[1],
      tetrominoRotations.Z[0],
      tetrominoRotations.Z[1],
    ];

    shuffleArray(this.tetrominoOrder);
  }

  // Rotates this.currTetromino
  rotateTetromino() {
    let potentialTetromino;
    if (this.currTetromino.rotationIndex < this.currTetromino.tetrominoRotations.length - 1) {
      potentialTetromino = this.currTetromino.tetrominoRotations[this.currTetromino.rotationIndex + 1];
    } else {
      potentialTetromino = this.currTetromino.tetrominoRotations[0];
    }

    const potentialTetrominoMiddlePoint = {
      row: this.currTetromino.topLeft.row + this.currTetromino.middle.row,
      col: this.currTetromino.topLeft.col + this.currTetromino.middle.col,
    };

    potentialTetromino.topLeft = {
      row: potentialTetrominoMiddlePoint.row - potentialTetromino.middle.row,
      col: potentialTetrominoMiddlePoint.col - potentialTetromino.middle.col,
    };

    potentialTetromino.id = this.idIncrement++;

    if (
      !this.renderEngine.inRotateAnimation &&
      this.checkCollisions(potentialTetromino.topLeft.row, potentialTetromino.topLeft.col, potentialTetromino)
    ) {
      this.currTetromino = potentialTetromino;
      this.renderEngine.rotateCurrTetromino(90);
      this.soundController.playSound(ROTATE);
      return true;
    }
    return false;
  }

  moveTetromino(keyCode, tetromino) {
    let potentialTopLeftRow;
    let potentialTopLeftCol;

    if (keyCode === 37) {
      // Left
      potentialTopLeftRow = tetromino.topLeft.row;
      potentialTopLeftCol = tetromino.topLeft.col - 1;
    } else if (keyCode === 39) {
      // Right
      potentialTopLeftRow = tetromino.topLeft.row;
      potentialTopLeftCol = tetromino.topLeft.col + 1;
    } else if (keyCode === 40) {
      // Down
      potentialTopLeftRow = tetromino.topLeft.row + 1;
      potentialTopLeftCol = tetromino.topLeft.col;
      this.setState({ score: ++this.state.score });
    } else if (keyCode === -2) {
      // tick
      potentialTopLeftRow = tetromino.topLeft.row + 1;
      potentialTopLeftCol = tetromino.topLeft.col;
    } else if (keyCode === 32) {
      // SpaceBar
      potentialTopLeftRow = tetromino.topLeft.row;
      potentialTopLeftCol = tetromino.topLeft.col;

      let rowsDropped = 0;
      while (this.checkCollisions(++potentialTopLeftRow, potentialTopLeftCol, tetromino)) {
        tetromino.topLeft.row = potentialTopLeftRow;
        rowsDropped++;
      }

      this.setState({ score: this.state.score + rowsDropped * 2 });
    } else if (keyCode === -1) {
      // clump drop
      potentialTopLeftRow = tetromino.topLeft.row;
      potentialTopLeftCol = tetromino.topLeft.col;

      while (this.checkCollisions(++potentialTopLeftRow, potentialTopLeftCol, tetromino)) {
        tetromino.topLeft.row = potentialTopLeftRow;
      }
    } else {
      return false;
    }

    // the Tetromino can move to new position
    if (this.checkCollisions(potentialTopLeftRow, potentialTopLeftCol, tetromino)) {
      tetromino.topLeft.row = potentialTopLeftRow;
      tetromino.topLeft.col = potentialTopLeftCol;

      this.soundController.playSound(MOVE, keyCode === -2 ? 0.05 : 0.1);
      this.renderEngine.render();
      return true;
    }

    // the Tetromino cannot move down so the shape will land
    if (keyCode === 40 || keyCode === 32 || keyCode === -1 || keyCode === -2) {
      this.controlsEnabled = false;
      this.pausePlay();

      // render the drop first, then land
      (keyCode === 32 ? this.renderEngine.render() : Promise.resolve())
        .then(() => this.landTetromino(tetromino, keyCode))
        .then(() => {
          if (keyCode !== -1) {
            this.addTetromino();
            this.soundController.playSound(DROP, keyCode === 32 ? 0.25 : 0.1);
            return this.renderEngine.render();
          }
          return Promise.resolve();
        })
        .then(() => {
          if (!this.state.gameOver) {
            this.setPlay(this.playSpeed);
            this.controlsEnabled = true;
          }
        });

      return true;
    }

    return false;
  }

  checkCollisions(potentialTopLeftRow, potentialTopLeftCol, potentialTetromino) {
    for (let row = 0; row < potentialTetromino.length; row++) {
      for (let col = 0; col < potentialTetromino[row].length; col++) {
        if (
          potentialTetromino[row][col] !== 0 && // is this block actually part of the Tetromino shape?
          (this.landedGrid[potentialTopLeftRow + row] === undefined ||
          this.landedGrid[potentialTopLeftRow + row][potentialTopLeftCol + col] === undefined || // is this block of the Tetromino now out of bounds?
            this.landedGrid[potentialTopLeftRow + row][potentialTopLeftCol + col] !== 0)
        ) {
          // is there already a landed block at this spot?
          // the space is taken
          return false;
        }
      }
    }

    return true;
  }

  landTetromino(tetromino, keyCode) {
    for (let row = 0; row < tetromino.length; row++) {
      for (let col = 0; col < tetromino[row].length; col++) {
        if (tetromino[row][col] !== 0) {
          this.landedGrid[tetromino.topLeft.row + row][tetromino.topLeft.col + col] = tetromino[row][col];
        }
      }
    }

    return this.clearRowsAdvance(keyCode);
  }

  addTetromino() {
    this.currTetromino = this.tetrominoOrder.shift();
    this.currTetromino.id = this.idIncrement++;

    if (this.tetrominoOrder.length === 0) {
      this.randomizeTetrominoOrder();
    }

    this.nextTetromino = this.tetrominoOrder[0];
    if (this.renderEngine) {
      this.renderEngine.renderNextBoard();
    }
    this.currTetromino.topLeft = {
      row: 0,
      col: Math.floor(this.width / 2) - Math.floor(this.currTetromino[0].length / 2),
    };

    if (!this.checkCollisions(this.currTetromino.topLeft.row, this.currTetromino.topLeft.col, this.currTetromino)) {
      this.gameOver();
    }
  }

  clearRowsBasic() {
    let rowCombo = 0;
    let i = 0;

    for (let len = this.landedGrid.length; i < len; i++) {
      if (this.landedGrid[i].indexOf(0) === -1) {
        // no 0's means row is filled
        this.landedGrid.splice(i, 1);
        this.landedGrid.unshift(Game.newRow(this.width));
        rowCombo++;
      }
    }

    this.calculateRowCombo(rowCombo, i);
  }

  clearRowsAdvance(keyCode) {
    const rowsCleared = [];
    let rowCombo = 0;

    this.renderEngine.render(); // render landedGrid first so that all blocks to be removed are on the canvas
    for (let i = 0, len = this.landedGrid.length; i < len; i++) {
      if (this.landedGrid[i].indexOf(0) === -1) {
        // no 0's means row is filled
        rowsCleared.push(i);
        this.landedGrid.splice(i, 1, Game.newRow(this.width));
        rowCombo++;
      }
    }

    if (rowsCleared.length) {
      this.soundController.playSound(LINE_CLEAR);
      return this.renderEngine.clearRows(rowsCleared).then(() => {
        const lastRowCleared = rowsCleared.pop();
        this.calculateRowCombo(rowCombo, lastRowCleared);
        const clumps = this.findClumps(lastRowCleared); // from this row up, we need to find the 'clumps' of blocks and treat them as falling Tetrominos

        while (clumps.length > 0) {
          this.moveTetromino(-1, clumps.pop());
        }
      });
    }

    return Promise.resolve();
  }

  calculateRowCombo(rowsCleared, lastRowCleared) {
    this.setState({ score: (100 + (rowsCleared - 1) * 200) * this.state.level });
    this.setState({ linesCleared: this.state.linesCleared + rowsCleared });
    this.levelUp();
  }

  levelUp() {
    if (this.state.linesCleared / 10 >= this.state.level) {
      this.soundController.playSound(LEVEL_UP);
      this.state.level++;
      this.playSpeed = this.playSpeed / 1.3;
      this.setPlay(this.playSpeed);
      this.setState({ level: this.state.level });
    }
  }

  // need to remove found clumps from game board, then treat them as falling tetriminos
  findClumps(clearedRowIndex) {
    const clumps = [];
    const remainderBoard = this.landedGrid.slice(0, clearedRowIndex);
    const remainderBoardCopy = Game.deepCopy(remainderBoard);

    for (let i = 0, len = remainderBoard.length; i < len; i++) {
      for (let j = 0, len2 = remainderBoard[i].length; j < len2; j++) {
        if (remainderBoard[i][j] > 0) {
          const rowColRange = {
            minRow: i,
            minCol: j,
            maxRow: i,
            maxCol: j,
          };

          this.findRowColRange(i, j, rowColRange, remainderBoard);
          const clump = [];

          for (let k = rowColRange.minRow; k <= rowColRange.maxRow; k++) {
            clump.push(Game.newRow(rowColRange.maxCol + 1 - rowColRange.minCol));
          }

          clump.topLeft = {
            row: rowColRange.minRow,
            col: rowColRange.minCol,
          };

          clumps.push(clump);
        }
      }
    }

    clumps.forEach(clump => {
      for (let a = 0, len = clump.length; a < len; a++) {
        for (let b = 0, len2 = clump[0].length; b < len2; b++) {
          if (remainderBoardCopy[clump.topLeft.row + a][clump.topLeft.col + b] > 0) {
            // console.log("Row: " + (clump.topLeft.row + a) + " Col: " + (clump.topLeft.col + b));
            clump[a][b] = remainderBoardCopy[clump.topLeft.row + a][clump.topLeft.col + b];
          }
        }
      }
    });

    return clumps;
  }

  findRowColRange(boardRow, boardCol, rowColRange, remainderBoard) {
    if (remainderBoard[boardRow] && remainderBoard[boardRow][boardCol] && remainderBoard[boardRow][boardCol] > 0) {
      if (boardRow < rowColRange.minRow) {
        rowColRange.minRow = boardRow;
      }

      if (boardCol < rowColRange.minCol) {
        rowColRange.minCol = boardCol;
      }

      if (boardRow > rowColRange.maxRow) {
        rowColRange.maxRow = boardRow;
      }

      if (boardCol > rowColRange.maxCol) {
        rowColRange.maxCol = boardCol;
      }

      remainderBoard[boardRow][boardCol] = 0; // mark the board as -1 when finding clump ranges. When we copy the clump to the board we
      this.findRowColRange(boardRow, boardCol + 1, rowColRange, remainderBoard);
      this.findRowColRange(boardRow + 1, boardCol, rowColRange, remainderBoard);
      this.findRowColRange(boardRow - 1, boardCol, rowColRange, remainderBoard);
      this.findRowColRange(boardRow, boardCol - 1, rowColRange, remainderBoard);
    }
  }

  gameOver() {
    clearInterval(this.intervalID);
    this.soundController.stopThemeSong();
    this.soundController.playSound(GAME_OVER);
    this.renderEngine.render();
    this.setUpKeyEvents(false);
    this.setState({ gameOver: true });
  }

  setPlay(speed) {
    clearInterval(this.intervalID);

    this.intervalID = window.setInterval(() => {
      this.moveTetromino(-2, this.currTetromino);
    }, speed);
  }

  pausePlay() {
    clearInterval(this.intervalID);
  }

  restartGame() {
    this.soundController.playThemeSong();
    this.setState({
      level: 1,
      linesCleared: 0,
      score: 0,
      gameOver: false,
    });
    this.landedGrid = Game.generateBoard(this.height, this.width);
    this.startGame();
    this.renderEngine.render();
    this.renderEngine.renderNextBoard();
    this.setPlay(this.playSpeed);
  }

  render() {
    const { level, linesCleared, score, gameOver } = this.state;
    const { width, height } = this.props;
    return (
      <div className="container group">
        <canvas id="gameboard" width="" height="">
          <p>Sorry :( This game is currently not supported in your browser.</p>
        </canvas>

        <div className="dashboard">
          <h3>Next Piece:</h3>
          <canvas id="nextboard" width="" height="" />
          <div className="stats">
            <p id="level">Current Level: {level}</p>
            <p id="linesCleared">Lines Cleared: {linesCleared}</p>
            <p id="score">Score: {score}</p>
          </div>
          <h1 id="game-title">Tetris</h1>
          {gameOver && (
            <div>
              <p id="game-over">Game Over</p>
              <button className="game-over-button" onClick={this.restartGame.bind(this)}>
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

Game.propTypes = {
  height: React.PropTypes.number.isRequired,
  width: React.PropTypes.number.isRequired,
};

export default Game;
