import Player from "./Player.js";
import pubsub from "./Pubsub.js";

const playerOne = Player(1, "player-one");
const playerTwo = Player(1, "player-two");

function _receivedAttack({ side, coords }) {
	const attackedPlayer = playerOne.side === side ? playerOne : playerTwo;
	attackedPlayer.receiveAttack(coords);
	pubsub.emit("UpdateBoard", attackedPlayer.getBoard()[coords[0]][coords[1]]);
	if (attackedPlayer.isGameOver()) pubsub.emit("GameOver", attackedPlayer.side);
}

playerTwo.createRandomLayout();

pubsub.on("ReceivedAttack", _receivedAttack);
