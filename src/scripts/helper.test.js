import { pipeline } from "./Helpers.js";

const person = (state) => ({ sayName: () => state.sayName() });
const singer = (state) => ({ sing: () => state.sing() });
const groot = (state) => ({ speak: () => state.speak() });

describe("Pipeline", () => {
	it("person who is a singer", () => {
		const personSinger = pipeline(person, singer);
		const state = {
			sayName: () => "vatsal",
			sing: () => "La la la",
		};
		const composite = personSinger(state);
		expect(composite.sayName()).toMatch("vatsal");
		expect(composite.sing()).toMatch("La la la");
		expect(composite.speak).toBe(undefined);
	});

	it("groot can sing!!!", () => {
		const personSinger = pipeline(groot, singer);
		const state = {
			speak: () => "I am groot",
			sing: () => "I am groooot!!!",
		};
		const composite = personSinger(state);
		expect(composite.speak()).toMatch("I am groot");
		expect(composite.sing()).toMatch("I am groooot!!!");
		expect(composite.sayName).toBe(undefined);
	});
});
