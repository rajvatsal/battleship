const _ce = document.createElement.bind(document);
export default function populateGrid(boardContainer) {
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			const square = _ce("button");
			square.setAttribute("data-coordinates", `${i}-${j}`);
			boardContainer.appendChild(square);
		}
	}
}
