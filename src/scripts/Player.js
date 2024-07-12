import { pipeline } from "./Helpers.js";

export const markers = {
	adjacent: ".",
	hit: "X",
	miss: "O",
	ship: 1,
	verified: "*",
	empty: null,
};

const _gameboardAndComputerChoiceInterface = (state) => ({
	interface: "gameboard and computer choice",
	getChoice: (board) => state.getChoice(board),
});

const _shipInterface = (state) => ({
	interface: "Ship Interface",
	isSunk: () => state.isSunk(),
	hit: () => state.hit(),
	getOccupiedSquares: () => state.getOccupiedSquares(),
	getAdjacentSquares: () => state.getAdjacentSquares(),
});

const _gameboardInterface = (state) => ({
	interface: "Gameboard Interface",
	getBoard: () => state.getBoard(),
	placeShip: (coord, angle, len) => state.placeShip(coord, angle, len),
	receiveAttack: (coord) => state.receiveAttack(coord),
	hasLost: () => state.hasLost(),
	createRandomLayout: () => state.createRandomLayout(),
	resetBoard: () => state.resetBoard(),
});

function _getRandom(max, limit) {
	const range = limit ? 1 : 0;
	return Math.floor(Math.random() * max + range);
}

function _Ship(coveredSq, adjacentSq, len = 1) {
	const _MAX_LENGTH = 5;
	const _MIN_LENGTH = 1;
	const _length =
		len > _MAX_LENGTH ? _MAX_LENGTH : len < _MIN_LENGTH ? _MIN_LENGTH : len;
	let _hitCount = 0;
	const _occupiedSquares = coveredSq;
	const _adjacentSquares = adjacentSq;

	const state = {
		hit: () => ++_hitCount,
		isSunk: () => _length <= _hitCount && _hitCount > 0,
		getOccupiedSquares: () => _occupiedSquares,
		getAdjacentSquares: () => _adjacentSquares,
	};

	return Object.assign(_shipInterface(state));
}

function _isArrayEqual([x, y], [a, b]) {
	return x === a && y === b;
}

function _Gameboard() {
	let _ships = [];
	const _board = [];
	for (let i = 0; i < 10; i++) {
		_board.push(Array(10).fill(markers.empty));
	}

	const _getAttackedShip = ([a, b]) => {
		for (const ship of _ships) {
			const squares = ship.getOccupiedSquares();
			for (const square of squares) {
				if (
					square[0] === Number.parseInt(a) &&
					square[1] === Number.parseInt(b)
				)
					return ship;
			}
		}
	};

	const _getAdjacentTiles = (coveredTiles) => {
		const adjacent = [];
		for (const [x, y] of coveredTiles) {
			for (let i = x - 1; i <= x + 1; i++) {
				for (let j = y - 1; j <= y + 1; j++) {
					if (coveredTiles.some((sq) => _isArrayEqual([i, j], sq))) continue;
					if (adjacent.some((sq) => _isArrayEqual([i, j], sq))) continue;
					if (i > 9 || i < 0 || j > 9 || j < 0) continue;
					adjacent.push([i, j]);
				}
			}
		}
		return adjacent;
	};

	const _getCoveredSquares = ([x, y], angle, len) => {
		const squares = [];
		for (let i = 0; i < len; i++) {
			const currentSquare = angle === 90 ? [x + i, y] : [x, y + i];

			// check if the square is out of bounds
			if (currentSquare[0] > 9 || currentSquare[1] > 9) return [];
			// check if the square is empty
			if (_board[currentSquare[0]][currentSquare[1]] !== markers.empty)
				return [];
			squares.push(currentSquare);
		}
		return squares;
	};

	const _getCornerSquares = (x, y) => {
		const squares = [
			[x + 1, y - 1],
			[x + 1, y + 1],
			[x - 1, y - 1],
			[x - 1, y + 1],
		].filter(([x, y]) => x >= 0 && x <= 9 && y >= 0 && y <= 9);
		for (const [a, b] of squares) {
			const square = _board[a][b];
			if (square === markers.empty || square === markers.adjacent)
				_board[a][b] = markers.verified;
		}
		return squares;
	};

	const state = {
		getBoard: () => _board,
		placeShip: (coord, angle, len) => {
			const occupiedSq = _getCoveredSquares(coord, angle, len);
			if (occupiedSq.length === 0) return false;
			for (const [x, y] of occupiedSq) {
				_board[x][y] = markers.ship;
			}
			const adjacentSq = _getAdjacentTiles(occupiedSq);
			for (const [x, y] of adjacentSq) {
				_board[x][y] =
					_board[x][y] !== markers.empty ? _board[x][y] : markers.adjacent;
			}
			_ships.push(_Ship(occupiedSq, adjacentSq, len));
		},
		receiveAttack: function ([x, y]) {
			x = Number.parseInt(x);
			y = Number.parseInt(y);
			if (_board[x][y] === markers.empty || _board[x][y] === markers.adjacent) {
				_board[x][y] = markers.miss;
				return "miss";
			}
			if (_board[x][y] !== markers.ship) return false;

			const attackedShip = _getAttackedShip([x, y]);
			attackedShip.hit();

			_board[x][y] = markers.hit;

			if (!attackedShip.isSunk())
				return {
					board: this.getBoard(),
					squares: _getCornerSquares(x, y),
				};

			for (const [x, y] of attackedShip.getAdjacentSquares()) {
				if (_board[x][y] === markers.adjacent) _board[x][y] = markers.verified;
			}
			return {
				board: this.getBoard(),
				squares: [
					...attackedShip.getOccupiedSquares(),
					...attackedShip.getAdjacentSquares(),
				],
			};
		},

		hasLost: () => {
			for (const ship of _ships) {
				if (ship.isSunk() === false) return false;
			}
			return true;
		},

		createRandomLayout: function () {
			let length;
			let coordinates;
			let angle;
			// [[NOTE TO SELF ]]
			// Use a set of predefined ships that you want to use
			// example 1 ship of length 5,
			// 2 ships for length 3
			// 5 ships of length 1
			// instead of maginc values like 10
			for (let i = 0; i < 10; i++) {
				do {
					length = _getRandom(5, 1);
					coordinates = [_getRandom(9, 0), _getRandom(9, 0)];
					angle = _getRandom(2, 0) === 1 ? 180 : 90;
				} while (this.placeShip(coordinates, angle, length) === false);
			}
		},

		resetBoard: () => {
			_ships = [];
			for (let i = 0; i < _board.length; i++) {
				for (let j = 0; j < _board.length; j++) {
					if (_board[i][j] !== markers.empty) _board[i][j] = markers.empty;
				}
			}
		},
	};

	return Object.assign(_gameboardInterface(state));
}

const _pipeComputer = pipeline(_gameboardAndComputerChoiceInterface);

export default function Player(type, side) {
	const playerType = type ? "computer" : "human";

	const state = {
		getChoice: (board) => {
			try {
				if (board === undefined) throw new Error("No board provided");
			} catch (err) {
				return console.error(err);
			}

			const validSquares = board.reduce((acc, row, x) => {
				for (let y = 0; y < row.length; y++) {
					if (
						row[y] === markers.empty ||
						row[y] === markers.ship ||
						row[y] === markers.adjacent
					)
						acc.push([x, y]);
				}
				return acc;
			}, []);

			const choice = Math.floor(Math.random() * validSquares.length);
			return validSquares[choice];
		},
	};

	const composite = playerType === "computer" ? _pipeComputer(state) : {};
	return Object.assign({}, _Gameboard(), composite, { playerType, side });
}
