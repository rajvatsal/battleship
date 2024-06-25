import { emit, on, off } from "./pub-sub.js";

const shipInterface = (state) => ({
	type: "Ship Interface",
	isSunk: () => state.isSunk(),
	hit: () => state.hit(),
});

export function Ship(len = 1) {
	const MAX_LENGTH = 4;
	const MIN_LENGTH = 1;
	const length =
		len > MAX_LENGTH ? MAX_LENGTH : len < MIN_LENGTH ? MIN_LENGTH : len;
	let hitCount = 0;

	const proto = {
		hit: () => ++hitCount,
		isSunk: () => length <= hitCount && hitCount > 0,
	};

	return Object.assign(Object.create(shipInterface(proto)));
}

export function Gameboard() {
	const board = [];
	for (let i = 0; i < 10; i++) {
		board.push(Array(10).fill(null));
	}

	const getBoard = () => board;
	const placeShip = (coord, orientation, len) => {
		const [x, y] = coord;
		for (let i = 0; i < len; i++) {
			if (orientation === 90) board[i + x][y] = 1;
			else board[x][i + y] = 1;
		}

		return Ship(len);
	};

	return { getBoard, placeShip };
}
