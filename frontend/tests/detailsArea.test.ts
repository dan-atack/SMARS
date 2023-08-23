import DetailsArea from "../src/detailsArea";

describe("DetailsArea", () => {

    // Dummy Engine functions to pass to the constructor:
    const setOpen = (status: boolean) => { return 0 };
    const setMouseContext = (value: string) => { return 0 };

    const detailsArea = new DetailsArea(setOpen, setMouseContext);

    test("Defines handleClicks", () => {
        expect(typeof detailsArea.handleClicks).toBe("function");
    })

})