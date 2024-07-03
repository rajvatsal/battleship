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
// from event handler has access to e.target. So the e.target is
// stored in this variable becuase to run the function after the
// return statement from pubsub (add appropriate styling to that square in
// updateBoard function()
let currentSquare;

populateGrid(leftBoard);
populateGrid(rightBoard);

function _switchTurn(side) {
	if (side === "left") {
		leftBoard.classList.add("active");
		rightBoard.classList.remove("active");
	} else {
		rightBoard.classList.add("active");
		leftBoard.classList.remove("active");
	}
}

function _clickHandlerAttack(e) {
	const target = e.target;
	if (target.tagName !== "BUTTON") return;

	const side = this.classList.contains("gameboards__left__board")
		? "left"
		: "right";
	const coords = target.getAttribute("data-coordinates").split("-");
	currentSquare = target;
	pubsub.emit("ReceivedAttack", { coords, side });
}

function _updateBoard({ symbol, side, isShipHit }) {
	classes[symbol]();

	if (isShipHit !== false) return _renderVerifiedSquares(isShipHit, side);
	_switchTurn(side === "left" ? "right" : "left");
}

function _gameOver(side) {
	if (side === "player-one") alert("You won :)");
	else alert("You Lost :_(");
}

function renderEntireBoard({ board, side }) {
	const buttons = document.querySelectorAll(
		`.gameboards__${side}__board > button`,
	);
	for (let i = 0; i < buttons.length; i++) {
		const [x, y] = buttons[i].getAttribute("data-coordinates").split("-");
		currentSquare = buttons[i];
		classes[board[x][y]]();
	}
}

function _initializeGame({ board, side }) {
	const activeBoard = side === "left" ? leftBoard : rightBoard;
	activeBoard.classList.add("active");
	renderEntireBoard({ board, side });
}

function _renderVerifiedSquares({ board, squares }, side) {
	for (const [x, y] of squares) {
		const square = $(
			`.gameboards__${side}__board > [data-coordinates="${x}-${y}"]`,
		);
		classes[board[x][y]](square);
	}
}

rightBoard.addEventListener("mousedown", _clickHandlerAttack);
leftBoard.addEventListener("mousedown", _clickHandlerAttack);
// [[NOTE TO SELF]]
// When the user presses button a lot of times continuously then
// the page freezes. Fix it.
btnRandomize.addEventListener("click", () =>
	pubsub.emit("Randomize Player One"),
);

pubsub.on("UpdateBoard", _updateBoard);
pubsub.on("GameOver", _gameOver);
pubsub.on("Initialized Game", _initializeGame);
pubsub.on("Randomized Player One", renderEntireBoard);
