import Player from "./Player.js";
import pubsub from "./Pubsub.js";

const playerOne = Player({ type: 0, side: "left" });
const playerTwo = Player({ type: 1, side: "right" });
const players = [playerOne, playerTwo];
const computerDelay = 800;
let activePlayer = playerTwo;
let attackedPlayer = playerOne;
let compTimeout = null;

export const getActiveBoard = () => attackedPlayer.side;

function switchTurn() {
	const z = activePlayer;
	activePlayer = attackedPlayer;
	attackedPlayer = z;
}

function playRound({ side, coords }) {
	if (side !== attackedPlayer.side) return;

	const attackOutcome = attackedPlayer.receiveAttack(coords);
	if (activePlayer.playerType === "computer")
		updateComputerStatus(attackOutcome, coords);

	if (attackOutcome.status === "Invalid") return;

	const [x, y] = coords;
	const symbol = attackedPlayer.getBoard()[x][y];

	if (attackedPlayer.hasLost())
		return pubsub.emit("GameOver", attackedPlayer.side);
	if (attackOutcome.status === "miss") switchTurn();
	if (activePlayer.playerType === "computer") {
		compTimeout = setTimeout(runComputer, computerDelay);
	}

	pubsub.emit("ReceivedAttackPost", {
		symbol,
		side,
		attackOutcome,
		coords,
	});
}

function updateComputerStatus(outcome, coords) {
	const ai = activePlayer.ai;
	ai.setPrevStatus(outcome.status);
	if (outcome.status === "hit" && ai.isAnchorNull()) ai.setAnchor(coords);
	if (outcome.status === "sunk") ai.resetStatus();
}

function runComputer() {
	const side = attackedPlayer.side;
	const coords = activePlayer.ai.attack(attackedPlayer.getBoard());
	activePlayer.ai.setPrevCoords(coords);
	playRound({ side, coords });
}

function resetGame() {
	for (const player of players) {
		player.createRandomLayout();
	}

	activePlayer = playerTwo;
	attackedPlayer = playerOne;
	if (compTimeout !== null) clearTimeout(compTimeout);
	pubsub.emit("ResetGamePost", [playerOne.getBoard(), playerTwo.getBoard()]);
}

playerOne.createRandomLayout();
playerTwo.createRandomLayout();

pubsub.on("ReceivedAttackPre", playRound);
pubsub.on("InitializePagePre", () => {
	pubsub.emit("InitializePagePost", {
		board: playerOne.getBoard(),
		side: playerOne.side,
	});
});

pubsub.on("StartGamePre", () => {
	if (activePlayer.playerType === "computer") {
		compTimeout = setTimeout(runComputer, computerDelay);
	}
});

pubsub.on("RandomBoardHumanPre", () => {
	const human = playerOne.playerType === "human" ? playerOne : playerTwo;
	human.createRandomLayout();
	pubsub.emit("RandomBoardHumanPost", {
		board: human.getBoard(),
		side: human.side,
	});
});
pubsub.on("ResetGamePre", resetGame);
