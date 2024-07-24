// todo
// make intial attack yellow find a better solution than current one
import populateGrid from "./DisplayGameboard.js";
import pubsub from "./Pubsub.js";
import icons from "./Icons.js";
import getIndexes from "./components/BoardIndex.js";
import getLogo from "./components/Logo.js";
import { getActiveBoard } from "./GameController.js";

const classes = {
	X: (cs = currentSquare) => {
		cs.setAttribute("class", "hit");
		cs.innerHTML = icons.cross;
	},
	O: (cs = currentSquare) => {
		cs.setAttribute("class", "miss-new");
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
const btnRandomize = $(".options__btn__container:nth-child(1)");
const btnStartGame = $("button.btn-start");
const btnResetGame = $(".options__btn__container:nth-child(2)");

// Add Indexes
const { columns: c1, rows: r1 } = getIndexes();
const { columns: c2, rows: r2 } = getIndexes();

leftBoard.append(c1, r1);
rightBoard.append(c2, r2);

// I have to do it this way because only the callback function
// from event handler has access to e.target. So the e.target is
// stored in this variable becuase to run the function after the
// return statement from pubsub (add appropriate styling to that square in
// updateBoard function()
let currentSquare = null;
let oldMiss = { left: null, right: null };

populateGrid(leftBoard);
populateGrid(rightBoard);

function clickHandlerRandomBoard() {
	pubsub.emit("RandomBoardHumanPre");
}

function clickHandlerResetGame() {
	rightBoard.removeEventListener("mousedown", clickHandlerAttack);
	btnRandomize.addEventListener("mousedown", clickHandlerRandomBoard);
	leftBoard.classList.add("appear");
	rightBoard.classList.remove("appear");
	btnStartGame.setAttribute("data-game-state", "not-started");

	pubsub.emit("ResetGamePre");
}

function clickHandlerStartGame() {
	rightBoard.addEventListener("mousedown", clickHandlerAttack);
	rightBoard.classList.add("human");
	btnResetGame.addEventListener("mousedown", clickHandlerResetGame, {
		once: true,
	});
	btnRandomize.removeEventListener("mousedown", clickHandlerRandomBoard);
	this.setAttribute("data-game-state", "started");
	pubsub.emit("StartGamePre");
}

function clickHandlerAttack(e) {
	const target = e.target;
	if (target.tagName !== "BUTTON") return;
	if (target.classList.contains("btn-start")) return;

	const side = this.classList.contains("gameboards__left__board")
		? "left"
		: "right";
	const coords = target.getAttribute("data-coordinates").split("-");
	currentSquare = target;
	pubsub.emit("ReceivedAttackPre", { coords, side });
}

function resetGamePost([left]) {
	renderBoard({ board: left, side: "left" });
	const buttons = rightBoard.querySelectorAll("button:not(.btn-start)");

	// remove icons and styles
	for (const button of buttons) {
		button.innerHTML = "";
		button.setAttribute("class", "");
	}
}

function showActivePlayer(side) {
	if (side === "left") {
		leftBoard.classList.add("appear");
		rightBoard.classList.remove("appear");
	} else {
		rightBoard.classList.add("appear");
		leftBoard.classList.remove("appear");
	}
}

function updateBoard({ symbol, side, attackOutcome, coords }) {
	const [x, y] = coords;
	const board = side === "left" ? leftBoard : rightBoard;
	const square = board.querySelector(`[data-coordinates="${x}-${y}"]`);

	// reset old miss
	if (oldMiss[side] !== null) oldMiss[side].setAttribute("class", "miss-old");
	// mark square that was attacked
	classes[symbol](square);

	// if attacke was successful then show verfied squares
	if (attackOutcome.status === "Invalid") return;
	if (attackOutcome.status === "miss") {
		oldMiss[side] = square;
		return showActivePlayer(getActiveBoard());
	}
	renderVerifiedSquares(attackOutcome, side);
}

function gameOver(side) {
	if (side === "right") alert("You won :)");
	else alert("You Lost :_(");
}

function renderBoard({ board, side }) {
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

function initializeGame({ board, side }) {
	const attackedBoard = side === "left" ? leftBoard : rightBoard;
	attackedBoard.classList.add("appear");
	renderBoard({ board, side });
	btnRandomize.addEventListener("mousedown", clickHandlerRandomBoard);
	btnStartGame.setAttribute("data-game-state", "not-started");
	btnStartGame.addEventListener("mousedown", clickHandlerStartGame);
}

function renderVerifiedSquares({ board, squares }, side) {
	for (const [x, y] of squares) {
		const square = $(
			`.gameboards__${side}__board > [data-coordinates="${x}-${y}"]`,
		);
		if (board[x][y] === "O") square.setAttribute("class", "miss-old");
		else classes[board[x][y]](square);
	}
}

pubsub.on("ReceivedAttackPost", updateBoard);
pubsub.on("GameOver", gameOver);
pubsub.on("InitializePagePost", initializeGame);
pubsub.on("RandomBoardHumanPost", renderBoard);
pubsub.on("ResetGamePost", resetGamePost);
