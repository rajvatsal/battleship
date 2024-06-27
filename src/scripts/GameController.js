import Player from "./Player.js";
import pubsub from "./Pubsub.js";

const playerOne = Player(1, "player-one");
const playerTwo = Player(1, "player-two");

playerTwo.placeShip([0, 0], 180, 4);
playerTwo.placeShip([5, 0], 90, 4);
playerTwo.placeShip([5, 1], 180, 4);
playerTwo.placeShip([2, 0], 90, 2);

function _receivedAttack({ side, coords }) {
	const attackedPlayer = playerOne.side === side ? playerOne : playerTwo;
	attackedPlayer.receiveAttack(coords);
	pubsub.emit("UpdateBoard", attackedPlayer.getBoard()[coords[0]][coords[1]]);
	if (attackedPlayer.isGameOver()) pubsub.emit("GameOver", attackedPlayer.side);
}

pubsub.on("ReceivedAttack", _receivedAttack);
