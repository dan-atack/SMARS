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
        earth.updateEarthDate();
        expect(earth._earthDate.toISOString().slice(0, 10)).toBe("2031-05-28");     // One week (7.15 days) after loaded date
        expect(earth.checkEventDatesForUpdate()).toStrictEqual({ launch: false, landing: false, colonists: 2 });                   
        earth.updateEarthDate();
        expect(earth._earthDate.toISOString().slice(0, 10)).toBe("2031-06-04");     // Two weeks later = after launch date
        expect(earth.checkEventDatesForUpdate()).toStrictEqual({ launch: true, landing: false, colonists: 2 });
    })

    test("Weekly updater updates next launch / landing date when either event occurs, via the setNextEventDate method", () => {
        // PART 1: VERIFYING LAUNCH DATE UPDATE
        const earth = new Earth(changeView);
        const preLaunch = new Date("June 1, 2031");
        earth._earthDate = preLaunch;
        expect(earth._earthDate.toISOString().slice(0, 10)).toBe("2031-06-01");     // Set date to right before the first launch
        expect(earth._nextLaunchDate.toISOString().slice(0, 10)).toBe("2031-06-02");    // Validate the original launch date
        earth.handleWeeklyUpdates(0);                                                    // Run weekly updater
        expect(earth._nextLaunchDate.toISOString().slice(0, 10)).toBe("2033-08-01");    // Validate new launch date
        // PART 2: VERIFYING LANDING DATE UPDATE
        const preLanding = new Date("March 1, 2032");
        earth._earthDate = preLanding;
        expect(earth._earthDate.toISOString().slice(0, 10)).toBe("2032-03-01");     // Set date to right before the first landing
        expect(earth._nextLandingDate.toISOString().slice(0, 10)).toBe("2032-03-02");   // Validate the original landing date
        earth.handleWeeklyUpdates(0);                                                    // Run weekly updater
        expect(earth._nextLandingDate.toISOString().slice(0, 10)).toBe("2034-05-02");   // Validate new landing date
    })

    test("Weekly updater returns the number of colonists making a landing on the update when a landing occurs", () => {
        const earth = new Earth(changeView);
        // Start with a date that is one week too early
        const preLanding = new Date("February 22, 2032");
        earth._earthDate = preLanding;
        earth._flightEnRoute = true;    // Lock in default value of 2 colonists being sent
        // Update should return information about the event taking place, be it a launch of a landing
        expect(earth.handleWeeklyUpdates(3)).toStrictEqual({ landing: false, launch: true, colonists: 2 });
        // When a landing does take place, the update should return the number of colonists about to land
        expect(earth.handleWeeklyUpdates(3)?.colonists).toBe(2);
    })

})