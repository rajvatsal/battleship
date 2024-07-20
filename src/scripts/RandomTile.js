import { markers, validSquare } from "./Helpers.js";

export default function getRandomSquare(board) {
	const validSquares = board.reduce((acc, row, x) => {
		for (let y = 0; y < row.length; y++)
			if (validSquare(board, x, y)) acc.push([x, y]);

		return acc;
	}, []);

	const choice = Math.floor(Math.random() * validSquares.length);
	return validSquares[choice];
}
