import ModuleData from "../src/moduleData";
import { ModuleInfo } from "../src/server_functions";

// Module Info data
const storageModuleInfo: ModuleInfo = {
    name: "Basic Storage",
    width: 4,
    height: 3,
    type: "Storage",
    pressurized: true,
    columnStrength: 10,
    durability: 100,
    buildCosts:[
        ["money", 100000]
    ],  // money
    maintenanceCosts: [
        ["power", 1]
    ],
    storageCapacity: [
        ["oxygen", 1000],
        ["food", 10000],
        ["water", 10000],
        ["equipment", 20000]    // oxygen, water, food... and equipment??
    ],
    crewCapacity: 1,
    shapes: []                  // Shapes data not needed for unit tests
};

const noStoreModuleInfo: ModuleInfo = {
    name: "Basic Storage",
    width: 4,
    height: 3,
    type: "Storage",
    pressurized: true,
    columnStrength: 10,
    durability: 100,
    buildCosts:[
        ["money", 100000]
    ],  // money
    maintenanceCosts: [
        ["power", 1]
    ],
    storageCapacity: [],        // No storage at all
    crewCapacity: 1,
    shapes: []                  // Shapes data not needed for unit tests
};

const moduleData = new ModuleData(9000, 10, 10, storageModuleInfo);
const emptyModule = new ModuleData(9001, 20, 20, noStoreModuleInfo);

describe("ModuleData", () => {

    test("Has no resources at the outset", () => {
        // Checks that the constructor has correctly set up the resource list and set all quantities to zero
        expect(moduleData._resources).toStrictEqual([
            ["oxygen", 0],
            ["food", 0],
            ["water", 0],
            ["equipment", 0]
        ]);
    });

    test("Empty module has no resource slots at the outset", () => {
        expect(emptyModule._resources).toStrictEqual([]);
    })

    test("Can receive resources", () => {
        expect(moduleData.addResource(["oxygen", 500])).toBe(500);          // Returns the amount added
        expect(moduleData._resources).toStrictEqual([
            ["oxygen", 500],
            ["food", 0],
            ["water", 0],
            ["equipment", 0]
        ]);
    });

    test("Can deduct resources that are available", () => {
        expect(moduleData.deductResource(["oxygen", 250])).toBe(250);       // Returns the amount deducted
        expect(moduleData._resources).toStrictEqual([
            ["oxygen", 250],
            ["food", 0],
            ["water", 0],
            ["equipment", 0]
        ]);
        expect(moduleData.deductResource(["oxygen", 240])).toBe(240);
        expect(moduleData._resources).toStrictEqual([
            ["oxygen", 10],
            ["food", 0],
            ["water", 0],
            ["equipment", 0]
        ]);
    });

    test("Cannot deduct resources that are not present", () => {
        expect(moduleData.deductResource(["minerals", 1000])).toBe(0);  // No capacity for minerals means none can be deducted
        expect(moduleData.deductResource(["oxygen", 50])).toBe(10);     // With 10 oxygen leftover from the previous test, we should only get 10
        expect(moduleData._resources).toStrictEqual([
            ["oxygen", 0],
            ["food", 0],
            ["water", 0],
            ["equipment", 0]
        ]);
    })

    // Resources of the wrong type should not be added
    test("Cannot recieve resources that are not listed in storage capacity", () => {
        expect(moduleData.addResource(["minerals", 1000])).toBe(0);         // Return = amount actually added
        expect(moduleData._resources).toStrictEqual([
            ["oxygen", 0],
            ["food", 0],
            ["water", 0],
            ["equipment", 0]
        ]);
    });

    test("Cannot recieve more than the max quantity of a resource for which storage capacity exists", () => {
        expect(moduleData.addResource(["water", 20000])).toBe(10000);       // Return = amount actually added
        expect(moduleData._resources).toStrictEqual([
            ["oxygen", 0],
            ["food", 0],
            ["water", 10000],
            ["equipment", 0]
        ]);
    });

    test("Cannot dispense more than the currently available quantity of a resource", ()  => {
        expect(moduleData.deductResource(["water", 20000])).toBe(10000);    // Return = amount actually taken
        expect(moduleData._resources).toStrictEqual([
            ["oxygen", 0],
            ["food", 0],
            ["water", 0],
            ["equipment", 0]
        ]);
    });

    test("Can return resource quantities when given a resource name", () => {
        expect(moduleData.getResourceQuantity("water")).toBe(0);        // Returns zero if none of the resource is present
        expect(moduleData.getResourceQuantity("minerals")).toBe(0);     // Also returns zero if resource capacity does not exist
        moduleData.addResource(["water", 500]);
        expect(moduleData.getResourceQuantity("water")).toBe(500);      // Returns the quantity of a resource if it is available
    })
})