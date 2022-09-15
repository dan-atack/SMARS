import ColonistData from "../src/colonistData";
import Infrastructure from "../src/infrastructure";
import Map from "../src/map";
import { ModuleInfo } from "../src/server_functions";

// DUMMY DATA

// Test module data
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

// Dummy map data
const flatTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]];
const flatTopography = [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33];
const bumpyTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1]];
const bumpyTopography = [33, 33, 32, 31, 32, 33, 33, 33, 33, 33, 34, 35, 34, 34, 32, 33];
const cliffs = [[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3, 4, 5], [1, 2, 3, 4], [1, 2, 3], [1, 2, 3], [1, 2, 3], ];


describe("ColonistData", () => {
    // Create test instances
    let colonistData = new ColonistData(1, 0);
    const mockInfra = new Infrastructure();
    const mockMap = new Map();
    mockMap._data._mapData = flatTerrain;
    mockMap._data.updateTopographyAndZones();
    mockInfra._data.setup(mockMap._data._mapData.length);
    mockInfra.addModule(10, 30, storageModuleInfo, mockMap._data._topography, mockMap._data._zones, 1001);
    // Provision test module with resources
    mockInfra.addResourcesToModule(1001, [ "water", 100 ]);
    mockInfra.addResourcesToModule(1001, [ "food", 100 ]);
    // Heights per column: 3, 4, 6 (max three columns shown)
    const unevenTerrain = [[1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1, 1, 1]];

    test("Defines updateNeeds()", () => {
        expect(typeof colonistData.updateNeeds).toBe("function");
    });

    // GOAL-RELATED TESTS

    test("Sets goal to explore", () => {
        colonistData.setGoal("explore");
        expect(colonistData._currentGoal).toBe("explore");
    })

    test("Colonist with no goal will set goal to explore when updateGoal is called", () => {
        colonistData._currentGoal = "";
        colonistData.updateGoal(mockInfra, mockMap);
        expect(colonistData._currentGoal).toBe("explore");
    })

    test("Hourly updater method increases colonist needs", () => {
        colonistData.handleHourlyUpdates(mockInfra, mockMap);
        expect(colonistData._needs).toStrictEqual({
            water: 1,
            food: 1,
            rest: 1
        })
    })

    test("When a particular need (e.g. water) reaches its threshold, goal is set to 'get-<resource>' from 'explore'", () => {
        colonistData._needs = {
            water: 3,
            food: 3,
            rest: 3
        };
        colonistData._currentGoal = "explore";
        colonistData.handleHourlyUpdates(mockInfra, mockMap);
        expect(colonistData._currentGoal).toBe("get-water");
    })

    test("When a 'get' goal has been set, another need passing the threshold will not override it", () => {
        colonistData._needs = {
            water: 0,
            food: 7,
            rest: 0
        };
        colonistData.handleHourlyUpdates(mockInfra, mockMap);
        expect(colonistData._currentGoal).toBe("get-water");
    })

    test("StartGoalProgress will set the first action in a pre-filled action stack to the current action", () => {
        // Actions have already been added by the previous tests
        colonistData.startGoalProgress(mockInfra);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 0
        })
    })

    test("ResolveGoal clears action stack", () => {
        expect(colonistData._actionStack.length).toBeGreaterThan(0);
        colonistData.resolveGoal();
        expect(colonistData._actionStack).toStrictEqual([]);
        expect(colonistData._currentAction).toBe(null);
    })

    test("CheckGoalStatus method will resolve current goal and set a new one if there is no current action/action stack", () => {
        colonistData.checkGoalStatus(mockInfra, mockMap);
        expect(colonistData._currentGoal).toBe("get-food"); // Will be set to get-food since we increased food need in prev test
    })

    // ACTION-RELATED TESTS

    test("AddAction adds an action to the action stack", () => {
        // Clear action stack before commencing test
        colonistData.clearActions();
        colonistData.resolveAction();
        expect(colonistData._actionStack).toStrictEqual([]);
        colonistData.addAction("move", { x: 0, y: 0 }, 10, 0);
        expect(colonistData._actionStack).toStrictEqual([
            {
                type: "move",
                coords: { x: 0, y: 0 },
                duration: 10,
                buildingId: 0
            }
        ])
        // Add another one for good luck!
        colonistData.addAction("eat", { x: 10, y: 32 }, 10, 1001);
        expect(colonistData._actionStack).toStrictEqual([
            {
                type: "move",
                coords: { x: 0, y: 0 },
                duration: 10,
                buildingId: 0
            },
            {
                type: "eat",
                coords: { x: 10, y: 32 },
                duration: 10,
                buildingId: 1001
            }
        ])
    })

    test("CheckActionStatus increments the actionTimeElapsed value for actions with a duration", () => {
        // Start the action before checking the action status
        colonistData.startAction(mockInfra);
        expect(colonistData._actionTimeElapsed).toBe(0);
        colonistData.checkActionStatus(mockInfra);
        expect(colonistData._actionTimeElapsed).toBe(1);
    })

    test("CheckActionStatus does not increment the time elapsed value for actions without a duration (duration = 0)", () => {
        // Set new action first
        colonistData.clearActions();
        colonistData.resolveAction();
        expect(colonistData._actionTimeElapsed).toBe(0);    // Validate reset
        colonistData.addAction("move", { x: 0, y: 0 });
        colonistData.startAction(mockInfra);
        colonistData.checkActionStatus(mockInfra);
        expect(colonistData._actionTimeElapsed).toBe(0);    // Validate that time elapsed is still 0
    })

    test("CheckActionStatus resolves 'climb' action when colonist x and y position match action coords", () => {
        // Setup test first
        colonistData.clearActions();
        colonistData.resolveAction();
        colonistData.addAction("climb", { x: 10, y: 32 }, 0, 1001);
        colonistData.startAction(mockInfra);
        // Verify that action is initiated
        expect(colonistData._currentAction).toStrictEqual({
            type: "climb",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 1001
        })
        // Verify that action is not resolved when colonist is not in the exact position
        colonistData._x = 10;
        colonistData._y = 9;
        colonistData.checkActionStatus(mockInfra);
        expect(colonistData._currentAction).toStrictEqual({
            type: "climb",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 1001
        })
        colonistData._y = 32;   // Move the colonist into position and re-check
        colonistData.checkActionStatus(mockInfra);
        expect(colonistData._currentAction).toBe(null); // Action should now be resolved
    })

    test("CheckActionStatus resolves 'drink' action when colonist actionTimeElapsed value is equal to action duration", () => {
        // Setup test first
        colonistData.clearActions();
        colonistData.resolveAction();
        colonistData.addAction("drink", { x: 10, y: 32 }, 10, 1001);
        colonistData.startAction(mockInfra);
        // Verify that action is initiated
        expect(colonistData._currentAction).toStrictEqual({
            type: "drink",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        })
        // Verify that action is not resolved when colonist has not finished drinking
        colonistData._actionTimeElapsed = 8;
        colonistData.checkActionStatus(mockInfra);
        expect(colonistData._currentAction).toStrictEqual({
            type: "drink",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        })
        colonistData._actionTimeElapsed = 10;   // Increase the action time elapsed to equal the duration value
        colonistData.checkActionStatus(mockInfra);
        expect(colonistData._currentAction).toBe(null); // Action should now be resolved
    })

    test("CheckActionStatus resolves 'eat' action when colonist actionTimeElapsed value is equal to action duration", () => {
        // PART 1: Action is resolved when, and only when, its condition is met
        // Setup test first
        colonistData.clearActions();
        colonistData.resolveAction();
        colonistData.addAction("eat", { x: 10, y: 32 }, 10, 1001);
        colonistData.startAction(mockInfra);
        // Verify that action is initiated
        expect(colonistData._currentAction).toStrictEqual({
            type: "eat",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        })
        // Verify that action is not resolved when colonist has not finished eating
        colonistData._actionTimeElapsed = 8;
        colonistData.checkActionStatus(mockInfra);
        expect(colonistData._currentAction).toStrictEqual({
            type: "eat",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        })
        colonistData._actionTimeElapsed = 10;   // Increase the action time elapsed to equal the duration value
        colonistData.checkActionStatus(mockInfra);
        expect(colonistData._currentAction).toBe(null); // Action should now be resolved
        // PART 2: Action is resolved, but Colonist's need is only partially satisfied if target module has insufficient resources
        // Reset test conditions
        colonistData.clearActions();
        colonistData.resolveAction();
        colonistData._needs.food = 10;
        mockInfra._modules[0]._data.deductResource(["food", 10000]);    // Ensure module is empty
        mockInfra._modules[0]._data.addResource(["food", 5]);           // Provision with slightly fewer resources than are needed
        colonistData.addAction("eat", { x: 10, y: 32 }, 10, 1001);
        colonistData.startAction(mockInfra);
        expect(mockInfra._modules[0]._data.getResourceQuantity("food")).toBe(0);    // Colonist takes everything there is to take
        expect(colonistData._currentAction?.duration).toBe(5);      // Reduce duration since it takes less time to eat less food
        // Fast forward to the end of the action
        colonistData._actionTimeElapsed = 4;
        colonistData.checkActionStatus(mockInfra);
        expect(colonistData._currentAction).toBe(null);     // Action should resolve itself after a shorter than expected duration
        expect(colonistData._needs.food).toBe(5);           // Only half of the hunger is removed, however
    })

    test("CheckActionStatus resolves 'move' action when colonist x position matches action coordinate x (y is ignored)", () => {
        // Setup test first
        colonistData.clearActions();
        colonistData.resolveAction();
        colonistData.addAction("move", { x: 10, y: 32 });    // Only 2 arguments, type and coords, are needed for move action
        colonistData.startAction(mockInfra);
        // Verify that action is initiated
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 10, y: 32 },
            duration: 0,                // Validate default values for duration and buildingId
            buildingId: 0
        })
        // Verify that action is not resolved when colonist is not at the right x coordinate, even if y coord is matching
        colonistData._x = 9;
        colonistData._y = 32;
        colonistData.checkActionStatus(mockInfra);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 0
        })
        colonistData._x = 10;   // Move the colonist into position and re-check (mess up the y coordinate too, just for show)
        colonistData._y = 99;
        colonistData.checkActionStatus(mockInfra);
        expect(colonistData._currentAction).toBe(null); // Action should now be resolved
    })

    // MOVEMENT-RELATED TESTS

    test("Colonist increases movement progress when moving towards destination", () => {
        // Reset current goal data before proceeding
        colonistData = new ColonistData(1, 0);
        colonistData._currentGoal = "";
        colonistData.updateGoal(mockInfra, mockMap);
        // Tests resume
        colonistData._x = 1;
        colonistData._movementDest = { x: 2, y: 0};
        colonistData._isMoving = true;
        colonistData._movementCost = 10;
        colonistData._movementProg = 0;
        colonistData.handleMovement(mockMap, unevenTerrain);
        expect(colonistData._movementProg).toBe(1);
    })

    test("Colonist starts to walk towards destination when on flat ground, and not already moving", () => {
        colonistData.stopMovement();        // Reset movement from previous test
        colonistData._currentGoal = "explore";
        colonistData._x = 1;
        colonistData._movementDest = { x: 0, y: 0 };
        colonistData._isMoving = false;
        colonistData.handleMovement(mockMap, flatTerrain);
        expect(colonistData._isMoving).toBe(true);
        expect(colonistData._movementType).toBe("walk");
    })

    test("Colonist starts big climb towards destination when it is two above them", () => {
        colonistData.stopMovement();        // Reset movement from previous test
        colonistData._currentGoal = "explore";
        colonistData._x = 1;                // Start away from the edge
        colonistData._y = 0;                // Start the colonist up in the air to test their gravity as well!
        colonistData._movementDest = { x: 4, y: 0 };     // Destination is to the right - current column = 4, dest = 6
        colonistData.startMovement(unevenTerrain);
        expect(colonistData._isMoving).toBe(true);
        expect(colonistData._movementType).toBe("big-climb");
    })

    // This also tests that the colonist goes in the right direction (left vs right)
    test("Colonist starts small drop towards destination when it is one below them", () => {
        colonistData.stopMovement();        // Reset movement from previous test
        colonistData._currentGoal = "explore";
        colonistData._x = 4;                // Start away from the edge
        colonistData._y = 0;                // Start the colonist up in the air to test their gravity as well!
        colonistData._movementDest = { x: 0, y: 0 };     // Destination is to the right - current column = 4, dest = 6
        colonistData.startMovement(unevenTerrain);
        expect(colonistData._isMoving).toBe(true);
        expect(colonistData._movementType).toBe("small-drop");
        expect(colonistData._facing).toBe("left");
    })
});