import Industry, { Role } from "../src/industry";
import Infrastructure from "../src/infrastructure";
import Map from "../src/map";
import Module from "../src/module";
import { ModuleInfo } from "../src/server_functions";
import { ColonistAction } from "../src/colonistData";

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

    test("Can get a job for a colonist", () => {
        // Pop the last job off of the list when jobs are available for the given role
        expect(industry.getJob("farmer")).toStrictEqual({
                type: "farm",
                coords: { x: 5, y: 27 },
                duration: 30,
                buildingId: 1002
        });
        // Run through farmer jobs list...
        expect(industry.getJob("farmer")).toStrictEqual({
            type: "farm",
                coords: { x: 1, y: 27 },
                duration: 30,
                buildingId: 1001
        });
        // ... Until it's empty
        expect(industry.getJob("farmer")).toBe(null);
        expect(industry.getJob("miner")).toBe(null);    // If no jobs exist for the given role, return a null
    })

    test("Can add/remove mining locations when given a pair of coordinates and resource name", () => {
        const coords1 = { x: 10, y: 30 };
        const coords2 = { x: 11, y: 30 };
        expect(industry._miningLocations.water.length).toBe(0);     // Validate initial test conditions
        expect(industry.addMiningLocation(coords1, "water")).toBe(true);    // Return true if coords are added
        expect(industry._miningLocations.water.length).toBe(1);
        expect(industry.addMiningLocation(coords2, "water")).toBe(true);
        expect(industry._miningLocations.water.length).toBe(2);
        expect(industry.addMiningLocation(coords1, "watah")).toBe(false);   // Return false if resource name not recognized
        expect(industry._miningLocations.water.length).toBe(2);
        expect(industry.addMiningLocation(coords2, "water")).toBe(false);   // Return false if removing existing coords
        expect(industry._miningLocations.water.length).toBe(1);
        expect(industry.addMiningLocation(coords2, "water")).toBe(true);    // Re-add second coords pair just to be REALLY sure
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

})