import Earth from "../src/earth";

describe("Earth View Tests", () => {

    // Mock game "hook" to pass to constructor
    const changeView = (newView: string) => {
        // This is a dummy function
    }

    const earth = new Earth(changeView);

    test("Defines setEarthDate", () => {
        expect(typeof earth.setEarthDate).toBe("function");
    })

})