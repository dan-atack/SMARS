import Sky from "../src/sky";

describe("Sky", () => {

    const sky = new Sky();

    test("Defines setSkyColour", () => {
        expect(typeof sky.setSkyColour).toBe("function");
    })

})