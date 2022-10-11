import Population from "../src/population";

describe("Population", () => {
    const population = new Population();

    test("Defines addColonist", () => {
        expect(typeof population.addColonist).toBe("function");
    })
})