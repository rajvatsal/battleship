// Fix magic values
// "." adjacent square
// "X" hit
// "O" miss
// "1" ship that is not hit yet
// null empty

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
	isGameOver: () => state.isGameOver(),
});

function _Ship(coveredSq, adjacentSq, len = 1) {
	const _MAX_LENGTH = 4;
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
	const _ships = [];
	const _board = [];
	for (let i = 0; i < 10; i++) {
		_board.push(Array(10).fill(null));
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
			if (_board[currentSquare[0]][currentSquare[1]] !== null) return [];
			squares.push(currentSquare);
		}
		return squares;
	};

	const state = {
		getBoard: () => _board,
		placeShip: (coord, angle, len) => {
			const occupiedSq = _getCoveredSquares(coord, angle, len);
			if (occupiedSq.length === 0) return false;
			for (const [x, y] of occupiedSq) {
				_board[x][y] = 1;
			}
			const adjacentSq = _getAdjacentTiles(occupiedSq);
			for (const [x, y] of adjacentSq) {
				_board[x][y] = _board[x][y] !== null ? _board[x][y] : ".";
			}
			_ships.push(_Ship(occupiedSq, adjacentSq, len));
		},
		receiveAttack: ([x, y]) => {
			if (_board[x][y] === "O") return;
			if (_board[x][y] === "X") return;
			if (_board[x][y] === ".") return;
			if (_board[x][y] === null) {
				_board[x][y] = "O";
				return;
			}

			_board[x][y] = "X";
			_getAttackedShip([x, y]).hit();
		},

		isGameOver: () => {
			for (const ship of _ships) {
				if (ship.isSunk() === false) return false;
			}
			return true;
		},
	};

	return Object.assign(_gameboardInterface(state));
}

export default function Player(type, side) {
	const playerType = type ? "computer" : "human";
	return Object.assign(_Gameboard(), { playerType, side });
}
