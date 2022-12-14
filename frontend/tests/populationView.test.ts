import PopulationView from "../src/populationView";

describe("Population View Tests", () => {

    // Mock game "hook" to pass to constructor
    const changeView = (newView: string) => {
        // This is a dummy function
    }

    const population = new PopulationView(changeView);

    test("Defines setPopulation", () => {
        expect(typeof population.setPopulation).toBe("function");
    })

})