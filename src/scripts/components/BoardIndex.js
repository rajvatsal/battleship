const c = document.createElement.bind(document);

export default function () {
	const columns = c("div");
	const rows = c("div");

	const alphabets = [];
	const numbers = [];

	for (let i = 1; i <= 10; i++) {
		const column = c("span");
		const row = c("span");

		column.textContent = String.fromCharCode(65 + (i - 1));
		row.textContent = i;
		alphabets.push(column);
		numbers.push(row);
	}

	columns.classList.add("board__columns");
	rows.classList.add("board__rows");
	alphabets.forEach((a) => columns.appendChild(a));
	numbers.forEach((n) => rows.appendChild(n));

	return { columns, rows };
}
