import Player from "./Player.js";
import pubsub from "./Pubsub.js";

const playerOne = Player(1, "left");
const playerTwo = Player(1, "right");
const players = [playerOne, playerTwo];

let activePlayer = playerOne;
const _switchTurn = () => (activePlayer === playerOne ? playerTwo : playerOne);

function _receivedAttack({ side, coords }) {
	if (side !== activePlayer.side) return;
	const isShipHit = activePlayer.receiveAttack(coords);
	pubsub.emit("UpdateBoard", {
		symbol: activePlayer.getBoard()[coords[0]][coords[1]],
		side,
		isShipHit,
	});
	if (activePlayer.hasLost()) pubsub.emit("GameOver", activePlayer.side);
	activePlayer = isShipHit === false ? _switchTurn() : activePlayer;
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
pubsub.on("Initialize Page", () =>
	pubsub.emit("Initialized Game", {
		board: activePlayer.getBoard(),
		side: activePlayer.side,
	}),
);
pubsub.on("Randomize Player One", () => {
	playerOne.resetBoard();
	playerOne.createRandomLayout();
	pubsub.emit("Randomized Player One", {
		board: activePlayer.getBoard(),
		side: activePlayer.side,
	});
});
pubsub.on("ResetGamePre", _resetGame);
