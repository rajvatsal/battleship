import Player from "./Player.js";

describe("Player factory", () => {
	it("Player type", () => {
		let player = Player(1);
		expect(player.playerType).toMatch("computer");
		player = Player(0);
		expect(player.playerType).toMatch("human");
	});

	it("Player has gameboard", () => {
		const player = Player(0);
		expect(player.interface).toMatch("Gameboard Interface");
		player.placeShip([0, 0], 90, 1);
		expect(player.getBoard()[0][1]).toMatch(".");
		expect(player.hasLost()).toBe(false);
		player.receiveAttack([0, 0]);
		expect(player.hasLost()).toBe(true);
		expect(player.getBoard()[0][1]).toMatch("*");
		player.resetBoard();
		expect(player.getBoard()[0][1]).toBe(null);
	});

	it("Random Layout", () => {
		const player = Player(0);
		const boardBefore = structuredClone(player.getBoard());
		player.createRandomLayout();

		const boardAfter_1 = structuredClone(player.getBoard());

		player.resetBoard();
		player.createRandomLayout();

		const boardAfter_2 = structuredClone(player.getBoard());

		expect(boardBefore).not.toEqual(boardAfter_1);
		expect(boardAfter_1).not.toEqual(boardAfter_2);
		expect(boardAfter_2).toEqual(player.getBoard());
	});

	it("computer player has choice", () => {
		const player = Player(1);
		expect(player.playerType).toMatch("computer");
		expect(player.playerType).not.toMatch("human");
		expect(player.getChoice(player.getBoard())).toBeInstanceOf(Array);
	});
});
