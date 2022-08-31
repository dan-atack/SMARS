import Infrastructure from "../src/infrastructure";
import InfrastructureData from "../src/infrastructureData";
import { ModuleInfo } from "../src/server_functions";
import P5 from "p5";

jest.mock("p5");

// TEST DATA

const landerModuleInfo: ModuleInfo = { 
    name: "Lander",
    width: 3,
    height: 2,
    type: "test",
    pressurized: true,
    columnStrength: 2,
    durability: 10,
    buildCosts: [
        [ "money", 200000 ]
    ],
    maintenanceCosts: [
        ["power", 1]
    ],
    storageCapacity: [
        ["power", 100]
    ],
    crewCapacity: 2,
    shapes: []
};

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
        ["equipment", 20000]// oxygen, water, food... and equipment??
    ],
    crewCapacity: 1,
    shapes: []
}

// Fake terrain data (TODO: Create a Map class instance here to pass legitimate topography and zone data to the Infra tests)
const mockography = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
const zonesData = [
    { id: '0026', leftEdge: { x: 0, y: 26 }, rightEdge: { x: 15, y: 26 } }
]

describe("Infrastructure base class", () => {
    
    const infra = new Infrastructure();
    infra._data = new InfrastructureData();  // Necessary... for now
    infra._data.setup(mockography.length);                  // Setup Infra data with the width of the 'map' being used

    test("Can add new modules", () => {
        // Add three modules, to be reused in subsequent tests
        infra.addModule(4, 25, landerModuleInfo, mockography, zonesData, 1000);
        infra.addModule(8, 25, storageModuleInfo, mockography, zonesData, 1001);
        infra.addModule(12, 25, storageModuleInfo, mockography, zonesData, 1002);
        expect(infra._modules.length).toBe(3);
    })

    test("Can provision a module with a resource", () => {
        infra.addResourcesToModule(1000, [ "water", 500 ]);     // Should NOT be able to add water to a lander module
        infra.addResourcesToModule(1001, [ "water", 500 ]);     // Should be able to add water to storage module
        infra.addResourcesToModule(1002, [ "water", 1000000 ])   // Should only be able to fill up to max capacity
        expect(infra._modules[0]._data._resources).toStrictEqual([
            [ "power", 0 ]
        ]);
        expect(infra._modules[1]._data._resources).toStrictEqual([
            ["oxygen", 0],
            ["food", 0],
            ["water", 500],
            ["equipment", 0]
        ]);
        expect(infra._modules[2]._data._resources).toStrictEqual([
            ["oxygen", 0],
            ["food", 0],
            ["water", 10000],
            ["equipment", 0]
        ]);
    })
    
    test("Can find module/s with a particular resource", () => {
        // Just check that the ID of the module returned is correct
        expect(infra.findModulesWithResource(["water", 10])[0]._data._id).toBe(1001);   // Finds water in the storage module
        expect(infra.findModulesWithResource(["food", 10])).toStrictEqual([]);          // Does not find any modules with food
    })

    test("Can find the module nearest to a set of coordinates", () => {
        const mods = infra.findModulesWithResource(["water", 10]);
        expect(mods.length).toBe(2);                                        // Two modules contain water
        expect(infra.findModuleNearestToLocation(mods, { x: 0, y: 10})).toBe(1001);     // Expect rightmost module to be nearest
        expect(infra.findModuleNearestToLocation(mods, { x: 15, y: 10})).toBe(1002);    // Expect leftmost module to be nearest
    })

})