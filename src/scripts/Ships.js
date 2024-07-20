import { getRandom } from "./Helpers.js";

const shipInterface = (state) => ({
	interface: "Ship Interface",
	isSunk: () => state.isSunk(),
	hit: () => state.hit(),
	getOccupiedSquares: () => state.getOccupiedSquares(),
	getAdjacentSquares: () => state.getAdjacentSquares(),
});

export default function Ship(coveredSq, adjacentSq, len = 1) {
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
