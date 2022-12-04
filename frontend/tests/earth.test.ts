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

    test("Can load a date from a save file", () => {
        const saveDate = new Date("December 4, 2022");
        const saveData = { date: saveDate, remainder: 0 };
        earth.loadSavedDate();      // Expect the date to remain the default (Jan. 1, 2030) if no save data is provided
        expect(earth.earthDate.toISOString().slice(0, 10)).toBe("2030-01-01");
        earth.loadSavedDate(saveData);      // Date should load correctly when given the saved game date object
        expect(earth.earthDate.toISOString().slice(0, 10)).toBe("2022-12-04");
    })

})