const tetrominoRotations = {};

tetrominoRotations.I = [[[1], [1], [1], [1]], [[1, 1, 1, 1]], [[1], [1], [1], [1]], [[1, 1, 1, 1]]];
tetrominoRotations.I[0].middle = { row: 1, col: 0 };
tetrominoRotations.I[1].middle = { row: 0, col: 2 };
tetrominoRotations.I[2].middle = { row: 2, col: 0 };
tetrominoRotations.I[3].middle = { row: 0, col: 1 };

tetrominoRotations.J = [
  [[0, 2], [0, 2], [2, 2]],
  [[2, 0, 0], [2, 2, 2]],
  [[2, 2], [2, 0], [2, 0]],
  [[2, 2, 2], [0, 0, 2]],
];
tetrominoRotations.J[0].middle = { row: 1, col: 1 };
tetrominoRotations.J[1].middle = { row: 1, col: 1 };
tetrominoRotations.J[2].middle = { row: 1, col: 0 };
tetrominoRotations.J[3].middle = { row: 0, col: 1 };

tetrominoRotations.L = [
  [[3, 0], [3, 0], [3, 3]],
  [[3, 3, 3], [3, 0, 0]],
  [[3, 3], [0, 3], [0, 3]],
  [[0, 0, 3], [3, 3, 3]],
];
tetrominoRotations.L[0].middle = { row: 1, col: 0 };
tetrominoRotations.L[1].middle = { row: 0, col: 1 };
tetrominoRotations.L[2].middle = { row: 1, col: 1 };
tetrominoRotations.L[3].middle = { row: 1, col: 1 };

tetrominoRotations.O = [[[4, 4], [4, 4]]];
tetrominoRotations.O[0].middle = { row: 0, col: 0 };

tetrominoRotations.S = [
  [[0, 5, 5], [5, 5, 0]],
  [[5, 0], [5, 5], [0, 5]],
  [[0, 5, 5], [5, 5, 0]],
  [[5, 0], [5, 5], [0, 5]],
];
tetrominoRotations.S[0].middle = { row: 0, col: 1 };
tetrominoRotations.S[1].middle = { row: 1, col: 1 };
tetrominoRotations.S[2].middle = { row: 1, col: 1 };
tetrominoRotations.S[3].middle = { row: 1, col: 0 };

tetrominoRotations.T = [
  [[0, 6, 0], [6, 6, 6]],
  [[6, 0], [6, 6], [6, 0]],
  [[6, 6, 6], [0, 6, 0]],
  [[0, 6], [6, 6], [0, 6]],
];
tetrominoRotations.T[0].middle = { row: 1, col: 1 };
tetrominoRotations.T[1].middle = { row: 1, col: 0 };
tetrominoRotations.T[2].middle = { row: 0, col: 1 };
tetrominoRotations.T[3].middle = { row: 1, col: 1 };

tetrominoRotations.Z = [
  [[7, 7, 0], [0, 7, 7]],
  [[0, 7], [7, 7], [7, 0]],
  [[7, 7, 0], [0, 7, 7]],
  [[0, 7], [7, 7], [7, 0]],
];
tetrominoRotations.Z[0].middle = { row: 1, col: 1 };
tetrominoRotations.Z[1].middle = { row: 1, col: 0 };
tetrominoRotations.Z[2].middle = { row: 0, col: 1 };
tetrominoRotations.Z[3].middle = { row: 1, col: 1 };

export default tetrominoRotations;
