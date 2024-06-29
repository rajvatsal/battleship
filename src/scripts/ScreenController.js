import populateGrid from "./DisplayGameboard.js";
import pubsub from "./Pubsub.js";
import icons from "./Icons.js";

const classes = {
	X: () => {
		currentSquare.setAttribute("class", "hit");
		currentSquare.innerHTML = icons.cross;
	},
	O: () => {
		currentSquare.setAttribute("class", "miss");
		currentSquare.innerHTML = icons.dot;
	},
	".": () => currentSquare.setAttribute("class", ""),
	1: () => currentSquare.setAttribute("class", "visible-ship"),
	null: () => currentSquare.setAttribute("class", ""),
	"*": () => {
		currentSquare.setAttribute("class", "verified-tile");
		currentSquare.innerHTML = icons.dot;
	},
};

const $ = document.querySelector.bind(document);
const leftBoard = $(".gameboards__left__board");
const rightBoard = $(".gameboards__right__board");
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

function _shipSunk({ board, squares }) {
	for (const [x, y] of squares) {
		currentSquare = $(`.gameboards__right [data-coordinates="${x}-${y}"]`);
		classes[board[x][y]]();
	}
}

rightBoard.addEventListener("mousedown", _clickHandlerRightGrid);
btnRandomize.addEventListener("click", () =>
	pubsub.emit("Randomize Player One"),
);

pubsub.on("UpdateBoard", _updateBoard);
pubsub.on("GameOver", _gameOver);
pubsub.on("Initialized Game", _initializeBoard);
pubsub.on("Randomized Player One", _initializeBoard);
pubsub.on("ShipSunk", _shipSunk);
