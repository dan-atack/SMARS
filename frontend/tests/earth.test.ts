import { constants } from "../src/constants";
import Earth from "../src/earth";

describe("Earth View Tests", () => {

    // Mock game "hook" to pass to constructor
    const changeView = (newView: string) => {
        // This is a dummy function
    }

    test("Defines setEarthDate", () => {
        const earth = new Earth(changeView);
        expect(typeof earth.updateEarthDate).toBe("function");
    })

    test("Can load a date from a save file", () => {
        const earth = new Earth(changeView);
        const saveDate = new Date("December 4, 2022");
        const saveData = { date: saveDate, remainder: 0, nextLaunch: saveDate, nextLanding: saveDate };
        earth.loadSavedDate();      // Expect the date to remain the default (Jan. 1, 2030) if no save data is provided
        expect(earth._earthDate.toISOString().slice(0, 10)).toBe("2030-01-01");
        earth.loadSavedDate(saveData);      // Date should load correctly when given the saved game date object
        expect(earth._earthDate.toISOString().slice(0, 10)).toBe("2022-12-04");
    })

    test("Constructor function correctly sets default dates for next launch and landing", () => {
        const earth = new Earth(changeView);
        expect(earth._earthDate.toISOString().slice(0, 10)).toBe("2030-01-01");
        expect(earth._nextLaunchDate.toISOString().slice(0, 10)).toBe("2031-06-02");
        expect(earth._nextLandingDate.toISOString().slice(0, 10)).toBe("2032-03-02");
    })

    test("CheckEventDatesForUpdate detects when the inital launch / landing dates are passed", () => {
        const earth = new Earth(changeView);
        const saveDate = new Date("May 21, 2031");      // Set the date to slighly before the initial landing date
        earth._earthDate = saveDate;                    // Just set the Earth date, to keep the other defaults
        expect(earth._earthDate.toISOString().slice(0, 10)).toBe("2031-05-21");     // Validate test conditions
        earth.handleWeeklyUpdates();
        expect(earth._earthDate.toISOString().slice(0, 10)).toBe("2031-05-28");     // One week (7.15 days) after loaded date
        expect(earth.checkEventDatesForUpdate()).toStrictEqual({ launch: false, landing: false });                   
        earth.handleWeeklyUpdates();
        expect(earth._earthDate.toISOString().slice(0, 10)).toBe("2031-06-04");     // Two weeks later = after launch date
        expect(earth.checkEventDatesForUpdate()).toStrictEqual({ launch: true, landing: false });
    })

})