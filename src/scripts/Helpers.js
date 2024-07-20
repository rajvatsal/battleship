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
