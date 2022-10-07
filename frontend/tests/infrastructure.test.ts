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

const cantinaModuleInfo: ModuleInfo = {
    name: "Cantina",
    width: 4,
    height: 3,
    type: "Life Support",
    pressurized: true,
    columnStrength: 10,
    durability: 100,
    buildCosts:[
        ["money", 100000]
    ],
    maintenanceCosts: [
        ["power", 1]
    ],
    storageCapacity: [
        ["food", 5000],
        ["water", 5000]
    ],
    crewCapacity: 2,
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
        infra.addModule(8, 22, cantinaModuleInfo, mockography, zonesData, 1003);
        expect(infra._modules.length).toBe(4);
    })

    test("Can provision a module with a resource", () => {
        infra.addResourcesToModule(1000, [ "water", 500 ]);         // Should NOT be able to add water to a lander module
        infra.addResourcesToModule(1001, [ "water", 500 ]);         // Should be able to add water to storage module
        infra.addResourcesToModule(1002, [ "water", 1000000 ])      // Should only be able to fill up to max capacity
        infra.addResourcesToModule(1003, [ "water", 500 ]);         // Provision the cantina with food and water for later tests
        infra.addResourcesToModule(1003, [ "food", 500 ]);
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
        expect(infra._modules[3]._data._resources).toStrictEqual([
            ["food", 500],
            ["water", 500]
        ])
    })
    
    // NOTE: There are now two varieties of this test, one with the optional 'lifeSupp' parameter, and one without
    test("Can find module/s with a particular resource (Life Support not specified)", () => {
        // All modules, except the Lander, should contain some water...
        expect(infra.findModulesWithResource(["water", 10]).length).toBe(3);
        // However, only one of them, the Cantina, is of the type 'Life Support'
        expect(infra.findModulesWithResource(["water", 10], true).length).toBe(1);
        // Only one module has food, and it is also the cantina (so we should get the same list whether or not we specify)
        expect(infra.findModulesWithResource(["food", 10]).length).toStrictEqual(1);
        expect(infra.findModulesWithResource(["food", 10], true).length).toStrictEqual(1);
    })

    test("Can find the module nearest to a set of coordinates", () => {
        const mods = infra.findModulesWithResource(["water", 10]);
        expect(mods.length).toBe(3);                                        // Three modules now contain water
        expect(infra.findModuleNearestToLocation(mods, { x: 0, y: 10})).toBe(1001);     // Expect rightmost module to be nearest
        expect(infra.findModuleNearestToLocation(mods, { x: 15, y: 10})).toBe(1002);    // Expect leftmost module to be nearest
    })

})