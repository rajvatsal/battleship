export const pipeline =
	(...interfaces) =>
	(state) =>
		interfaces.reduce(
			(composite, inf) => Object.assign(composite, inf(state)),
			{},
		);

export const markers = {
	adjacent: ".",
	hit: "X",
	miss: "O",
	ship: 1,
	verified: "*",
	empty: null,
};

export function isArrayEqual([x, y], [a, b]) {
	return x === a && y === b;
}

export function getRandom(max, limit) {
	const range = limit ? 1 : 0;
	return Math.floor(Math.random() * max + range);
}

export function validSquare(board, x, y) {
	if (x > 9 || y > 9) return false;
	if (x < 0 || y < 0) return false;
	const mark = board[x][y];
	if (
		mark === markers.empty ||
		mark === markers.ship ||
		mark === markers.adjacent
	)
		return true;
	return false;
}

export const directions = {
	left: ([x, y]) => [x - 1, y],
	right: ([x, y]) => [x + 1, y],
	up: ([x, y]) => [x, y - 1],
	down: ([x, y]) => [x, y + 1],
};

export function getOppositeDirection(str) {
	if (str === "left") return "right";
	if (str === "right") return "left";
	if (str === "up") return "down";
	if (str === "down") return "up";
}
