import Infrastructure from "../src/infrastructure";
import InfrastructureData from "../src/infrastructureData";
import Map from "../src/map";
import { ConnectorInfo, ModuleInfo } from "../src/server_functions";

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

const batteryModuleInfo: ModuleInfo = {
    name: "Battery",
    width: 2,
    height: 1,
    type: "Storage",
    pressurized: false,
    columnStrength: 10,
    durability: 100,
    buildCosts:[
        ["money", 100000]
    ],
    maintenanceCosts: [],
    storageCapacity: [
        ["power", 1000],
    ],
    crewCapacity: 0,
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
        ["water", 5000],
        ["power", 1000]
    ],
    crewCapacity: 2,
    shapes: []
}

const powerPlantInfo: ModuleInfo = {
    name: "Small RTG Reactor",
    width: 3,
    height: 2,
    type: "Production",
    pressurized: false,
    columnStrength: 10,
    durability: 100,
    buildCosts:[
        ["money", 1000000]
    ],
    maintenanceCosts: [],
    productionInputs: [
        ["plutonium", 1]
    ],
    productionOutputs: [
        ["power", 100]
    ],
    storageCapacity: [
        ["power", 100000],
        ["plutonium", 50000]
    ],
    crewCapacity: 0,
    shapes: []
}

const solarPanelInfo: ModuleInfo = {
    name: "Small Solar Array",
    width: 3,
    height: 2,
    type: "Power",
    pressurized: false,
    columnStrength: 0,
    durability: 100,
    buildCosts: [
        ["money", 250000],
    ],
    maintenanceCosts: [],
    productionOutputs: [
        ["power", 50]
    ],
    storageCapacity: [
        ["power", 1000]
    ],
    crewCapacity: 0,
    shapes: []
}

const hydroponicsModuleData: ModuleInfo = {
    name: "Hydroponics Pod",
    width: 3,
    height: 3,
    type: "Production",
    pressurized: true,
    columnStrength: 1,
    durability: 100,
    buildCosts: [
        ["money", 100000],
    ],
    maintenanceCosts: [
        ["power", 10]
    ],
    productionInputs: [     // Plant life needs: water, CO2 and light (in this case electric light)
        ["water", 5]
    ],
    productionOutputs: [
        ["food", 10],
        ["oxygen", 10],
    ],
    storageCapacity: [
        ["oxygen", 1000],
        ["water", 2500],
        ["food", 1000],
    ],
    crewCapacity: 1,
    shapes: []
}

const ladderData: ConnectorInfo = {
    name: "Ladder",
    type: "transport",
    resourcesCarried: ["crew"],
    maxFlowRate: 2,
    buildCosts: [
        ["money", 7500]
    ],
    maintenanceCosts: [],
    vertical: true,
    horizontal: false,
    width: 1
}

const airVentData: ConnectorInfo = {
    name: "Air Vent",
    type: "conduit",
    resourcesCarried: ["oxygen"],
    maxFlowRate: 1,
    buildCosts:[
        ["money", 10000]
    ],
    maintenanceCosts: [],
    vertical: true,
    horizontal: true,
    width: 1
}

// Fake terrain data (TODO: Create a Map class instance here to pass legitimate topography and zone data to the Infra tests)
const mockography = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
const zonesData = [
    { id: '0026', leftEdge: { x: 0, y: 26 }, rightEdge: { x: 15, y: 26 } }
]

describe("Infrastructure base class", () => {
    
    const infra = new Infrastructure();
    infra._data = new InfrastructureData();  // Necessary... for now
    infra._data.setup(mockography.length);                  // Setup Infra data with the width of the 'map' being used
    
    const mockMap = new Map();

    test("Can add new modules", () => {
        // Add three modules, to be reused in subsequent tests
        infra.addModule(4, 25, landerModuleInfo, mockography, zonesData, 1000);
        infra.addModule(8, 25, storageModuleInfo, mockography, zonesData, 1001);
        infra.addModule(12, 25, storageModuleInfo, mockography, zonesData, 1002);
        infra.addModule(8, 22, cantinaModuleInfo, mockography, zonesData, 1003);
        infra.addModule(0, 25, powerPlantInfo, mockography, zonesData, 1004);
        expect(infra._modules.length).toBe(5);
    })

    test("Can provision a module with a resource", () => {
        infra.addResourcesToModule(1000, [ "water", 500 ]);         // Should NOT be able to add water to a lander module
        infra.addResourcesToModule(1001, [ "water", 500 ]);         // Should be able to add water to storage module
        infra.addResourcesToModule(1002, [ "water", 1000000 ])      // Should only be able to fill up to max capacity
        infra.addResourcesToModule(1003, [ "water", 500 ]);         // Provision the cantina with food and water for later tests
        infra.addResourcesToModule(1003, [ "food", 500 ]);
        expect(infra._modules[0]._resources).toStrictEqual([
            [ "power", 0 ]
        ]);
        expect(infra._modules[1]._resources).toStrictEqual([
            ["oxygen", 0],
            ["food", 0],
            ["water", 500],
            ["equipment", 0]
        ]);
        expect(infra._modules[2]._resources).toStrictEqual([
            ["oxygen", 0],
            ["food", 0],
            ["water", 10000],
            ["equipment", 0]
        ]);
        expect(infra._modules[3]._resources).toStrictEqual([
            ["food", 500],
            ["water", 500],
            ["power", 0]
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

    test("Can find the module that contains a set of coordinates", () => {
        // Test each corner of the storage module at (8, 22) (4 x 3 width times height), inside and out
        // Top left corner
        expect(infra.getModuleFromCoords({x: 8, y: 22})?._id).toBe(1003);     // Inside (top left corner)
        expect(infra.getModuleFromCoords({x: 8, y: 21})).toBe(null);                // Too high
        expect(infra.getModuleFromCoords({x: 7, y: 22})).toBe(null);                // Too far left
        // Top right corner
        expect(infra.getModuleFromCoords({x: 11, y: 22})?._id).toBe(1003);    // Inside (top right corner)
        expect(infra.getModuleFromCoords({x: 11, y: 21})).toBe(null);               // Too high
        expect(infra.getModuleFromCoords({x: 12, y: 22})).toBe(null);               // Too far right
        // Bottom right corner
        expect(infra.getModuleFromCoords({x: 11, y: 24})?._id).toBe(1003);    // Inside (bottom right corner)
        expect(infra.getModuleFromCoords({x: 11, y: 25})?._id).toBe(1001);    // Too low (other module)
        expect(infra.getModuleFromCoords({x: 12, y: 23})).toBe(null);               // Too far right
        // Bottom left corner
        expect(infra.getModuleFromCoords({x: 8, y: 24})?._id).toBe(1003);     // Inside (bottom left corner)
        expect(infra.getModuleFromCoords({x: 8, y: 25})?._id).toBe(1001);     // Too low (other module)
        expect(infra.getModuleFromCoords({x: 7, y: 24})).toBe(null);                // Too far left
    })

    test("Can find a Connector that overlaps a set of coordinates", () => {
        // Setup: Add two connectors that overlap at one point, (8, 25)
        infra.addConnector({ x: 8, y: 27 }, { x: 8, y: 22}, airVentData, mockMap, 2000);     
        infra.addConnector({ x: 6, y: 25 }, { x: 10, y: 25}, airVentData, mockMap, 2001);
        // Vertical
        expect(infra.getConnectorFromCoords({ x: 8, y: 27 })?._id).toBe(2000);      // Top
        expect(infra.getConnectorFromCoords({ x: 8, y: 22 })?._id).toBe(2000);      // Bottom
        expect(infra.getConnectorFromCoords({ x: 8, y: 28 })).toBe(null);           // Too high
        expect(infra.getConnectorFromCoords({ x: 7, y: 27 })).toBe(null);           // Off side
        // Horizontal
        expect(infra.getConnectorFromCoords({ x: 6, y: 25 })?._id).toBe(2001);      // Left
        expect(infra.getConnectorFromCoords({ x: 10, y: 25 })?._id).toBe(2001);     // Right
        expect(infra.getConnectorFromCoords({ x: 10, y: 24 })).toBe(null);          // Too high
        expect(infra.getConnectorFromCoords({ x: 11, y: 25 })).toBe(null);          // Off side
        // Intersection - picks the first Connector in the list
        expect(infra.getConnectorFromCoords({ x: 8, y: 25 })?._id).toBe(2000);
    })

    test("Can compile a list of all modules' resource requests", () => {
        // Modules are: 1 Lander (experimental type = no requests) 2 Storage modules (no requests) and one cantina that has 10% of both its food and water quotas
        expect(infra.compileModuleResourceRequests()).toStrictEqual([
            {
                modId: 1000,
                resource: ["power", 50]
            },
            {
                modId: 1003,
                resource: ["food", 4500]
            },
            {
                modId: 1003,
                resource: ["water", 4500]
            },
            {
                modId: 1003,
                resource: ["power", 1000]
            },
            {
                modId: 1004,
                resource: ["plutonium", 25000]
            }
        ])
    })

    test("Hourly updater method handles module resource requests", () => {
        // Provision storage module first
        infra.addResourcesToModule(1002, ["food", 1000000]);
        infra.addResourcesToModule(1002, ["oxygen", 100000]);
        infra.addResourcesToModule(1002, ["equipment", 100000]);
        // Also, deprovision other storage module, since it will attempt to fulfill the requests itself otherwise
        infra.subtractResourceFromModule(1001, ["water", 10000]);
        expect(infra._modules[3]._resources).toStrictEqual([
            ["food", 500],
            ["water", 500],
            ["power", 0]
        ]);
        infra.handleHourlyUpdates(100);                            // Expect cantina to be fully restocked...
        expect(infra._modules[3]._resources).toStrictEqual([
            ["food", 5000],
            ["water", 5000],                                    //
            ["power", 0]                                        // ... Except for the power
        ]);
        expect(infra._modules[2]._resources).toStrictEqual([    // ... With supplies taken from the storage room
            ["oxygen", 988],
            ["food", 5500],
            ["water", 5500],
            ["equipment", 20000]
        ]);
    })

    test("Production modules share production output resources", () => {
        infra.addResourcesToModule(1004, ["power", 100000]);        // Provision power production module
        infra.handleHourlyUpdates(100);
        expect(infra._modules[3]._resources).toStrictEqual([
            ["food", 5000],
            ["water", 5000],
            ["power", 0]                                        // Power is transferred from production module to cantina
        ]);
    })

    test("Can return a list of modules that produce a given resource", () => {
        // Add food production module now, to avoid interfering with other tests
        infra.addModule(0, 22, hydroponicsModuleData, mockography, zonesData, 1005);
        expect(infra.findModulesWithOutput("power")[0]._id).toBe(1004);             // Find the power plant
        expect(infra.findModulesWithOutput("food")[0]._id).toBe(1005);              // Find the hydro pod
        expect(infra.findModulesWithOutput("oxygen")[0]._id).toBe(1005);            // Find the hydro pod again
        expect(infra.findModulesWithOutput("equipment")).toStrictEqual([]);         // Return empty list if no prod mod is found
    })

    test("Can trigger a production round for a module", () => {
        // Setup: Module exists with a colonist punched in, and the necessary resources for production
        infra.handleHourlyUpdates(100);
        infra._modules[5]._isMaintained = true; // Ensure that a punch-in is possible
        infra._modules[5].punchIn(9999);        // Punch in colonist # 9999
        expect(infra._modules[5].hasProductionInputs()).toBe(true);     // Validate setup
        expect(infra._modules[5]._crewPresent).toStrictEqual([9999]);
        infra.resolveModuleProduction(1005, 9999);  // Should punch out the colonist, and remove inputs and add outputs
        expect(infra._modules[5]._crewPresent).toStrictEqual([]);
        expect(infra._modules[5]._resources).toStrictEqual([
            ["oxygen", 501],    // From 0 to 501 (+510 - 9)
            ["water", 1245],    // From 1250 to 1245 (-5)
            ["food", 10]        // From 0 to 10 (+10)
        ])
    })

    // Returns one module with a resource capacity, prioritizing modules of the 'Storage' type
    test("Can find storage module(s) for a given resource", () => {
        // SETUP: Clear out both storage modules
        infra.subtractResourceFromModule(1001, ["water", 100000]);
        infra.subtractResourceFromModule(1002, ["water", 100000]);
        // When both storage modules have space, it returns the first one
        expect(infra.findStorageModule(["water", 100])?._id).toBe(1001);        // First storage module
        // When only the second storage module has space it returns that one
        infra.addResourcesToModule(1001, ["water", 100000]);                    // Setup: Fill first storage module
        expect(infra.findStorageModule(["water", 100])?._id).toBe(1002);        // Second storage module
        // When no 'Storage' modules are available it returns the next available module that can hold the resource
        infra.addResourcesToModule(1002, ["water", 100000]);                    // Setup: Fill second storage module
        infra.subtractResourceFromModule(1003, ["water", 10000]);                 // Setup: Make space in cantina
        expect(infra.findStorageModule(["water", 100])?._id).toBe(1003);        // Cantina
        // If no suitable modules are available it returns a null
        infra.addResourcesToModule(1003, ["water", 100000]);                    // Setup: Fill cantina
        infra.addResourcesToModule(1005, ["water", 100000]);                    // Setup: Fill hydroponics module
        expect(infra.findStorageModule(["water", 100])).toBe(null);
        // UPDATED: Also returns a null if second, optional storageOnly argument is given and no Storage class modules are found
        expect(infra.findStorageModule(["water", 100], true)).toBe(null);        // Cantina is not Storage class
    })

    test("resolveModulePowerGeneration finds all Power class modules and has them generate power", () => {
        infra.addModule(0, 19, solarPanelInfo, mockography, zonesData, 1006);   // Add solar panel module
        infra.resolveModulePowerGeneration(100);                                // Use full sunlight levels
        expect(infra._modules[6]._resources[0]).toStrictEqual(["power", 50]);   // Solar panel has generated power
        // TODO: Provision nuclear reactor and verify its power generation output
    })

    test("resolveResourceStoragePushes sends production/power outputs to available Storage class modules", () => {
        // Setup test conditions - NEW POLICY: WIPE ALL EXISTING STRUCTURES AT START OF EACH TEST
        infra._modules = [];
        infra._data = new InfrastructureData();  // Necessary... for now
        infra._data.setup(mockography.length);
        // Add 2 solar panels, a battery, a hydroponics bay and a storage room
        infra.addModule(4, 25, solarPanelInfo, mockography, zonesData, 1000);
        infra.addModule(7, 25, solarPanelInfo, mockography, zonesData, 1001);
        infra.addModule(10, 25, batteryModuleInfo, mockography, zonesData, 1002);
        infra.addModule(13, 25, hydroponicsModuleData, mockography, zonesData, 1003);
        infra.addModule(17, 25, storageModuleInfo, mockography, zonesData, 1004);
        // Provision production modules with their outputs
        infra.addResourcesToModule(1000, ["power", 100]);
        infra.addResourcesToModule(1001, ["power", 100]);
        infra.addResourcesToModule(1003, ["food", 100]);
        // Validate test conditions - production modules have resources and storage modules are empty
        expect(infra._modules[0]._resources[0]).toStrictEqual(["power", 100]);
        expect(infra._modules[1]._resources[0]).toStrictEqual(["power", 100]);
        expect(infra._modules[2]._resources[0]).toStrictEqual(["power", 0]);
        expect(infra._modules[3]._resources[2]).toStrictEqual(["food", 100]),
        expect(infra._modules[4]._resources[1]).toStrictEqual(["food", 0]);
        // Run test
        infra.resolveResourceStoragePushes();
        // Validate results - production modules are empty and storage modules are (partially) filled
        expect(infra._modules[0]._resources[0]).toStrictEqual(["power", 0]);    // Pushed to battery
        expect(infra._modules[1]._resources[0]).toStrictEqual(["power", 0]);    // Pushed to battery
        expect(infra._modules[2]._resources[0]).toStrictEqual(["power", 200]);  // From solar panels
        expect(infra._modules[3]._resources[2]).toStrictEqual(["food", 0]),     // Pushed to storage room
        expect(infra._modules[4]._resources[1]).toStrictEqual(["food", 100]);   // From hydro pod
    })

})