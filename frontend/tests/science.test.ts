import Science from "../src/science";

describe("Tech View Tests", () => {

    // Mock game "hook" to pass to constructor
    const changeView = (newView: string) => {
        // This is a dummy function
    }

    const tech = new Science(changeView);

    test("Defines setup", () => {
        expect(typeof tech.setup).toBe("function");
    })

})