var tetrominos = {};

tetrominos.I = [[{color:1}],
 				[{color:1}],
 				[{color:1}],
 				[{color:1}]];

tetrominos.J = [[null, {color:2}],
 				[null, {color:2}],
 				[{color:2}, {color:2}]];

tetrominos.L = [[{color:3}, null],
				[{color:3}, null],
 				[{color:3}, {color:3}]];

tetrominos.O = [[{color:4}, {color:4}],
				[{color:4}, {color:4}]];

tetrominos.S = [[null, {color:5}, {color:5}],
				[{color:5}, {color:5}, null]];

tetrominos.T = [[null, {color:6}, null],
				[{color:6}, {color:6}, {color:6}]];

tetrominos.Z = [[{color:7}, {color:7}, null],
				[null, {color:7}, {color:7}]];

module.exports = tetrominos;