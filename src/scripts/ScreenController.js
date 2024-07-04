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
const btnStartGame = $("button.btn-start");
const btnResetGame = $(".options__buttons__reset");

// I have to do it this way because only the callback function
// from event handler has access to e.target. So the e.target is
// stored in this variable becuase to run the function after the
// return statement from pubsub (add appropriate styling to that square in
// updateBoard function()
let currentSquare;

populateGrid(leftBoard);
populateGrid(rightBoard);

function _clickHandlerRandomBoard() {
	pubsub.emit("Randomize Player One");
}

function _clickHandlerResetGame() {
	pubsub.emit("ResetGamePre");
	leftBoard.removeEventListener("mousedown", _clickHandlerAttack);
	rightBoard.removeEventListener("mousedown", _clickHandlerAttack);
}

function _clickHandlerStartGame() {
	rightBoard.addEventListener("mousedown", _clickHandlerAttack);
	leftBoard.addEventListener("mousedown", _clickHandlerAttack);
	btnRandomize.removeEventListener("click", _clickHandlerRandomBoard);
	this.setAttribute("data-game-state", "started");
}

function _clickHandlerAttack(e) {
	const target = e.target;
	if (target.tagName !== "BUTTON") return;
	if (target.classList.contains("btn-start")) return;

	const side = this.classList.contains("gameboards__left__board")
		? "left"
		: "right";
	const coords = target.getAttribute("data-coordinates").split("-");
	currentSquare = target;
	pubsub.emit("ReceivedAttack", { coords, side });
}

function _resetGamePost([left]) {
	_initializeGame({ board: left, side: "left" });
	const buttons = rightBoard.querySelectorAll("button:not(.btn-start)");
	for (const button of buttons) {
		button.innerHTML = "";
		button.setAttribute("class", "");
	}
}

function _showActivePlayer(side) {
	if (side === "left") {
		leftBoard.classList.add("active");
		rightBoard.classList.remove("active");
	} else {
		rightBoard.classList.add("active");
		leftBoard.classList.remove("active");
	}
}

function _updateBoard({ symbol, side, isShipHit }) {
	classes[symbol]();

	if (isShipHit !== false) return _renderVerifiedSquares(isShipHit, side);
	_showActivePlayer(side === "left" ? "right" : "left");
}

function _gameOver(side) {
	if (side === "player-one") alert("You won :)");
	else alert("You Lost :_(");
}

function _renderBoard({ board, side }) {
	const buttons = document.querySelectorAll(
		`.gameboards__${side}__board > button:not(.btn-start)`,
	);
	for (const button of buttons) {
		const [x, y] = button.getAttribute("data-coordinates").split("-");
		currentSquare = button;
		classes[board[x][y]]();
		button.innerHTML = "";
	}
}

function _initializeGame({ board, side }) {
	const activeBoard = side === "left" ? leftBoard : rightBoard;
	activeBoard.classList.add("active");
	_renderBoard({ board, side });
	// [[NOTE TO SELF]]
	// When the user presses button a lot of times continuously then
	// the page freezes. Fix it.
	btnRandomize.addEventListener("click", _clickHandlerRandomBoard);
	btnStartGame.setAttribute("data-game-state", "not-started");
	btnStartGame.addEventListener("mousedown", _clickHandlerStartGame);
	btnResetGame.addEventListener("mousedown", _clickHandlerResetGame);
}

function _renderVerifiedSquares({ board, squares }, side) {
	for (const [x, y] of squares) {
		const square = $(
			`.gameboards__${side}__board > [data-coordinates="${x}-${y}"]`,
		);
		classes[board[x][y]](square);
	}
}

pubsub.on("UpdateBoard", _updateBoard);
pubsub.on("GameOver", _gameOver);
pubsub.on("Initialized Game", _initializeGame);
pubsub.on("Randomized Player One", _renderBoard);
pubsub.on("ResetGamePost", _resetGamePost);
