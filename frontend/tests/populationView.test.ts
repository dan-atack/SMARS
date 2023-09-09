import AudioController from "../src/audioController";
import PopulationView from "../src/populationView";

describe("Population View Tests", () => {

    // Mock game "hook" to pass to constructor
    const changeView = (newView: string) => {
        // This is a dummy function
    }

    const audio = new AudioController;

    const population = new PopulationView(audio, changeView);

    test("Defines setPopulation", () => {
        expect(typeof population.setPopulation).toBe("function");
    })

})