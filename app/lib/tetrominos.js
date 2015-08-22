var tetrominos = {};

tetrominos.I = [[{color:1, block: null}],
 				[{color:1, block: null}],
 				[{color:1, block: null}],
 				[{color:1, block: null}]];

tetrominos.J = [[null, {color:2, block: null}],
 				[null, {color:2, block: null}],
 				[{color:2, block: null}, {color:2, block: null}]];

tetrominos.L = [[{color:3, block: null}, null],
				[{color:3, block: null}, null],
 				[{color:3, block: null}, {color:3, block: null}]];

tetrominos.O = [[{color:4, block: null}, {color:4, block: null}],
				[{color:4, block: null}, {color:4, block: null}]];

tetrominos.S = [[null, {color:5, block: null}, {color:5, block: null}],
				[{color:5, block: null}, {color:5, block: null}, null]];

tetrominos.T = [[null, {color:6, block: null}, null],
				[{color:6, block: null}, {color:6, block: null}, {color:6, block: null}]];

tetrominos.Z = [[{color:7, block: null}, {color:7, block: null}, null],
				[null, {color:7, block: null}, {color:7, block: null}]];

module.exports = tetrominos;