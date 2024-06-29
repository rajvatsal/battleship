import Player from "./Player.js";
import pubsub from "./Pubsub.js";

const playerOne = Player(1, "player-one");
const playerTwo = Player(1, "player-two");

function _receivedAttack({ side, coords }) {
	const attackedPlayer = playerOne.side === side ? playerOne : playerTwo;
	const isShipSunk = attackedPlayer.receiveAttack(coords);
	if (isShipSunk) pubsub.emit("ShowVerifiedSquares", isShipSunk);
	pubsub.emit("UpdateBoard", attackedPlayer.getBoard()[coords[0]][coords[1]]);
	if (attackedPlayer.hasLost()) pubsub.emit("GameOver", attackedPlayer.side);
}

playerOne.createRandomLayout();
playerTwo.createRandomLayout();

pubsub.on("ReceivedAttack", _receivedAttack);
pubsub.on("Initialize Page", () =>
	pubsub.emit("Initialized Game", playerOne.getBoard()),
);
pubsub.on("Randomize Player One", () => {
	playerOne.resetBoard();
	playerOne.createRandomLayout();
	pubsub.emit("Randomized Player One", playerOne.getBoard());
});
