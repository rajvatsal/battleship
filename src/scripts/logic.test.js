import { Ship } from "./Logic.js";

describe("Ship Factory", () => {
	const ship = Ship(3);
	it("Has hit()?", () => expect(ship.hit()).toBe(1));
	it("Has hit()?", () => expect(ship.hit()).toBe(2));

	it("Ship sunk false", () => expect(ship.isSunk()).toBe(false));
	it("Ship sunk true", () => {
		ship.hit();
		expect(ship.isSunk()).toBe(true);
	});
});
