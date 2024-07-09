import Player from "./Player.js";
import pubsub from "./Pubsub.js";

const playerOne = Player(0, "left");
const playerTwo = Player(1, "right");
const players = [playerOne, playerTwo];
const computerDelay = 1200;
let activePlayer = playerTwo;
let attackedPlayer = playerOne;

export const getActivePlayer = () => activePlayer.side;

function _switchTurn() {
	const z = activePlayer;
	activePlayer = attackedPlayer;
	attackedPlayer = z;
}

function _receivedAttack({ side, coords }) {
	if (side !== attackedPlayer.side) return;
	const attackData = attackedPlayer.receiveAttack(coords);
	const [x, y] = coords;
	if (attackData === false) return;
	pubsub.emit("UpdateBoard", {
		symbol: attackedPlayer.getBoard()[x][y],
		side,
		attackData,
		coords,
	});
	if (attackedPlayer.hasLost())
		return pubsub.emit("GameOver", attackedPlayer.side);
	if (attackData === "miss") _switchTurn();
	if (activePlayer.playerType === "computer")
		setTimeout(_runComputer, computerDelay);
}

function _runComputer() {
	const side = attackedPlayer.side;
	const coords = activePlayer.getChoice(attackedPlayer.getBoard());
	_receivedAttack({ side, coords });
}

function _resetGame() {
	for (const player of players) {
		player.resetBoard();
		player.createRandomLayout();
	}
	pubsub.emit("ResetGamePost", [playerOne.getBoard(), playerTwo.getBoard()]);
}

playerOne.createRandomLayout();
playerTwo.createRandomLayout();

pubsub.on("ReceivedAttack", _receivedAttack);
pubsub.on("InitializePagePre", () => {
	pubsub.emit("InitializePagePost", {
		board: playerOne.getBoard(),
		side: playerOne.side,
	});
});

pubsub.on("StartGamePre", () => {
	if (activePlayer.playerType === "computer")
		setTimeout(_runComputer, computerDelay);
});

pubsub.on("RandomBoardHumanPre", () => {
	const human = playerOne.playerType === "human" ? playerOne : playerTwo;
	human.resetBoard();
	human.createRandomLayout();
	pubsub.emit("RandomBoardHumanPost", {
		board: human.getBoard(),
		side: human.side,
	});
});
pubsub.on("ResetGamePre", _resetGame);
