const tetrominoRotations = {};

tetrominoRotations.I = [[[1], [1], [1], [1]], [[1, 1, 1, 1]]];

tetrominoRotations.J = [
  [[0, 2], [0, 2], [2, 2]],
  [[2, 0, 0], [2, 2, 2]],
  [[2, 2], [2, 0], [2, 0]],
  [[2, 2, 2], [0, 0, 2]],
];

tetrominoRotations.L = [
  [[3, 0], [3, 0], [3, 3]],
  [[3, 3, 3], [3, 0, 0]],
  [[3, 3], [0, 3], [0, 3]],
  [[0, 0, 3], [3, 3, 3]],
];

tetrominoRotations.O = [[[4, 4], [4, 4]]];

tetrominoRotations.S = [[[0, 5, 5], [5, 5, 0]], [[5, 0], [5, 5], [0, 5]]];

tetrominoRotations.T = [
  [[0, 6, 0], [6, 6, 6]],
  [[6, 0], [6, 6], [6, 0]],
  [[6, 6, 6], [0, 6, 0]],
  [[0, 6], [6, 6], [0, 6]],
];

tetrominoRotations.Z = [[[7, 7, 0], [0, 7, 7]], [[0, 7], [7, 7], [7, 0]]];

export default tetrominoRotations;
