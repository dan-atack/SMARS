import Module from "../src/module";
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
    ],
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
    ],
    maintenanceCosts: [
        ["power", 1]
    ],
    storageCapacity: [],        // No storage at all
    crewCapacity: 1,
    shapes: []                  // Shapes data not needed for unit tests
};

const lifeSupportModInfo: ModuleInfo = {
    name: "Crew Quarters",
    width: 4,
    height: 3,
    type: "Life Support",
    pressurized: true,
    columnStrength: 10,
    durability: 100,
    buildCosts:[
        ["money", 100000],  // money
    ],
    maintenanceCosts: [
        ["power", 1]
    ],
    storageCapacity: [
        ["oxygen", 1000]    // oxygen, water, food
    ],
    crewCapacity: 2,
    shapes: []
};

const productionModuleInfo: ModuleInfo = {
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
        ["water", 5],
        ["carbon", 5],
        ["power", 100]
    ],
    productionOutputs: [
        ["food", 10],
        ["air", 10],
    ],
    storageCapacity: [
        ["air", 9000],
        ["water", 2500],
        ["carbon", 2500],
        ["food", 1000],
        ["power", 1000]     // Limited internal batteries
    ],
    crewCapacity: 1,
    shapes: []
}

const commsModuleInfo: ModuleInfo = {
    name: "Comms Antenna",
    type: "Communications",
    width: 8,
    height: 5,
    pressurized: false,
    columnStrength: 0,
    durability: 100,
    buildCosts: [
        [ "money", 200000 ]
    ],
    maintenanceCosts: [
        [ "power", 5 ]
    ],
    storageCapacity: [
        [ "power", 100 ]
    ],
    crewCapacity: 0,
    shapes: []
}

const moduleData = new Module(9000, 10, 10, storageModuleInfo);
const emptyModule = new Module(9001, 20, 20, noStoreModuleInfo);
const lsModule = new Module(9002, 14, 10, lifeSupportModInfo);
const prodModule = new Module(9003, 14, 6, productionModuleInfo);
const commsModule = new Module(9004, 10, 6, commsModuleInfo);

describe("ModuleData", () => {

    // Test setup function to clear all resources from a module
    const resetResource = (mod: Module) => {
        mod._resources.forEach((res) => {
            mod.deductResource(res);
        })
    }

    // Test setup function to completely fill a module
    const fillModule = (mod: Module) => {
        mod._moduleInfo.storageCapacity.forEach((res) => {
            mod.addResource(res);
        })
    }

    // Takes a second parameter to represent the fraction (out of 1) to fill a module
    const partiallyFillModule = (mod: Module, fraction: number) => {
        mod._moduleInfo.storageCapacity.forEach((res) => {
            const qty = Math.ceil(res[1] * fraction);
            mod.addResource([res[0], qty]);
        })
    }

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

    test("A module's type determines its resource sharing and resource getting policies", () => {
        // Storage: Sharing is true and acquisition is 0
        expect(moduleData._resourceSharing).toBe(true);
        expect(moduleData._resourceAcquiring).toBe(0);
        // Life Support: Sharing is false and acquisition is 1
        expect(lsModule._resourceSharing).toBe(false);
        expect(lsModule._resourceAcquiring).toBe(1);
        // Production: Sharing is false and acquisition is 0.5
        expect(prodModule._resourceSharing).toBe(false);
        expect(prodModule._resourceAcquiring).toBe(0.5);
        // Other: Other module types stay out of resource sharing entirely (false and 0)
        expect(commsModule._resourceSharing).toBe(false);
        expect(commsModule._resourceAcquiring).toBe(0);
    })

    test("Can determine resource requests based on resource sharing policy", () => {
        // Policy = 0 and module is full - Expect no requests
        fillModule(moduleData);
        expect(moduleData.determineResourceRequests()).toStrictEqual([]);
        // Policy = 0 and module is empty - Expect no requests
        resetResource(moduleData);
        expect(moduleData.determineResourceRequests()).toStrictEqual([]);
        // Policy = 0.5 and module is full - Expect no requests
        fillModule(prodModule);
        expect(prodModule.determineResourceRequests()).toStrictEqual([]);
        // Policy = 0.5 and module is half full - Expect no requests
        resetResource(prodModule);
        partiallyFillModule(prodModule, 0.5);
        expect(prodModule.determineResourceRequests()).toStrictEqual([]);
        // Policy = 0.5 and module is empty - Expect small requests
        resetResource(prodModule);
        expect(prodModule.determineResourceRequests()).toStrictEqual([
            {
                 "modId": 9003,
                 "resource":[
                   "air",
                   4500,
                 ],
               },
               {
                 "modId": 9003,
                 "resource":[
                   "water",
                   1250,
                 ],
               },
               {
                 "modId": 9003,
                 "resource": [
                   "carbon",
                   1250,
                 ],
               },
               {
                 "modId": 9003,
                 "resource": [
                   "food",
                   500,
                 ],
               },
               {
                 "modId": 9003,
                 "resource": [
                   "power",
                   500,
                 ],
               },
             ])
        // Policy = 1 and module is empty - Expect large requests
        resetResource(lsModule);
        expect(lsModule.determineResourceRequests()).toStrictEqual([{
            modId: 9002,
            resource: ["oxygen", 1000]
        }])
        // Policy = 1 and module is half full - Expect small requests
        partiallyFillModule(lsModule, 0.5);
        expect(lsModule.determineResourceRequests()).toStrictEqual([{
            modId: 9002,
            resource: ["oxygen", 500]
        }])
        // Policy = 1 and module is full - Expect no requests
        fillModule(lsModule);
        expect(lsModule.determineResourceRequests()).toStrictEqual([]);
    })
})