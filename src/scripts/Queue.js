export default function Queue() {
	let queue = [];

	const enqueue = (...items) => {
		for (const item of items) {
			queue.push(item);
		}
	};
	const dequeue = () => {
		const first = queue[0];
		queue = queue.slice(1);
		return first;
	};
	const isEmpty = () => queue.length === 0;
	const empty = () => {
		queue = [];
	};
	const getLength = () => queue.length;

	return { enqueue, dequeue, isEmpty, empty, getLength };
}
