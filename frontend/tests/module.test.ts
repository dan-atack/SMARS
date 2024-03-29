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
        ["power", 1],
        ["oxygen", 12]
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
        ["power", 1],
        ["oxygen", 12]
    ],
    storageCapacity: [],        // No storage at all
    crewCapacity: 1,
    shapes: []                  // Shapes data not needed for unit tests
};

const crewQuartersModInfo: ModuleInfo = {
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
        ["power", 5],
        ["oxygen", 12]
    ],
    storageCapacity: [
        ["oxygen", 1000],    // oxygen, water, food
        ["power", 1000]
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
        ["power", 10],
        ["oxygen", 12]
    ],
    productionInputs: [     // Plant life needs: water, CO2 and light (in this case electric light)
        ["water", 5],
        ["carbon", 5],
        ["power", 100]
    ],
    productionOutputs: [
        ["food", 10],
        ["oxygen", 10],
    ],
    storageCapacity: [
        ["oxygen", 9000],
        ["water", 2500],
        ["carbon", 2500],
        ["food", 1000],
        ["power", 1000]     // Limited internal batteries
    ],
    crewCapacity: 2,
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

const moduleData = new Module(9000, 10, 10, storageModuleInfo);
const emptyModule = new Module(9001, 20, 20, noStoreModuleInfo);
const lsModule = new Module(9002, 14, 10, crewQuartersModInfo);
const prodModule = new Module(9003, 14, 6, productionModuleInfo);
const commsModule = new Module(9004, 10, 6, commsModuleInfo);
const prodModule2 = new Module(9005, 10, 2, productionModuleInfo);
const solarPanelModule = new Module(9006, 14, 3, solarPanelInfo);

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

    test("Can return resource space available when given a resource name", () => {
        expect(moduleData.getResourceCapacityAvailable("water")).toBe(9500);    // Return = max capacity - current amount
        expect(moduleData.getResourceCapacityAvailable("plutonium")).toBe(0);   // Return 0 when resource name not found
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
        // Other: Other module types do not share, and try to fill up to 50% (false and 0.5)
        expect(commsModule._resourceSharing).toBe(false);
        expect(commsModule._resourceAcquiring).toBe(0.5);
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
        // Policy = 0.5 and module is empty AND MODULE TYPE IS PRODUCTION - Expect small requests for INPUT RESOURCES ONLY
        resetResource(prodModule);
        expect(prodModule.determineResourceRequests()).toStrictEqual([
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
                   "power",
                   500,
                 ],
               },
               {
                "modId": 9003,
                "resource": [
                  "oxygen",
                  4500,
                ],
              }
             ])
        // Policy = 1 and module is empty - Expect large requests
        resetResource(lsModule);
        expect(lsModule.determineResourceRequests()).toStrictEqual([
            {
                modId: 9002,
                resource: ["oxygen", 1000]
            },
            {
                modId: 9002,
                resource: ["power", 1000]
            }
        ])
        // Policy = 1 and module is half full - Expect small requests
        partiallyFillModule(lsModule, 0.5);
        expect(lsModule.determineResourceRequests()).toStrictEqual([
            {
                modId: 9002,
                resource: ["oxygen", 500]
            },
            {
                modId: 9002,
                resource: ["power", 500]
            }
        ])
        // Policy = 1 and module is full - Expect no requests
        fillModule(lsModule);
        expect(lsModule.determineResourceRequests()).toStrictEqual([]);
    })

    test("hasProductionInputs can tell if module has sufficient resources for production", () =>{
        // Setup test: 1 module has enough resources, the other has almost enough resources but not quite
        resetResource(prodModule);
        prodModule.addResource(["water", 5]);
        prodModule.addResource(["power", 100]);
        prodModule.addResource(["carbon", 5]);
        
        prodModule2.addResource(["water", 5]);
        prodModule2.addResource(["power", 100]);
        prodModule2.addResource(["carbon", 4]);
        expect(prodModule.hasProductionInputs()).toBe(true);
        expect(prodModule2.hasProductionInputs()).toBe(false);
    })

    test("punchIn adds a colonist ID to the list of crew present in the module if module is maintained", () => {
        const colonistId = 5000;
        prodModule.punchIn(colonistId);
        expect(prodModule._crewPresent).toStrictEqual([5000]);
        // Extension: Reset test to test punch-in rejection is module is not maintained
        prodModule.punchOut(colonistId);
        prodModule._isMaintained = false;
        expect(prodModule.punchIn(colonistId)).toBe(false);
        expect(prodModule._crewPresent).toStrictEqual([]);
        prodModule._isMaintained = true;        // Reset maintenance status and punch in again to avoid disrupting other tests
        expect(prodModule.punchIn(colonistId)).toBe(true);
        expect(prodModule._crewPresent).toStrictEqual([5000]);

    })

    test("punchIn only allows the Colonist to enter if the module is not already full", () => {
        // Module has a capacity of 2 and only one current tenant, so add two more, one at a time
        const homer = 5001;
        const homerS = 5002;
        expect(prodModule.punchIn(homer)).toBe(true);       // Room for one more?
        expect(prodModule.punchIn(homerS)).toBe(false);     // It says 'no homerS'. We're allowed to have one!
    })

    test("PunchOut removes a colonist ID from the list of crew present", () => {
        // Setup test by going back down to one occupant
        prodModule.punchOut(5002);
        const otherId = 5001;
        prodModule.punchIn(otherId);
        expect(prodModule._crewPresent).toStrictEqual([5000, 5001]);    // Add a second ID to the list for fun
        prodModule.punchOut(5000);
        expect(prodModule._crewPresent).toStrictEqual([5001]);  // Number punched out is removed from the list
        prodModule.punchOut(5000);
        expect(prodModule._crewPresent).toStrictEqual([5001]);  // Calling for a number not in the list does nothing
        prodModule.punchOut(5001);
        expect(prodModule._crewPresent).toStrictEqual([]);  // Can empty the list with this command
    })

    test("Produce removes inputs from module resource stocks and adds output resources if all inputs are present", () => {
        // Module 1: Has enough resources = inputs reduced; outputs increased
        prodModule.produce();
        expect(prodModule._resources).toStrictEqual([
            ["oxygen", 10],
            ["water", 0],
            ["carbon", 0],
            ["food", 10],
            ["power", 0]
        ]);
        // Module 2: Does not have enough resoures = inputs are wasted!
        prodModule2.produce();
        expect(prodModule2._resources).toStrictEqual([
            ["oxygen", 0],
            ["water", 0],
            ["carbon", 0],
            ["food", 0],
            ["power", 0]
        ]);
    })

    test("Power modules can generate power when the generatePower method is called", () => {
        expect(solarPanelModule.generatePower(100)).toBe(50);   // Full output generated at 100 percent sunlight
        expect(solarPanelModule._resources[0]).toStrictEqual(["power", 50]);    // Verify that power is added
        expect(solarPanelModule.generatePower(99)).toBe(50);    // Output is rounded up to the next integer
        expect(solarPanelModule._resources[0]).toStrictEqual(["power", 100]);
        expect(solarPanelModule.generatePower(98)).toBe(49);
        expect(solarPanelModule._resources[0]).toStrictEqual(["power", 149]);
        expect(solarPanelModule.generatePower(50)).toBe(25);
        expect(solarPanelModule._resources[0]).toStrictEqual(["power", 174]);
        expect(solarPanelModule.generatePower(1)).toBe(1);
        expect(solarPanelModule._resources[0]).toStrictEqual(["power", 175]);
        expect(solarPanelModule.generatePower(0)).toBe(0);      // No sun = no power produced
        expect(solarPanelModule._resources[0]).toStrictEqual(["power", 175]);
        expect(solarPanelModule.generatePower()).toBe(null);    // Validate error return when sunlight value not provided
    })

    // Maintenance method tests
    test("handleOxygenLeakages deducts pressurized modules' oxygen supply, and notes shortages", () => {
        // Setup test: Two pressurized modules - one with oxygen and one without; and one non-pressurized module (solar panel)
        const pressurizedFull = new Module(9000, 0, 30, crewQuartersModInfo);
        pressurizedFull.addResource(["oxygen", 10000]);                         // Full module has a supply of oxygen to leak
        const pressurizeEmpty = new Module(9001, 4, 30, crewQuartersModInfo);   // Empty module has no oxygen available
        expect(pressurizedFull.handleOxygenLeakage()).toBe(true);           // True = enough oxygen was available
        expect(pressurizedFull.getResourceQuantity("oxygen")).toBe(988);    // 12 oxygen subtracted from 1000 = 988 remains
        expect(pressurizeEmpty.handleOxygenLeakage()).toBe(false);          // False = not enough oxygen available
        expect(solarPanelModule.handleOxygenLeakage()).toBe(true);          // True = module has no need for air pressure
    })

    test("handleResourceUse deducts modules' non-oxygen maintenance needs, and notes shortages", () => {
        // Setup: Two modules that require maintenance resources (power) - one with power and one without; and one with no needs
        const needsAndProvisioned = new Module(9000, 0, 30, crewQuartersModInfo);
        needsAndProvisioned.addResource(["power", 10000]);
        const needsNotProvisioned = new Module(9001, 0, 30, crewQuartersModInfo);
        expect(needsAndProvisioned.handleResourceUse()).toBe(true);             // True = needs have been met
        expect(needsAndProvisioned.getResourceQuantity("power")).toBe(995);     // 5 power subtracted from 1000 = 995 remains
        expect(needsNotProvisioned.handleResourceUse()).toBe(false);            // False = needs have not been met
        expect(solarPanelModule.handleResourceUse()).toBe(true);                // True = module has no maintenance costs
    })

    test("handleMaintenance method sets module's isMaintained status by calling leakage and resource use methods", () => {
        const mod = new Module(9000, 0, 30, crewQuartersModInfo);
        // Case 1: Module that needs oxygen and power, and has both - is maintained
        mod.addResource(["oxygen", 100]);
        mod.addResource(["power", 100]);
        mod.handleMaintenance();
        expect(mod._isMaintained).toBe(true);
        // Case 2: Module that needs oxygen and power, and has oxygen but not power - not maintained
        mod.deductResource(["power", 100]);
        mod.handleMaintenance();
        expect(mod._isMaintained).toBe(false);
        // Case 3: Module that needs oxygen and power, and has power but not oxygen - not maintained
        mod.deductResource(["oxygen", 100]);
        mod.addResource(["power", 100]);
        mod.handleMaintenance();
        expect(mod._isMaintained).toBe(false);
        // Case 4: Module that needs only power, and has it - is maintained
        commsModule.addResource(["power", 100]);
        commsModule.handleMaintenance();
        expect(commsModule._isMaintained).toBe(true);
        // Case 5: Module that needs only power, and lacks it - is not maintained
        commsModule.deductResource(["power", 10000]);
        commsModule.handleMaintenance();
        expect(commsModule._isMaintained).toBe(false);
        // Case 6: Module that is not maintained gains resources and becomes maintained
        commsModule.addResource(["power", 100]);
        commsModule.handleMaintenance();
        expect(commsModule._isMaintained).toBe(true);
    })

    test("getMaintenanceResourceNames returns a list of resource names (including oxygen) needed for maintenance", () => {
        expect(solarPanelModule.getMaintenanceResourceNames()).toStrictEqual([]);
        expect(commsModule.getMaintenanceResourceNames()).toStrictEqual(["power"]);
        expect(lsModule.getMaintenanceResourceNames()).toStrictEqual(["power", "oxygen"]);
    })

})