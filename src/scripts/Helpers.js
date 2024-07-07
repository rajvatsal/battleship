export const pipeline =
	(...interfaces) =>
	(state) =>
		interfaces.reduce(
			(composite, inf) => Object.assign(composite, inf(state)),
			{},
		);
