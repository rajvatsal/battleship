import Player from "./Player.js";

describe("Player factory", () => {
	it("Player type", () => {
		let player = Player(1);
		expect(player.kind).toMatch("computer");
		player = Player(0);
		expect(player.kind).toMatch("human");
	});

	it("Player has gameboard", () => {
		const player = Player(0);
		expect(player.interface).toMatch("Gameboard Interface");
		player.placeShip([0, 0], 90, 1);
		expect(player.isGameOver()).toBe(false);
		player.receiveAttack([0, 0]);
		expect(player.isGameOver()).toBe(true);
	});
});