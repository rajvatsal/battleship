import Player from "./Player.js";
import pubsub from "./Pubsub.js";

const playerOne = Player(0, "left");
const playerTwo = Player(1, "right");
const players = [playerOne, playerTwo];
const computerDelay = 1200;
let activePlayer = playerTwo;
let attackedPlayer = playerOne;

export const getActiveBoard = () => attackedPlayer.side;

function _switchTurn() {
	const z = activePlayer;
	activePlayer = attackedPlayer;
	attackedPlayer = z;
}

function _receivedAttack({ side, coords }) {
	if (side !== attackedPlayer.side) return;

	const attackData = attackedPlayer.receiveAttack(coords);

	if (attackData === false) return;

	const [x, y] = coords;
	const symbol = attackedPlayer.getBoard()[x][y];

	if (attackedPlayer.hasLost())
		return pubsub.emit("GameOver", attackedPlayer.side);
	if (attackData === "miss") _switchTurn();
	if (activePlayer.playerType === "computer")
		setTimeout(_runComputer, computerDelay);

	pubsub.emit("ReceivedAttackPost", {
		symbol,
		side,
		attackData,
		coords,
	});
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

	activePlayer = playerTwo;
	attackedPlayer = playerOne;
	pubsub.emit("ResetGamePost", [playerOne.getBoard(), playerTwo.getBoard()]);
}

playerOne.createRandomLayout();
playerTwo.createRandomLayout();

pubsub.on("ReceivedAttackPre", _receivedAttack);
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
