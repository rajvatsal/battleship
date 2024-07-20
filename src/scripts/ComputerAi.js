import { isArrayEqual, markers } from "./Helpers.js";
import Queue from "./Queue.js";

const aiInterface = (state) => ({
	interface: "AI interface",
	attack: (i) => state.attack(i),
});

const aiStatusInterface = (state) => ({
	resetStatus: () => state.resetStatus(),
	setAnchor: (i) => state.setAnchor(i),
	setPrevCoords: (i) => state.setPrevCoords(i),
	setPrevStatus: (i) => state.setPrevStatus(i),
	isAnchorNull: () => state.isAnchorNull(),
});

const aiAndStatusInterface = (state) =>
	Object.assign(aiInterface(state), aiStatusInterface(state), {
		interface: "AI  And Status Interface",
	});

function _getRandomSquare(board) {
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
}

export default function computerAi() {
	const Q = Queue();

	const shipStatus = {
		anchor: null,
		previous: {
			status: null,
			method: null,
			coord: null,
		},
	};

	const attack = (board) => {
		const previous = shipStatus.previous;
		if (shipStatus.anchor === null) return _getRandomSquare(board);
		if (previous.status === "miss" && !Q.isEmpty()) {
			previous.method = Q.dequeue();
			return previous.method();
		}
		console.log(shipStatus.anchor, previous.coord);
		if (isArrayEqual(shipStatus.anchor, previous.coord)) {
			for (const fn in directions) Q.enqueue(fn);
			previous.method = Q.dequeue();
			return previous.method();
		}
		if (previous.status === "hit") {
			if (!Q.isEmpty()) Q.empty();
			return previous.method();
		}
		if (previous.status === "miss") return getOpposite(previous.method)();
	};

	const resetStatus = () => {
		const previous = shipStatus.previous;
		shipStatus.anchor = null;
		for (const i in previous) previous[i] = null;
	};

	const setAnchor = (anchor) => (shipStatus.anchor = anchor);
	const setPrevCoords = (coords) => (shipStatus.previous.coord = coords);
	const setPrevStatus = (status) => (shipStatus.previous.status = status);
	const isAnchorNull = () => shipStatus.anchor === null;

	const state = {
		attack,
		resetStatus,
		setAnchor,
		setPrevCoords,
		setPrevStatus,
		isAnchorNull,
	};

	return aiAndStatusInterface(state);
}
