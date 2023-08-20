// New file for testing methods specifically related to the Colonist's morale functions
import ColonistData, { ColonistAction } from "../src/colonistData";
import Infrastructure from "../src/infrastructure";
import Map from "../src/map";
import Industry from "../src/industry";
import { ModuleInfo } from "../src/server_functions";

describe("ColonistData", () => {

    // Create test colonist (data class)

    const colonist = new ColonistData(9000, "Bob Jones", 0, 30);

    // Create supplementary test assets
    const infra = new Infrastructure();
    const industry = new Industry();
    const map = new Map();
    // Dummy map data
    const flatTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]];
    // Dummy structure asset data:
    const prodModInfo: ModuleInfo = {
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
    
    const crewModuleData: ModuleInfo = {
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
    }
    // Setup test assets
    map._mapData = flatTerrain;
    map.updateTopographyAndZones();
    infra.setup(map._mapData.length);
    infra.addModule(0, 30, prodModInfo, map._topography, map._zones);       // Farm
    infra.addModule(4, 30, crewModuleData, map._topography, map._zones);    // Sleeping quarters

    // For convenience
    const resetColonist = (colonist: ColonistData) => {
        colonist._needs = {
            food: 0,
            water: 0,
            rest: 0
        };
        colonist.resolveGoal();
        colonist._morale = 50;
        colonist._x = 0;
        colonist._y = 31;
        colonist.detectTerrainBeneath(map, infra);
    }

    test("updateMorale increases/decreases morale and respects upper and lower limits", () => {
        // Validate Colonist default morale
        expect(colonist._morale).toBe(50);
        // Validate morale updater function with small increase
        colonist.updateMorale(5);
        expect(colonist._morale).toBe(55);
        // Validate morale updater function respects upper limit (100)
        colonist.updateMorale(50);
        expect(colonist._morale).toBe(100);
        // Validate morale updater function with small decrease
        colonist.updateMorale(-5);
        expect(colonist._morale).toBe(95);
        // Validate morale updater function respects lower limit (0)
        colonist.updateMorale(-100);
        expect(colonist._morale).toBe(0);
    })

    test("determineMoraleChangeForNeeds reduces morale for any need that is intolerably past its threshold", () => {
        // Reset colonist moral and needs
        resetColonist(colonist);
        // Case 1: No needs are at their threshold (no morale loss)
        colonist._needs.food = 6;
        colonist.determineMoraleChangeForNeeds();
        expect(colonist._morale).toBe(50);
        // Case 2: One need is past its threshold, equal to threshold + tolerance (no loss)
        colonist._needs.water = 6;
        colonist.determineMoraleChangeForNeeds();
        expect(colonist._morale).toBe(50);
        // Case 3: One need is past its threshold, above tolerance (-1 morale)
        colonist._needs.rest = 19;
        colonist.determineMoraleChangeForNeeds();
        expect(colonist._morale).toBe(49);
        // Case 4: Two needs are past their thresholds, above tolerance (-2 morale)
        colonist._needs.food = 9;
        colonist.determineMoraleChangeForNeeds();
        expect(colonist._morale).toBe(47);
        // Case 5: Three needs are past their thresholds, above tolerance (-3 morale)
        colonist._needs.water = 7;
        colonist.determineMoraleChangeForNeeds();
        expect(colonist._morale).toBe(44);
    })

    test("Colonist morale affects duration for work actions", () => {
        resetColonist(colonist);
        colonist._role = ["farmer", 0];
        const jobs: ColonistAction[] = [{
            type: "farm",
            coords: { x: 1, y: 32 },
            duration: 30,
            buildingId: 1001
        }];
        industry._jobs.farmer = jobs;
        colonist._x = 1;
        colonist.checkForJobs(infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "farm",
            coords: { x: 1, y: 32 },
            duration: 30,
            buildingId: 1001
        }); // Expect normal duration when morale is 50
        // Reset test conditions and do again for different morale values, starting with 99
        infra._modules[0]._crewPresent = [];
        jobs[0].duration = 30;
        industry._jobs.farmer = jobs;
        colonist._morale = 99;                                  // Morale 99 = -4 duration
        colonist.checkForJobs(infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "farm",
            coords: { x: 1, y: 32 },
            duration: 26,
            buildingId: 1001
        });
        // Reset test and redo with 100 morale
        infra._modules[0]._crewPresent = [];
        jobs[0].duration = 30;
        industry._jobs.farmer = jobs;
        colonist._morale = 100;                                  // Morale 100 = -5 duration
        colonist.checkForJobs(infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "farm",
            coords: { x: 1, y: 32 },
            duration: 25,
            buildingId: 1001
        });
        // Reset test and redo with 59 morale
        infra._modules[0]._crewPresent = [];
        jobs[0].duration = 30;
        industry._jobs.farmer = jobs;
        colonist._morale = 59;                                  // Morale 59 = NO CHANGE
        colonist.checkForJobs(infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "farm",
            coords: { x: 1, y: 32 },
            duration: 30,
            buildingId: 1001
        });
        // Reset test and redo with 60 morale
        infra._modules[0]._crewPresent = [];
        jobs[0].duration = 30;
        industry._jobs.farmer = jobs;
        colonist._morale = 60;                                  // Morale 60 = -1
        colonist.checkForJobs(infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "farm",
            coords: { x: 1, y: 32 },
            duration: 29,
            buildingId: 1001
        });
        // Reset test and redo with 0 morale
        infra._modules[0]._crewPresent = [];
        jobs[0].duration = 30;
        industry._jobs.farmer = jobs;
        colonist._morale = 0;                                  // Morale 0 = +5
        colonist.checkForJobs(infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "farm",
            coords: { x: 1, y: 32 },
            duration: 35,
            buildingId: 1001
        });
        // Reset test and redo with 9 morale
        infra._modules[0]._crewPresent = [];
        jobs[0].duration = 30;
        industry._jobs.farmer = jobs;
        colonist._morale = 9;                                  // Morale 9 = +5
        colonist.checkForJobs(infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "farm",
            coords: { x: 1, y: 32 },
            duration: 35,
            buildingId: 1001
        });
        // Reset test and redo with 10 morale
        infra._modules[0]._crewPresent = [];
        jobs[0].duration = 30;
        industry._jobs.farmer = jobs;
        colonist._morale = 10;                                  // Morale 10 = +4
        colonist.checkForJobs(infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "farm",
            coords: { x: 1, y: 32 },
            duration: 34,
            buildingId: 1001
        });
    })

    test("Colonist morale affects duration for sleep action", () => {
        resetColonist(colonist);
        colonist._needs.rest = 16;  // Make the colonist tired after resetting
        colonist._x = 5;            // Move into position to drop right into bed
        // Test 1: Normal morale - normal sleep required
        colonist.setGoal("get-rest", infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "rest",
            coords: { x: 5, y: 32 },
            duration: 480,
            buildingId: 1003
        });
        // Test 2: Excelent morale - normal sleep required
        resetColonist(colonist);
        infra._modules[1]._crewPresent = [];
        colonist._needs.rest = 16;  // Make the colonist tired after resetting
        colonist._morale = 100;     // Maximize morale (should have no effect)
        colonist._x = 5;            // Move into position to drop right into bed
        colonist.setGoal("get-rest", infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "rest",
            coords: { x: 5, y: 32 },
            duration: 480,
            buildingId: 1003
        });
        // Test 3: Bad morale - more sleep required
        resetColonist(colonist);
        infra._modules[1]._crewPresent = [];
        colonist._needs.rest = 16;  // Make the colonist tired after resetting
        colonist._morale = 25;      // For every 25 morale under 50, colonist loses an hour's sleep
        colonist._x = 5;            // Move into position to drop right into bed
        colonist.setGoal("get-rest", infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "rest",
            coords: { x: 5, y: 32 },
            duration: 540,
            buildingId: 1003
        });
        // Test 4: Horrible morale - maximum sleep required
        resetColonist(colonist);
        infra._modules[1]._crewPresent = [];
        colonist._needs.rest = 16;  // Make the colonist tired after resetting
        colonist._morale = 0;       // At 0 morale, add 2 hours's sleep
        colonist._x = 5;            // Move into position to drop right into bed
        colonist.setGoal("get-rest", infra, map, industry);
        expect(colonist._currentAction).toStrictEqual({
            type: "rest",
            coords: { x: 5, y: 32 },
            duration: 600,
            buildingId: 1003
        });
    })

})