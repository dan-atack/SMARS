import AudioController from "../src/audioController";
import Science from "../src/science";

describe("Tech View Tests", () => {

    // Mock game "hook" to pass to constructor
    const changeView = (newView: string) => {
        // This is a dummy function
    }

    const audio = new AudioController;

    const tech = new Science(audio, changeView);

    test("Defines setup", () => {
        expect(typeof tech.setup).toBe("function");
    })

})