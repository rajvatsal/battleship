const _ce = document.createElement.bind(document);
const $ = document.querySelector.bind(document);
const $a = document.querySelectorAll.bind(document);

const btnReset = $(".options__buttons__reset");

export default function populateGrid(boardContainer) {
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			const square = _ce("button");
			square.setAttribute("data-coordinates", `${i}-${j}`);
			boardContainer.appendChild(square);
		}
	}
}

function _resetBoard() {
	const btns = $a(".board > button");

	for (const btn of btns) {
		btn.classList.remove("hit");
		btn.classList.remove("miss");
	}
}

btnReset.addEventListener("mousedown", _resetBoard);
