const { getStructures, getStructureTypes, getOneStructure } = require('../src/server_functions/structureFunctions');

describe("Structure functions", () => {

    test("Defines getStructures", () => {
        expect(typeof getStructures).toBe("function");
    });

    test("Defines getStructureTypes", () => {
        expect(typeof getStructureTypes).toBe("function");
    });

    test("Defines getOneStructure", () => {
        expect(typeof getOneStructure).toBe("function");
    });
});