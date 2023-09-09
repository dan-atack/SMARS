import DetailsArea from "../src/detailsArea";
import AudioController from "../src/audioController";

describe("DetailsArea", () => {

    // Dummy Engine functions to pass to the constructor:
    const audio = new AudioController;
    const setOpen = (status: boolean) => { return 0 };
    const setMouseContext = (value: string) => { return 0 };
    const setHorizontalOffset = (x: number) => { return 0 };

    const detailsArea = new DetailsArea(audio, setOpen, setMouseContext, setHorizontalOffset);
    

    test("Defines handleClicks", () => {
        expect(typeof detailsArea.handleClicks).toBe("function");
    })

})