import { Ship, Gameboard } from "./Logic.js";

describe("Ship Factory", () => {
	const ship = Ship(3);
	it("Has hit()?", () => expect(ship.hit()).toBe(1));
	it("Has hit()?", () => expect(ship.hit()).toBe(2));

	it("Is part of ship interface", () =>
		expect(Ship().type).toMatch("Ship Interface"));

	it("Ship sunk false", () => expect(ship.isSunk()).toBe(false));
	it("Ship sunk true", () => {
		ship.hit();
		expect(ship.isSunk()).toBe(true);
	});
});

describe("Gameboard Factory", () => {
	const gb = Gameboard();
	it("Get board", () => {
		const board = gb.getBoard();
		expect(board.length).toBe(10);
		for (const row of board) {
			expect(row.length).toBe(10);
			for (const item of row) {
				expect(item).toBe(null);
			}
		}
	});

	describe("Place ship", () => {
		const { placeShip } = gb;
		it("Can place ship", () => {
			placeShip([5, 5], 90, 4);
			let shipValue = [];
			for (let i = 5; i < 9; i++) {
				shipValue.push(gb.getBoard()[i][5]);
			}

			expect(shipValue).toEqual([1, 1, 1, 1]);

			placeShip([0, 0], 180, 2);
			shipValue = [gb.getBoard()[0][0], gb.getBoard()[0][1]];

			expect(shipValue).toEqual([1, 1]);
		});

		it("Returned Object is instance of Ship()", () => {
			const ship = placeShip([3, 0], 90, 2);
			expect(ship.type).toMatch(Ship().type);
			expect(ship.hit()).toBe(1);
			expect(ship.hit()).toBe(2);
			expect(ship.isSunk()).toBe(true);
		});
	});
});
