import AudioController from "../src/audioController";
import IndustryView from "../src/industryView";

describe("Industry View Tests", () => {

    // Mock game "hook" to pass to constructor
    const changeView = (newView: string) => {
        // This is a dummy function
    }

    const audio = new AudioController;

    const industry = new IndustryView(audio, changeView);

    test("Defines setup", () => {
        expect(typeof industry.setup).toBe("function");
    })

})