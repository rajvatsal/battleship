import { emit, on, off } from "./pub-sub.js";

export function Ship(len = 1) {
	const MAX_LENGTH = 4;
	const MIN_LENGTH = 1;
	const length = len > MAX_LENGTH ? 4 : len < MIN_LENGTH ? 1 : len;
	let hitCount = 0;
	const hit = () => ++hitCount;
	const isSunk = () => length <= hitCount && hitCount > 0;
	return { hit, isSunk };
}
