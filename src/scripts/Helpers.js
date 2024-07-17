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
