import AudioController from "../src/audioController";

describe("AudioController", () => {
    
    const audio = new AudioController();

    test("Describes playSound", () => {
        expect(typeof audio.playSound).toBe("function");
    })


})