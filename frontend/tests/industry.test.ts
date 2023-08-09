import Industry, { Role } from "../src/industry";
import Infrastructure from "../src/infrastructure";
import Map from "../src/map";
import Module from "../src/module";
import { ModuleInfo } from "../src/server_functions";
import { ColonistAction } from "../src/colonistData";
import { Coords } from "../src/connector";

describe("Industry class", () => {

    // Fake module data for farmer roles
    const farmData: ModuleInfo = {
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
        productionInputs: [
            ["water", 5],
            // ["carbon", 5],
            // ["power", 100]
        ],
        productionOutputs: [
            ["food", 10]
            // ["air", 10],
        ],
        storageCapacity: [
            // ["air", 9000],
            ["water", 2500],
            ["food", 1000]
            // ["carbon", 2500],
            // ["power", 1000]
        ],
        crewCapacity: 1,
        shapes: []
    }

    // Fake terrain data (TODO: Create a Map class instance here to pass legitimate topography and zone data to the Infra tests)
    const mockography = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
    const zonesData = [
        { id: '0026', leftEdge: { x: 0, y: 26 }, rightEdge: { x: 20, y: 26 } }
    ]

    const testMap = new Map();

    // Create test instances
    const industry = new Industry();
    const infra = new Infrastructure();
    infra._data.setup(mockography.length);
    infra.addModule(0, 25, farmData, mockography, zonesData, 1001);
    infra.addModule(4, 25, farmData, mockography, zonesData, 1002);
    infra.addModule(8, 25, farmData, mockography, zonesData, 1003);

    test("Defines updateJobs", () => {
        expect(typeof industry.updateJobs).toBe("function");
    })

    test("UpdateJobsForRole creates a list of available jobs", () => {
        const role: Role = { name: "farmer", action: "farm", resourceProduced: "food" }
        // Setup test: Fill 2 of the farm modules and leave the third one empty
        infra.addResourcesToModule(1001, ["water", 1000]);
        infra.addResourcesToModule(1002, ["water", 1000]);
        // Validate test setup
        expect(infra._modules[0]._resources).toStrictEqual([["water", 1000], ["food", 0]]);
        expect(infra._modules[1]._resources).toStrictEqual([["water", 1000], ["food", 0]]);
        // Run test: Expect one job for each farm slot (one per module)
        industry.updateJobsForRole(infra, role.name);
        expect(industry._jobs.farmer).toStrictEqual([
            {
                type: "farm",
                coords: { x: 1, y: 27 },
                duration: 30,
                buildingId: 1001
            },
            {
                type: "farm",
                coords: { x: 5, y: 27 },
                duration: 30,
                buildingId: 1002
            }
        ]);
        // Run alternate test: Expect same results when the role's action word instead
        industry.updateJobsForRole(infra, role.action);
        expect(industry._jobs.farmer).toStrictEqual([
            {
                type: "farm",
                coords: { x: 1, y: 27 },
                duration: 30,
                buildingId: 1001
            },
            {
                type: "farm",
                coords: { x: 5, y: 27 },
                duration: 30,
                buildingId: 1002
            }
        ]);
        // Check that no extra keys have been created in the Jobs object by mistake
        expect(Object.keys(industry._jobs).length).toBe(2); // Farmer and miner
    })

    // Updated to factor in the colonist's proximity to a job site (Works for both mining and production module jobs)
    test("Can get a job for a colonist", () => {
        const colonistCoords: Coords = { x: 0, y: 30 };
        // Job assigned is the one with the nearest coords, not necessarily the last one in the list:
        expect(industry._jobs.farmer.length).toBe(2);
        expect(industry.getJob("farmer", colonistCoords)).toStrictEqual({
                type: "farm",
                coords: { x: 1, y: 27 },
                duration: 30,
                buildingId: 1001
        });
        expect(industry._jobs.farmer.length).toBe(1);
        // Next job is from the farther coordinates
        expect(industry.getJob("farmer", colonistCoords)).toStrictEqual({
            type: "farm",
                coords: { x: 5, y: 27 },
                duration: 30,
                buildingId: 1002
        });
        // ... Until it's empty
        expect(industry.getJob("farmer", colonistCoords)).toBe(null);
        expect(industry.getJob("miner", colonistCoords)).toBe(null);    // If no jobs exist for the given role, return a null
    })

    test("Can add/remove mining locations when given a pair of coordinates and resource name", () => {
        const coords1 = { x: 10, y: 30 };
        const coords2 = { x: 11, y: 30 };
        expect(industry._miningLocations.water.length).toBe(0);     // Validate initial test conditions
        expect(industry.toggleMiningLocation(coords1, "water")).toBe(true);    // Return true if coords are added
        expect(industry._miningLocations.water.length).toBe(1);
        expect(industry.toggleMiningLocation(coords2, "water")).toBe(true);
        expect(industry._miningLocations.water.length).toBe(2);
        expect(industry.toggleMiningLocation(coords1, "watah")).toBe(false);   // Return false if resource name not recognized
        expect(industry._miningLocations.water.length).toBe(2);
        expect(industry.toggleMiningLocation(coords2, "water")).toBe(false);   // Return false if removing existing coords
        expect(industry._miningLocations.water.length).toBe(1);
        expect(industry.toggleMiningLocation(coords2, "water")).toBe(true);    // Re-add second coords pair just to be REALLY sure
        expect(industry._miningLocations.water.length).toBe(2);
    })

    test("Can add mining jobs based on available mining locations", () => {
        // Use the coordinate sets defined in the previous test
        industry.updateJobs(infra);
        expect(industry._jobs.miner.length).toBe(2);
        // Fill one of the slots to allow only 1 job to be created on the next update
        industry._miningCoordinatesInUse.water.push({ x: 10, y: 30 });
        industry.updateJobs(infra);
        expect(industry._jobs.miner.length).toBe(1);
        // Vacate the occupied slot and update again - should go back to 2 jobs available
        industry._miningCoordinatesInUse.water = [];
        industry.updateJobs(infra);
        expect(industry._jobs.miner.length).toBe(2);
    })

    test("Can update any resource's mining locations inUse status when a colonist approaches or leaves", () => {
        // Validate that no coordinates are in use at the start of the test
        expect(industry._miningCoordinatesInUse.water.length).toBe(0);
        // Punch in / out of non-designated location = not accepted
        expect(industry.updateMiningLocationStatus("water", { x: 20, y: 30 }, true )).toBe(false);  // Punch in to bad location
        expect(industry.updateMiningLocationStatus("water", { x: 10, y: 40 }, true )).toBe(false);  // Punch out of bad location
        // Punch in to unoccupied location = accepted
        expect(industry.updateMiningLocationStatus("water", { x: 10, y: 30 }, true )).toBe(true);
        expect(industry._miningCoordinatesInUse.water.length).toBe(1);
        expect(industry.updateMiningLocationStatus("water", { x: 11, y: 30 }, true )).toBe(true);
        expect(industry._miningCoordinatesInUse.water.length).toBe(2);
        // Punch in to occupied location = not accepted
        expect(industry.updateMiningLocationStatus("water", { x: 10, y: 30 }, true )).toBe(false);
        expect(industry._miningCoordinatesInUse.water.length).toBe(2);
        // Punch out of occupied location = accepted
        expect(industry.updateMiningLocationStatus("water", { x: 10, y: 30 }, false )).toBe(true);
        expect(industry._miningCoordinatesInUse.water.length).toBe(1);
        // Punch out of unoccupied location = not accepted
        expect(industry.updateMiningLocationStatus("water", { x: 10, y: 30 }, false )).toBe(false);
        expect(industry._miningCoordinatesInUse.water.length).toBe(1);
        
    })

    test("Only adds jobs for modules that have the isMaintained property equal to true", () => {
        // Setup: Ensure all modules are provisioned and otherwise ready to go
        infra.addResourcesToModule(1001, ["water", 1000]);
        infra.addResourcesToModule(1002, ["water", 1000]);
        infra.addResourcesToModule(1003, ["water", 1000]);
        industry.updateJobsForRole(infra, "farmer");
        expect(industry._jobs.farmer.length).toBe(3);
        // Disabling one of the modules creates only 2 jobs on the next update cycle
        infra._modules[1]._isMaintained = false;
        industry.updateJobsForRole(infra, "farmer");
        expect(industry._jobs.farmer.length).toBe(2);
        // Disable yet another module (only one job is created)
        infra._modules[2]._isMaintained = false;
        industry.updateJobsForRole(infra, "farmer");
        expect(industry._jobs.farmer.length).toBe(1);
        // Reactivate both modules (3 jobs created again)
        infra._modules[1]._isMaintained = true;
        infra._modules[2]._isMaintained = true;
        industry.updateJobsForRole(infra, "farmer");
        expect(industry._jobs.farmer.length).toBe(3);
    })

})