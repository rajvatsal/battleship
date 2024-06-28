import populateGrid from "./DisplayGameboard.js";
import pubsub from "./Pubsub.js";

const $ = document.querySelector.bind(document);
const leftBoard = $(".gameboards__left__board");
const rightBoard = $(".gameboards__right__board");
const classes = {
	X: () => currentSquare.setAttribute("class", "hit"),
	O: () => currentSquare.setAttribute("class", "miss"),
	".": () => currentSquare.setAttribute("class", "verified-tile"),
	1: () => currentSquare.setAttribute("class", "visible-ship"),
	null: () => currentSquare.setAttribute("class", ""),
};
const btnRandomize = $(".options__buttons__randomize");
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
	classes[value]();
}

function _gameOver(side) {
	if (side === "player-one") alert("You won :)");
	else alert("You Lost :_(");
}

function _initializeBoard(board) {
	const leftBoardDOM = leftBoard.querySelectorAll("button");
	for (let i = 0; i < leftBoardDOM.length; i++) {
		const [x, y] = leftBoardDOM[i].getAttribute("data-coordinates").split("-");
		currentSquare = leftBoardDOM[i];
		classes[board[x][y]]();
	}
}

rightBoard.addEventListener("mousedown", _clickHandlerRightGrid);
btnRandomize.addEventListener("mousedown", () =>
	pubsub.emit("Randomize Player One"),
);

pubsub.on("UpdateBoard", _updateBoard);
pubsub.on("GameOver", _gameOver);
pubsub.on("Initialized Game", _initializeBoard);
pubsub.on("Randomized Player One", _initializeBoard);
