import Player from "./Player.js";
import pubsub from "./Pubsub.js";
import { markers } from "./Helpers.js";

const playerOne = Player(0, "left");
const playerTwo = Player(1, "right");
const players = [playerOne, playerTwo];
const computerDelay = 1200;
let activePlayer = playerTwo;
let attackedPlayer = playerOne;

export const getActiveBoard = () => attackedPlayer.side;

function switchTurn() {
	const z = activePlayer;
	activePlayer = attackedPlayer;
	attackedPlayer = z;
}

function getComputerChoice(board) {
	const validSquares = board.reduce((acc, row, x) => {
		for (let y = 0; y < row.length; y++) {
			if (
				row[y] === markers.empty ||
				row[y] === markers.ship ||
				row[y] === markers.adjacent
			)
				acc.push([x, y]);
		}
		return acc;
	}, []);

	const choice = Math.floor(Math.random() * validSquares.length);
	return validSquares[choice];
}

function receivedAttack({ side, coords }) {
	if (side !== attackedPlayer.side) return;

	const attackData = attackedPlayer.receiveAttack(coords);

	if (attackData === false) return;

	const [x, y] = coords;
	const symbol = attackedPlayer.getBoard()[x][y];

	if (attackedPlayer.hasLost()) pubsub.emit("GameOver", attackedPlayer.side);
	if (attackData === "miss") switchTurn();
	if (activePlayer.playerType === "computer")
		setTimeout(runComputer, computerDelay);

	pubsub.emit("ReceivedAttackPost", {
		symbol,
		side,
		attackData,
		coords,
	});
}

function runComputer() {
	const side = attackedPlayer.side;
	const coords = getComputerChoice(attackedPlayer.getBoard());
	receivedAttack({ side, coords });
}

function resetGame() {
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

pubsub.on("ReceivedAttackPre", receivedAttack);
pubsub.on("InitializePagePre", () => {
	pubsub.emit("InitializePagePost", {
		board: playerOne.getBoard(),
		side: playerOne.side,
	});
});

pubsub.on("StartGamePre", () => {
	if (activePlayer.playerType === "computer")
		setTimeout(runComputer, computerDelay);
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
pubsub.on("ResetGamePre", resetGame);
