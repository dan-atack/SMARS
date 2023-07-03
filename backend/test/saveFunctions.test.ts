const { handleSave } = require("../src/server_functions/saveFunctions");

describe("Save functions", () => {

    test("Defines handleSave", () => {
        expect(typeof handleSave).toBe("function");
    });
    
});