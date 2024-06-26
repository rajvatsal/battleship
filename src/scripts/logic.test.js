import { Ship, Gameboard, Player } from "./Logic.js";

const coords = [2, 0];
describe("Ship Factory", () => {
	const ship = Ship(coords, 3);
	it("Has hit()?", () => expect(ship.hit()).toBe(1));
	it("Has hit()?", () => expect(ship.hit()).toBe(2));

	it("Is part of ship interface", () =>
		expect(Ship(coords).type).toMatch("Ship Interface"));

	it("Ship sunk false", () => expect(ship.isSunk()).toBe(false));
	it("Ship sunk true", () => {
		ship.hit();
		expect(ship.isSunk()).toBe(true);
	});

	it("Get occupied squares", () => {
		const ship = Ship([0, 0], 4, 180);
		expect(ship.getOccupiedSquares()).toEqual([
			[0, 0],
			[0, 1],
			[0, 2],
			[0, 3],
		]);
	});
});

describe("Gameboard Factory", () => {
	const gb = Gameboard();
	const { placeShip, getBoard } = gb;
	it("Get board", () => {
		const board = getBoard();
		expect(board.length).toBe(10);
		for (const row of board) {
			expect(row.length).toBe(10);
			for (const item of row) {
				expect(item).toBe(null);
			}
		}
	});

	it("Place ship", () => {
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

	it("Receive Attack", () => {
		const { placeShip, receiveAttack, getBoard } = Gameboard();
		placeShip([5, 5], 180, 4);
		placeShip([0, 1], 90, 4);

		receiveAttack([0, 0]);
		expect(getBoard()[0][0]).toBe("O");

		receiveAttack([5, 7]);
		expect(getBoard()[5][7]).toBe("X");

		receiveAttack([0, 0]);
		expect(getBoard()[0][0]).toBe("O");
	});

	it("Check for game over", () => {
		const { isGameOver, placeShip, receiveAttack } = Gameboard();
		placeShip([0, 0], 90, 1);
		expect(isGameOver()).toBe(false);
		receiveAttack([0, 0]);
		expect(isGameOver()).toBe(true);
	});
});

describe("Player factory", () => {
	it("Player type", () => {
		let player = Player(1);
		expect(player.kind).toMatch("computer");
		player = Player(0);
		expect(player.kind).toMatch("human");
	});

	it("Player has gameboard", () => {
		const player = Player(0);
		expect(player.type).toMatch("Gameboard Interface");
		player.placeShip([0, 0], 90, 1);
		player.receiveAttack([0, 0]);
		expect(player.isGameOver()).toBe(true);
	});
});
