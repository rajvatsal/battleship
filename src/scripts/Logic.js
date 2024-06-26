import { emit, on, off } from "./pub-sub.js";

const shipInterface = (state) => ({
	type: "Ship Interface",
	isSunk: () => state.isSunk(),
	hit: () => state.hit(),
	getOccupiedSquares: () => state.getOccupiedSquares(),
});

export function Ship(coord, len = 1, angle = 90) {
	try {
		if (!coord.length) throw new Error("Not valid coordinates");
		if (angle !== 90 && angle !== 180) throw new Error("Not valid angle");
	} catch (msg) {
		return console.error(msg);
	}

	const _MAX_LENGTH = 4;
	const _MIN_LENGTH = 1;
	const _length =
		len > _MAX_LENGTH ? _MAX_LENGTH : len < _MIN_LENGTH ? _MIN_LENGTH : len;
	let _hitCount = 0;
	const _occupiedSquares = [];
	for (let i = 0; i < _length; i++) {
		const coords =
			angle === 90 ? [coord[0] + i, coord[1]] : [coord[0], coord[1] + i];
		_occupiedSquares.push(coords);
	}

	const proto = {
		hit: () => ++_hitCount,
		isSunk: () => _length <= _hitCount && _hitCount > 0,
		getOccupiedSquares: () => _occupiedSquares,
	};

	return Object.assign(Object.create(shipInterface(proto)));
}

export function Gameboard() {
	const _ships = [];
	const _board = [];
	for (let i = 0; i < 10; i++) {
		_board.push(Array(10).fill(null));
	}

	const getBoard = () => _board;
	const placeShip = (coord, angle, len) => {
		const [x, y] = coord;
		// I can create occupied squares array here too and just send them to ship factory
		for (let i = 0; i < len; i++) {
			if (angle === 90) _board[i + x][y] = 1;
			else _board[x][i + y] = 1;
		}

		_ships.push(Ship(coord, len, angle));
	};

	const _getAttackedShip = ([a, b]) => {
		for (const ship of _ships) {
			const squares = ship.getOccupiedSquares();
			for (const square of squares) {
				if (square[0] === a && square[1] === b) return ship;
			}
		}
	};

	const receiveAttack = ([x, y]) => {
		if (_board[x][y] === "O") return;
		if (_board[x][y] === "X") return;
		if (_board[x][y] === null) {
			_board[x][y] = "O";
			return;
		}

		_board[x][y] = "X";
		_getAttackedShip([x, y]).hit();
	};

	return { getBoard, placeShip, receiveAttack };
}
