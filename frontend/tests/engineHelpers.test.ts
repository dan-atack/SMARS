import { compareGameTimes } from "../src/engineHelpers";
import { GameTime } from "../src/saveGame";

describe("Engine Helper functions", () => {

    test("compareGameTimes is able to find the later of two Smartian time stamps", () => {
        const timeA: GameTime = {   // Earliest, except for time D
            minute: 59,
            hour: 4,
            cycle: "AM",
            sol: 1,
            year: 1
        };
        const timeB: GameTime = {   // One minute later than time A
            minute: 0,
            hour: 5,
            cycle: "AM",
            sol: 1,
            year: 1
        };
        const timeC: GameTime = {   // Twelve hours (minus one minute) later than time A
            minute: 59,
            hour: 4,
            cycle: "PM",
            sol: 1,
            year: 1
        };
        const timeD: GameTime = {   // Earliest time of all since hour = 12 AM
            minute: 20,
            hour: 12,
            cycle: "AM",
            sol: 1,
            year: 1
        };
        const timeE: GameTime = {   // Latest by a year
            minute: 20,
            hour: 12,
            cycle: "PM",
            sol: 1,
            year: 2
        };
        const timeF: GameTime = {   // End of first year
            minute: 59,
            hour: 11,
            cycle: "PM",
            sol: 4,
            year: 1
        };
        const timeG: GameTime = {   // Testing the twelves
            minute: 0,
            hour: 12,
            cycle: "AM",
            sol: 4,
            year: 1
        };
        const timeH: GameTime = {   // Testing the twelves
            minute: 0,
            hour: 11,
            cycle: "AM",
            sol: 4,
            year: 1
        };
        expect(compareGameTimes(timeA, timeB)).toStrictEqual(timeB);
        expect(compareGameTimes(timeB, timeC)).toStrictEqual(timeC);
        expect(compareGameTimes(timeC, timeD)).toStrictEqual(timeC);    // C is later than D
        expect(compareGameTimes(timeA, timeD)).toStrictEqual(timeA);    // D is earlier than any of them
        expect(compareGameTimes(timeE, timeF)).toStrictEqual(timeE);    // Time E is the latest of all
        expect(compareGameTimes(timeG, timeH)).toStrictEqual(timeH);    // 11 AM is later than 12 AM? What a country!
    })
    

})