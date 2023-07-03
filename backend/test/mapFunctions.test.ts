const { getMap } = require("../src/server_functions/mapFunctions");

describe("Map functions", () => {

    test("Defines getMap", () => {
        expect(typeof getMap).toBe("function");
    });

});