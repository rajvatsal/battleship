import populateGrid from "./DisplayGameboard.js";
import pubsub from "./Pubsub.js";

const $ = document.querySelector.bind(document);
const leftBoard = $(".gameboards__left__board");
const rightBoard = $(".gameboards__right__board");
let currentSquare;

populateGrid(leftBoard);
populateGrid(rightBoard);

function _clickHandlerRightGrid(event) {
	const e = event.target;
	if (e.tagName !== "BUTTON") return;
	currentSquare = e;
	const coords = e.getAttribute("data-coordinates").split("-");
	const side = e.classList.contains("gameboards__left__board")
		? "player-one"
		: "player-two";
	pubsub.emit("ReceivedAttack", { side, coords });
}

function _updateBoard(value) {
	if (value === "X") currentSquare.classList.add("hit");
	else currentSquare.classList.add("miss");
}

rightBoard.addEventListener("mousedown", _clickHandlerRightGrid);

pubsub.on("UpdateBoard", _updateBoard);
