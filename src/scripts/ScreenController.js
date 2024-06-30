import populateGrid from "./DisplayGameboard.js";
import pubsub from "./Pubsub.js";
import icons from "./Icons.js";

const classes = {
	X: (cs = currentSquare) => {
		cs.setAttribute("class", "hit");
		cs.innerHTML = icons.cross;
	},
	O: (cs = currentSquare) => {
		cs.setAttribute("class", "miss");
		cs.innerHTML = icons.dot;
	},
	".": (cs = currentSquare) => cs.setAttribute("class", ""),
	1: (cs = currentSquare) => cs.setAttribute("class", "visible-ship"),
	null: (cs = currentSquare) => cs.setAttribute("class", ""),
	"*": (cs = currentSquare) => {
		cs.setAttribute("class", "verified-tile");
		cs.innerHTML = icons.dot;
	},
};

const $ = document.querySelector.bind(document);
const leftBoard = $(".gameboards__left__board");
const rightBoard = $(".gameboards__right__board");
const btnRandomize = $(".options__buttons__randomize");

// I have to do it this way because only the callback function
// from event handler has access to e.target. So that e.target is
// stored in this variable becuase to run the function after the
// return statement from pubsub (add appropriate styling to that square in
// updateBoard function()
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

function _showVerified({ board, squares }) {
	for (const [x, y] of squares) {
		const selector = `.gameboards__right [data-coordinates="${x}-${y}"]`;
		classes[board[x][y]]($(selector));
	}
}

rightBoard.addEventListener("mousedown", _clickHandlerRightGrid);
// [[NOTE TO SELF]]
// When the user presses button a lot of times continuously then
// the page freezes. Fix it.
btnRandomize.addEventListener("click", () =>
	pubsub.emit("Randomize Player One"),
);

pubsub.on("UpdateBoard", _updateBoard);
pubsub.on("GameOver", _gameOver);
pubsub.on("Initialized Game", _initializeBoard);
pubsub.on("Randomized Player One", _initializeBoard);
pubsub.on("ShowVerifiedSquares", _showVerified);
