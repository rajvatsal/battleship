import getRandomSquare from "./RandomTile.js";
import Queue from "./Queue.js";
import {
	pipeline,
	markers,
	getRandom,
	directions,
	validSquare,
	getOppositeDirection,
	isArrayEqual,
} from "./Helpers.js";

// Interfaces
const shipInterface = (state) => ({
	interface: "Ship Interface",
	isSunk: () => state.isSunk(),
	hit: () => state.hit(),
	getOccupiedSquares: () => state.getOccupiedSquares(),
	getAdjacentSquares: () => state.getAdjacentSquares(),
});

const gameboardInterface = (state) => ({
	interface: "Gameboard Interface",
	getBoard: () => state.getBoard(),
	placeShip: (coord, angle, len) => state.placeShip(coord, angle, len),
	receiveAttack: (coord) => state.receiveAttack(coord),
	hasLost: () => state.hasLost(),
	createRandomLayout: () => state.createRandomLayout(),
	resetBoard: () => state.resetBoard(),
});

const aiInterface = (state) => ({
	interface: "AI Interface",
	attack: (i) => state.attack(i),
	resetStatus: () => state.resetStatus(),
	setAnchor: (i) => state.setAnchor(i),
	setPrevCoords: (i) => state.setPrevCoords(i),
	setPrevStatus: (i) => state.setPrevStatus(i),
	isAnchorNull: () => state.isAnchorNull(),
});

// Classes
function Ship(coveredSq, adjacentSq, len = 1) {
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

	return Object.assign(shipInterface(state));
}

function Gameboard() {
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
					if (coveredTiles.some((sq) => isArrayEqual([i, j], sq))) continue;
					if (adjacent.some((sq) => isArrayEqual([i, j], sq))) continue;
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
			_ships.push(Ship(occupiedSq, adjacentSq, len));
		},
		receiveAttack: function ([x, y]) {
			x = Number.parseInt(x);
			y = Number.parseInt(y);
			if (_board[x][y] === markers.empty || _board[x][y] === markers.adjacent) {
				_board[x][y] = markers.miss;
				return { status: "miss" };
			}
			if (_board[x][y] !== markers.ship) return { status: "Invalid" };

			const attackedShip = _getAttackedShip([x, y]);
			attackedShip.hit();

			_board[x][y] = markers.hit;

			if (!attackedShip.isSunk())
				return {
					status: "hit",
					board: this.getBoard(),
					squares: _getCornerSquares(x, y),
				};

			for (const [x, y] of attackedShip.getAdjacentSquares()) {
				if (_board[x][y] === markers.adjacent) _board[x][y] = markers.verified;
			}
			return {
				status: "sunk",
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
			if (_ships.length > 0) this.resetBoard();
			const shipLengths = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
			let length;
			let coordinates;
			let angle;
			for (const len of shipLengths) {
				do {
					length = len;
					coordinates = [getRandom(9, 0), getRandom(9, 0)];
					angle = getRandom(2, 0) === 1 ? 180 : 90;
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

	return Object.assign(gameboardInterface(state));
}

function computerAi() {
	const _Q = Queue();

	const _status = {
		anchor: null,
		previous: {
			status: null,
			method: null,
			coord: null,
		},
	};

	const attack = (board) => {
		const anchor = _status.anchor;
		const prevCoord = _status.previous.coord;
		const previous = _status.previous;
		if (anchor === null) return getRandomSquare(board);
		if (previous.status === "miss" && !_Q.isEmpty()) {
			const len = _Q.getLength();
			for (let i = 0; i < len; i++) {
				previous.method = _Q.dequeue();
				const [x, y] = directions[previous.method](anchor);
				if (validSquare(board, x, y)) return [x, y];
			}
		}
		if (isArrayEqual(anchor, prevCoord)) {
			for (const fn in directions) _Q.enqueue(fn);
			const len = _Q.getLength();
			for (let i = 0; i < len; i++) {
				previous.method = _Q.dequeue();
				const [x, y] = directions[previous.method](anchor);
				if (validSquare(board, x, y)) return [x, y];
			}
		}
		if (previous.status === "hit") {
			if (!_Q.isEmpty()) _Q.empty();
			const [x, y] = directions[previous.method](prevCoord);
			if (validSquare(board, x, y)) return [x, y];
			previous.method = getOppositeDirection(previous.method);
			return directions[previous.method](anchor);
		}
		if (previous.status === "miss") {
			previous.method = getOppositeDirection(previous.method);
			return directions[previous.method](anchor);
		}
	};

	const resetStatus = () => {
		const previous = _status.previous;
		_status.anchor = null;
		for (const i in previous) previous[i] = null;
	};

	const setAnchor = (anchor) => (_status.anchor = anchor);
	const setPrevCoords = (coords) => (_status.previous.coord = coords);
	const setPrevStatus = (status) => (_status.previous.status = status);
	const isAnchorNull = () => _status.anchor === null;

	const state = {
		attack,
		resetStatus,
		setAnchor,
		setPrevCoords,
		setPrevStatus,
		isAnchorNull,
	};

	return aiInterface(state);
}

function Player({ type, side }) {
	const playerType = type ? "computer" : "human";
	if (playerType === "human") return Object.assign({}, { playerType, side });
	return Object.assign({}, { ai: computerAi() }, { playerType, side });
}

// Player with a gameboard
export default pipeline(Gameboard, Player);
