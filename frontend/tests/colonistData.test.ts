import ColonistData, { ColonistAction } from "../src/colonistData";
import Infrastructure from "../src/infrastructure";
import Map from "../src/map";
import Industry from "../src/industry";
import { ModuleInfo } from "../src/server_functions";
import { ConnectorInfo } from "../src/server_functions";

// DUMMY DATA

// Test Module Data
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

// Test Connector Data
const connectorInfo: ConnectorInfo = {
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

// Dummy map data
const flatTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]];

describe("ColonistData", () => {
    // Create test instances
    const colonistData = new ColonistData(9000, "Ziggy", 0, 32);
    const mockInfra = new Infrastructure();
    const mockMap = new Map();
    const indy = new Industry();
    mockMap._mapData = flatTerrain;
    mockMap.updateTopographyAndZones();
    mockInfra._data.setup(mockMap._mapData.length);
    mockInfra.addModule(10, 30, cantinaModuleInfo, mockMap._topography, mockMap._zones, 1001);
    // Provision test module with resources
    mockInfra.addResourcesToModule(1001, [ "water", 1000 ]);
    mockInfra.addResourcesToModule(1001, [ "food", 1000 ]);
    // Heights per column: 3, 4, 6 (max three columns shown)
    const unevenTerrain = [[1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1, 1, 1]];

    // Reset functions
    const resetColonistData = () => {
        colonistData._x = 0;
        colonistData._y = 31;
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        colonistData.stopMovement();
        colonistData.resolveAction();
        colonistData.clearActions();
        colonistData.resolveGoal();
        colonistData._needs = {
            water: 0,
            food: 0, 
            rest: 0
        }
    }

    test("Defines updateNeeds()", () => {
        expect(typeof colonistData.updateNeeds).toBe("function");
    });

    // GOAL-RELATED TESTS

    test("Sets goal to explore", () => {
        colonistData.setGoal("explore", mockInfra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("explore");
    })

    test("Colonist with no goal will set goal to explore when updateGoal is called", () => {
        colonistData._currentGoal = "";
        colonistData.updateGoal(mockInfra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("explore");
    })

    test("Hourly updater method increases colonist needs", () => {
        colonistData.handleHourlyUpdates(mockInfra, mockMap, indy);
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
        colonistData.handleHourlyUpdates(mockInfra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("get-water");
    })

    test("When a 'get' goal has been set, another need passing the threshold will not override it", () => {
        colonistData._needs = {
            water: 0,
            food: 7,
            rest: 0
        };
        colonistData.handleHourlyUpdates(mockInfra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("get-water");
    })

    test("When multiple needs have passed their threshold, the first one to be considered becomes the goal", () => {
        resetColonistData();
        colonistData._needs = {
            water: 5,
            food: 7,
            rest: 20
        };
        colonistData.handleHourlyUpdates(mockInfra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("get-water");
    })

    test("StartGoalProgress will set the first action in a pre-filled action stack to the current action", () => {
        // Setup test conditions
        resetColonistData();
        colonistData.addAction("drink", { x: 10, y: 32 }, 10, 1001);
        colonistData.addAction("move", { x: 10, y: 32 }, 0, 0);
        colonistData.startGoalProgress(mockInfra, indy);
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
        colonistData._needs.food = 7;
        colonistData.checkGoalStatus(mockInfra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("get-food"); // Will be set to get-food since we made the colonist hungry
    })

    // ACTION-RELATED TESTS

    test("AddAction adds an action to the action stack", () => {
        // Clear action stack before commencing test
        resetColonistData();
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
        // Setup test
        colonistData.addAction("eat", { x: 10, y: 32 }, 5, 1001);
        colonistData._x = 10;   // Ensure the colonist is in position to consume resources
        colonistData._y = 31;
        // Start the action before checking the action status
        colonistData.startAction(mockInfra, indy);
        expect(colonistData._actionTimeElapsed).toBe(0);
        colonistData.checkActionStatus(mockInfra, indy, mockMap);
        expect(colonistData._actionTimeElapsed).toBe(1);
    })

    test("CheckActionStatus does not increment the time elapsed value for actions without a duration (duration = 0)", () => {
        // Reset from previous test
        resetColonistData();
        expect(colonistData._actionTimeElapsed).toBe(0);    // Validate reset
        colonistData.addAction("move", { x: 0, y: 0 });
        colonistData.startAction(mockInfra, indy);
        colonistData.checkActionStatus(mockInfra, indy, mockMap);
        expect(colonistData._actionTimeElapsed).toBe(0);    // Validate that time elapsed is still 0
    })

    test("CheckActionStatus resolves 'climb' action when colonist x and y position match action coords", () => {
        resetColonistData();
        colonistData.addAction("climb", { x: 10, y: 32 }, 0, 1001);
        colonistData.startAction(mockInfra, indy);
        // Verify that action is initiated
        expect(colonistData._currentAction).toStrictEqual({
            type: "climb",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 1001
        })
        // Verify that action is not resolved when colonist is not in the exact position
        colonistData._x = 10;
        colonistData._y = 31;
        colonistData.checkActionStatus(mockInfra, indy, mockMap);
        expect(colonistData._currentAction).toStrictEqual({
            type: "climb",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 1001
        })
        colonistData._y = 32;   // Move the colonist into position and re-check
        colonistData.checkActionStatus(mockInfra, indy, mockMap);
        expect(colonistData._currentAction).toBe(null); // Action should now be resolved
    })

    test("CheckActionStatus resolves 'drink' action when colonist actionTimeElapsed value is equal to action duration", () => {
        resetColonistData();
        colonistData._x = 10;   // For action resolve tests, colonist must be standing at the module location to eat or drink
        colonistData.addAction("drink", { x: 10, y: 32 }, 10, 1001);
        colonistData.startAction(mockInfra, indy);
        // Verify that action is initiated
        expect(colonistData._currentAction).toStrictEqual({
            type: "drink",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        })
        // Verify that action is not resolved when colonist has not finished drinking
        colonistData._actionTimeElapsed = 8;
        colonistData.checkActionStatus(mockInfra, indy, mockMap);
        expect(colonistData._currentAction).toStrictEqual({
            type: "drink",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        })
        colonistData._actionTimeElapsed = 10;   // Increase the action time elapsed to equal the duration value
        colonistData.checkActionStatus(mockInfra, indy, mockMap);
        expect(colonistData._currentAction).toBe(null); // Action should now be resolved
    })

    test("CheckActionStatus resolves 'eat' action when colonist actionTimeElapsed value is equal to action duration", () => {
        // PART 1: Action is resolved when, and only when, its condition is met
        resetColonistData();
        colonistData._x = 10;
        colonistData.addAction("eat", { x: 10, y: 32 }, 10, 1001);
        colonistData.startAction(mockInfra, indy);
        // Verify that action is initiated
        expect(colonistData._currentAction).toStrictEqual({
            type: "eat",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        })
        // Verify that action is not resolved when colonist has not finished eating
        colonistData._actionTimeElapsed = 8;
        colonistData.checkActionStatus(mockInfra, indy, mockMap);
        expect(colonistData._currentAction).toStrictEqual({
            type: "eat",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        })
        colonistData._actionTimeElapsed = 10;   // Increase the action time elapsed to equal the duration value
        colonistData.checkActionStatus(mockInfra, indy, mockMap);
        expect(colonistData._currentAction).toBe(null); // Action should now be resolved
        // PART 2: Action is resolved, but Colonist's need is only partially satisfied if target module has insufficient resources
        // Reset test conditions
        colonistData.clearActions();
        colonistData.resolveAction();
        colonistData._needs.food = 10;
        mockInfra._modules[0].deductResource(["food", 10000]);    // Ensure module is empty
        mockInfra._modules[0].addResource(["food", 50]);           // Provision with slightly fewer resources than are needed
        colonistData.addAction("eat", { x: 10, y: 32 }, 10, 1001);
        colonistData.startAction(mockInfra, indy);
        expect(mockInfra._modules[0].getResourceQuantity("food")).toBe(0);    // Colonist takes everything there is to take
        expect(colonistData._currentAction?.duration).toBe(5);      // Reduce duration since it takes less time to eat less food
        // Fast forward to the end of the action
        colonistData._actionTimeElapsed = 4;
        colonistData.checkActionStatus(mockInfra, indy, mockMap);
        expect(colonistData._currentAction).toBe(null);     // Action should resolve itself after a shorter than expected duration
        expect(colonistData._needs.food).toBe(5);           // Only half of the hunger is removed, however
    })

    test("CheckActionStatus resolves 'move' action when colonist x position matches action coordinate x (y is ignored)", () => {
        resetColonistData();
        colonistData.addAction("move", { x: 10, y: 32 });    // Only 2 arguments, type and coords, are needed for move action
        colonistData.startAction(mockInfra, indy);
        // Verify that action is initiated
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 10, y: 32 },
            duration: 0,                // Validate default values for duration and buildingId
            buildingId: 0
        })
        // Verify that action is not resolved when colonist is not at the right x coordinate, even if y coord is matching
        colonistData._x = 9;
        colonistData._y = 31;
        colonistData.checkActionStatus(mockInfra, indy, mockMap);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 0
        })
        colonistData._x = 10;   // Move the colonist into position and re-check (mess up the y coordinate too, just for show)
        colonistData._y = 99;
        colonistData.checkActionStatus(mockInfra, indy, mockMap);
        expect(colonistData._currentAction).toBe(null); // Action should now be resolved
    })

    test("StartAction sets movement destination when current action is 'climb'", () => {
        resetColonistData();
        colonistData._movementDest = { x: 0, y: 0 };
        colonistData.addAction("climb", { x: 10, y: 32 }, 0, 1001);
        expect(colonistData._movementDest).toStrictEqual( { x: 0, y: 0 });   // Setting action does not set movement destination
        colonistData.startAction(mockInfra, indy);
        expect(colonistData._movementDest).toStrictEqual({ x: 10, y: 32 });  // Starting action DOES set movement destination
    })

    test("StartAction sets movement destination when current action is 'move'", () => {
        resetColonistData();
        colonistData._movementDest = { x: 0, y: 0 };
        colonistData.addAction("move", { x: 10, y: 32 }, 0, 1001);
        expect(colonistData._movementDest).toStrictEqual( { x: 0, y: 0 });   // Setting action does not set movement destination
        colonistData.startAction(mockInfra, indy);
        expect(colonistData._movementDest).toStrictEqual({ x: 10, y: 32 });  // Starting action DOES set movement destination
    })

   // Note: StartAction sequence for eat and drink actions are validated indirectly (but thoroughly) in checkActionStatus test

    test("CheckForNextAction will either start the next action or do nothing at all (if there are no more actions)", () => {
        resetColonistData();
        // Check that action stack is empty and that no action is currently set
        expect(colonistData._actionStack.length).toBe(0);
        expect(colonistData._currentAction).toBe(null);
        colonistData._x = 10;
        // Add 2 items to the action stack
        colonistData.addAction("drink", { x: 10, y: 32 }, 10, 1001);
        colonistData.addAction("move", { x: 10, y: 32 }, 0, 1001);
        // Initiate action via checkForNextAction
        colonistData.checkForNextAction(mockInfra, indy);
        // Validate that current action has been popped from the end of the action stack
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 1001
        });
        expect(colonistData._actionStack).toStrictEqual([{
            type: "drink",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        }]);
        // Checking again will start the next action immediately (overwriting the current one)
        colonistData.checkForNextAction(mockInfra, indy);
        expect(colonistData._currentAction).toStrictEqual({
            type: "drink",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        });
        expect(colonistData._actionStack).toStrictEqual([]);
        // Checking with an empty stack will not overwrite the current action (or do anything at all, for that matter)
        colonistData.checkForNextAction(mockInfra, indy);
        expect(colonistData._currentAction).toStrictEqual({
            type: "drink",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        });
        expect(colonistData._actionStack).toStrictEqual([]);
    })

    test("ResolveAction sets current action to null and resets actionTimeElapsed to zero", () => {
        resetColonistData();
        colonistData._currentAction = {
            type: "drink",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        };
        colonistData._actionTimeElapsed = 5;
        colonistData.resolveAction();
        expect(colonistData._currentAction).toBe(null);
        expect(colonistData._actionTimeElapsed).toBe(0);
    })

    test("ClearActions sets action stack to empty array", () => {
        resetColonistData();
        // Setup test with fake actions
        colonistData.addAction("drink", { x: 10, y: 32 }, 10, 1001);
        colonistData.addAction("move", { x: 10, y: 32 }, 0, 1001);
        expect(colonistData._actionStack.length).toBe(2);   // Verify stack is populated first
        colonistData.clearActions();
        expect(colonistData._actionStack.length).toBe(0);
    })

    // MOVEMENT-RELATED TESTS

    test("Colonist increases movement progress when moving towards destination", () => {
        // Reset current goal data before proceeding
        resetColonistData();
        colonistData._currentGoal = "";
        colonistData.updateGoal(mockInfra, mockMap, indy);
        // Tests resume
        colonistData._x = 1;
        colonistData._movementDest = { x: 2, y: 0};
        colonistData._isMoving = true;
        colonistData._movementCost = 10;
        colonistData._movementProg = 0;
        colonistData.handleMovement(mockMap, mockInfra, unevenTerrain);
        expect(colonistData._movementProg).toBe(1);
    })

    test("Colonist starts to walk towards destination when on flat ground, and not already moving", () => {
        colonistData.stopMovement();        // Reset movement from previous test
        colonistData._currentGoal = "explore";
        colonistData._x = 1;
        colonistData._movementDest = { x: 0, y: 0 };
        colonistData._isMoving = false;
        colonistData.handleMovement(mockMap, mockInfra, flatTerrain);
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

    // GOAL ACTION STACK DETERMINATION (PATHFINDING) LOGIC TESTS (THERE ARE SEVERAL INDIVIDUAL CASES)

    // 1 - When module is on the same ground zone as colonist, actions are: move, consume
    test("DetermineActionsForGoal populates action stack with drink, move when module is on same ground zone as colonist", () => {
        // Setup test conditions: Provision module, and ensure Colonist is on the same ground zone as the module
        resetColonistData();
        colonistData._needs.water = 10;
        mockInfra._modules[0].addResource(["water", 1000]);
        colonistData.setGoal("get-water", mockInfra, mockMap, indy);
        // First action added to stack (drink) should be the only item left in the action stack
        expect(colonistData._actionStack).toStrictEqual([{
            type: "drink",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        }])
        // Last action added to stack (move) should be the current action
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 0
        })
    });

    // 2 - When Colonist is on ground and module is on non-ground floor that is connected to the ground via ladder, actions are: move, climb, move, consume
    test("DetermineActionsForGoal populates action stack with drink, move, climb, move when module is on diff floor", () => {
        resetColonistData();
        colonistData._needs.water = 10;
        // Add new module above the existing one, and provision it
        mockInfra.addModule(10, 27, cantinaModuleInfo, mockMap._topography, mockMap._zones, 1002);
        mockInfra.addResourcesToModule(1002, [ "water", 1000 ]);
        // Deprovision the module on the ground floor
        mockInfra._modules[0].deductResource([ "water", 10000 ]);
        // Add a connector that goes from the ground floor to the new module
        mockInfra.addConnector({ x: 11, y: 32 }, { x: 11, y: 28 }, connectorInfo, mockMap, 2001);
        // Run test
        colonistData.setGoal("get-water", mockInfra, mockMap, indy);
        // Current action should be to move to the ladder
        expect(colonistData._actionStack.length).toBe(3);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 11, y: 32 },
            duration: 0,
            buildingId: 0
        })
        // Action stack contains remaining actions in reverse order of execution (drink, move, climb)
        expect(colonistData._actionStack).toStrictEqual([
            {
                type: "drink",
                coords: { x: 10, y: 29 },
                duration: 10,
                buildingId: 1002
            },
            {
                type: "move",
                coords: { x: 10, y: 29 },
                duration: 0,
                buildingId: 0
            },
            {
                type: "climb",
                coords: { x: 11, y: 28 },   // NOTE: Climb action takes into account the Colonist's HEAD level, not FOOT level
                duration: 0,
                buildingId: 2001
            }
        ])
    })

    // 3 - When Colonist is on ground and module is on non-ground floor, and module has same x coordinate as connector, actions are: move, climb, consume (no need to move after finishing the climb action when the colonist is right there)
    test("DAFG populates stack with drink, climb, move, when module on different floor with same x coordinate as ladder", () => {
        resetColonistData();
        colonistData._needs.water = 10;
        // Using the same module as the previous test, add a connector that connects from the ground AND has the same x coordinate
        mockInfra._connectors = []; // Clear out existing connectors first
        mockInfra._data._elevators = [];
        mockInfra.addConnector({ x: 10, y: 32 }, { x: 10, y: 28 }, connectorInfo, mockMap, 2002);
        // Run test
        colonistData.setGoal("get-water", mockInfra, mockMap, indy);
        // Current action should be to move to the ladder
        expect(colonistData._actionStack.length).toBe(2);   // Only 2 items should remain in the action stack
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 0
        })
        // Action stack contains remaining 2 actions in reverse order of execution (drink, climb)
        expect(colonistData._actionStack).toStrictEqual([
            {
                type: "drink",
                coords: { x: 10, y: 29 },
                duration: 10,
                buildingId: 1002
            },
            {
                type: "climb",
                coords: { x: 10, y: 28 },   // NOTE: Climb action takes into account the Colonist's HEAD level, not FOOT level
                duration: 0,
                buildingId: 2002
            }
        ])
    })

    // 4 - When Colonist is on the same surface as the target module, and is on the same x coordinate, the only action added to the stack is the consume action (i.e. if you're already there to drink, you don't have to move in order to eat)
    test("DAFG populates stack with only 'drink' if colonist is on same surface and in same position as resource module", () => {
        resetColonistData();
        colonistData._needs.water = 10;
        // Re-provision ground floor module
        mockInfra.addResourcesToModule(1001, ["water", 1000]);
        // Place the colonist in the same position as the resource module they will get the water from
        colonistData._x = 10;
        colonistData._y = 31;
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        // Run test
        colonistData.setGoal("get-water", mockInfra, mockMap, indy);
        // Since no move action is required the colonist should just begin the drink action immediately
        expect(colonistData._currentAction).toStrictEqual({
            type: "drink",
            coords: { x: 10, y: 32 },
            duration: 10,
            buildingId: 1001
        })
        expect(colonistData._actionStack.length).toBe(0);   // No items should be left in the stack; only the current action
    })

    // 5 - Colonist is on non-ground floor and wants to resume exploring the surface, actions are: move, climb, move (to explore goal)
    test("Explore goal will lead to action stack: [move?, climb, move] if colonist is on non-ground floor", () => {
        resetColonistData();
        // Place colonist on the 2nd floor of the base
        colonistData._x = 12;
        colonistData._y = 28;
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        // Set goal
        colonistData.setGoal("explore", mockInfra, mockMap, indy);
        // Since the explore goal determines a random point, just check the current action, stack length, and climb action
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 10, y: 28 },
            duration: 0,
            buildingId: 0
        });
        expect(colonistData._actionStack.length).toBe(2);
        expect(colonistData._actionStack[1]).toStrictEqual({
            type: "climb",
            coords: { x: 10, y: 31 },
            duration: 0,
            buildingId: 2002
        })
    })

    // 6 - Colonist is on non-ground floor and module is on another non-ground floor. Actions are: consume, move, climb, move
    test("DetermineActionsForGoal populates action stack with drink, move, climb, move when module is on diff floor", () => {
        resetColonistData();
        // Place colonist on the 2nd floor of the base
        colonistData._x = 12;
        colonistData._y = 28;
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        colonistData._needs.water = 10;
        // Add new module above the existing ones (on the 3rd floor), and provision it, then deprovision other modules
        mockInfra.addModule(10, 24, cantinaModuleInfo, mockMap._topography, mockMap._zones, 1003);
        mockInfra.addResourcesToModule(1003, [ "water", 1000 ]);
        mockInfra._modules[0].deductResource([ "water", 10000 ]);
        mockInfra._modules[1].deductResource([ "water", 10000 ]);
        // Add a connector that goes from the 2nd floor to the 3rd
        mockInfra.addConnector({ x: 13, y: 32 }, { x: 13, y: 24 }, connectorInfo, mockMap, 2003);
        // Run test: colonist should move to the ladder and then climb it to the 3rd floor
        colonistData.setGoal("get-water", mockInfra, mockMap, indy);
        // Current action should be to move to the ladder
        expect(colonistData._actionStack.length).toBe(3);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 13, y: 29 },
            duration: 0,
            buildingId: 0
        })
        // Action stack contains remaining actions in reverse order of execution (drink, move, climb)
        expect(colonistData._actionStack).toStrictEqual([
            {
                type: "drink",
                coords: { x: 10, y: 26 },
                duration: 10,
                buildingId: 1003
            },
            {
                type: "move",
                coords: { x: 10, y: 26 },
                duration: 0,
                buildingId: 0
            },
            {
                type: "climb",
                coords: { x: 13, y: 25 },   // NOTE: Climb action takes into account the Colonist's HEAD level, not FOOT level
                duration: 0,
                buildingId: 2003
            }
        ])
    })

    // 7 - If no action stack is returned for a get-(need) determination, colonist should ignore that need for the next hour
    test("Colonist ignores unavailable resource when action stack determination output is empty", () => {
        resetColonistData();
        // Make the colonist thirsty...
        colonistData._needs.water = 10;
        // ... But deprovision water modules so that they cannot slake their thirst
        mockInfra._modules[2].deductResource([ "water", 10000 ]);
        // Tell colonist to fetch water when there isn't any
        colonistData.setGoal("get-water", mockInfra, mockMap, indy);
        expect(colonistData._actionStack.length).toBe(0);
        expect(colonistData._needsAvailable.water).toBe(0);
        // Also, check that the availability is reset to 1 after the hourly update
        colonistData.handleHourlyUpdates(mockInfra, mockMap, indy);
        expect(colonistData._needsAvailable.water).toBe(1);
    })

    // 8 - If the colonist is assigned to work at a module, they can get there if both are on the ground
    test("Action Determination for production jobs works when colonist is on same zone as production site", () => {
        resetColonistData();
        // Colonist is on the ground
        colonistData._x = 3;
        colonistData._y = 31;   // Head is one above (lower integer) the feet, which are one higher than the topography value
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        // Add new production module
        mockInfra.addModule(5, 30, prodModInfo, mockMap._topography, mockMap._zones, 1004);
        const job: ColonistAction = { type: "farm", coords: { x: 6, y: 30 }, duration: 30, buildingId: 1004 };
        colonistData.setGoal("farm", mockInfra, mockMap, indy, job);
        expect(colonistData._actionStack.length).toBe(1);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 6, y: 30 },
            duration: 0,
            buildingId: 0
        });
        expect(colonistData._actionStack).toStrictEqual([{ type: "farm", coords: { x: 6, y: 30 }, duration: 30, buildingId: 1004 }])
    })

    // 9 - If the colonist is assigned to work at a module, they can get there if it is on another floor (and is connected)
    test("Action Determination for production jobs works when colonist is on same zone as production site", () => {
        resetColonistData();
        // Colonist is on the ground
        colonistData._x = 3;
        colonistData._y = 31;   // Head is one above (lower integer) the feet, which are one higher than the topography value
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        // Add new production module
        mockInfra.addModule(5, 27, prodModInfo, mockMap._topography, mockMap._zones, 1005);
        // Create job data
        const job: ColonistAction = { type: "farm", coords: { x: 6, y: 27 }, duration: 30, buildingId: 1005 };
        // Test without a ladder first: The stack should come back empty, resulting in the job being skipped
        colonistData.setGoal("farm", mockInfra, mockMap, indy, job);
        expect(colonistData._actionStack.length).toBe(0);
        expect(colonistData._currentAction).toBe(null);
        resetColonistData();
        // Add a ladder
        mockInfra.addConnector({ x: 5, y: 32 }, { x: 5, y: 24 }, connectorInfo, mockMap, 2004);
        // Set Goal again for test WITH a ladder
        colonistData.setGoal("farm", mockInfra, mockMap, indy, job);
        // Expect results: Current action is to walk to the ladder, and 3 other actions are: climb, move, produce (farm)
        expect(colonistData._actionStack.length).toBe(3);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 5, y: 32 },
            duration: 0,
            buildingId: 0
        });
        expect(colonistData._actionStack).toStrictEqual([
            {
                type: "farm",
                coords: { x: 6, y: 27 },
                duration: 30,
                buildingId: 1005
            },
            {
                type: "move",
                coords: { x: 6, y: 27 },
                duration: 0,
                buildingId: 0
            },
            {
                type: "climb",
                coords: { x: 5, y: 28 },   // NOTE: Climb action takes into account the Colonist's HEAD level, not FOOT level
                duration: 0,
                buildingId: 2004
            }
        ])
    })

    // 10 - If the colonist needs rest, they can find a path to the nearest crew quarters, even if it is up a ladder
    test("Action Determination for get-rest finds path to nearest Sleeping Quarters", () => {
        resetColonistData();
        // Colonist is on the ground
        colonistData._x = 2;
        colonistData._y = 31;   // Head is one above (lower integer) the feet, which are one higher than the topography value
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        // Add new crew quarters module to second floor
        mockInfra.addModule(9, 27, crewModuleData, mockMap._topography, mockMap._zones, 1006);
        // Make Colonist tired
        colonistData._needs.rest = 16;
        // Validate test conditions
        expect(colonistData._actionStack.length).toBe(0);
        expect(colonistData._currentAction).toBe(null);
        // Initiate test: Colonist determines they need rest and forms a plan to get to the Crew Quarters
        colonistData.handleHourlyUpdates(mockInfra, mockMap, indy);
        // Expect results: Current action is to walk to the ladder, and 3 other actions are: climb, move, produce (farm)
        expect(colonistData._actionStack.length).toBe(2);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 0
        });
        expect(colonistData._actionStack).toStrictEqual([
            {
                type: "rest",
                coords: { x: 10, y: 29 },
                duration: 480,
                buildingId: 1006
            },
            {
                type: "climb",
                coords: { x: 10, y: 28 },
                duration: 0,
                buildingId: 2002
            }
        ])
    })

    // 11 - This tests if the colonist can get down from a non-ground floor to find a resource module that's on the ground, even when it's not connected to the colonist's floor directly via a ladder
    test("Colonist can find their way to a module on the surface from a non-ground floor for consume or rest action", () => {
        // Use new buildings: a cantina on its own, and two storage rooms in a stack, with the colonist on top and of course a ladder to reach the upper floor
        const infra = new Infrastructure();
        infra._data.setup(mockMap._mapData.length);
        infra.addModule(0, 30, cantinaModuleInfo, mockMap._topography, mockMap._zones, 1001);
        infra.addModule(10, 30, storageModuleInfo, mockMap._topography, mockMap._zones, 1002);
        infra.addModule(10, 27, storageModuleInfo, mockMap._topography, mockMap._zones, 1003);
        infra.addConnector({ x: 11, y: 32 }, { x: 11, y: 27 }, connectorInfo, mockMap, 2001);
        // Provision the lone cantina
        infra.addResourcesToModule(1001, ["water", 1000]);
        resetColonistData();
        // Colonist is on the second floor
        colonistData._x = 10;
        colonistData._y = 28;   // Head is one above (lower integer) the feet, which are one higher than the topography value
        colonistData.detectTerrainBeneath(mockMap, infra);
        // Validate that colonist stands on the second floor
        expect(colonistData._standingOnId).toBe(1006);
        // Make Colonist thirsty
        colonistData._needs.water = 16;
        // Validate test conditions
        expect(colonistData._actionStack.length).toBe(0);
        expect(colonistData._currentAction).toBe(null);
        // Initiate test: Colonist determines they need to get a drink and forms a plan to get down to the cantina
        colonistData.handleHourlyUpdates(infra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("get-water");
        // Expect results: Current action is to walk to the ladder, and 3 other actions are: climb, move, drink
        expect(colonistData._actionStack.length).toBe(3);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 11, y: 29 },
            duration: 0,
            buildingId: 0
        });
        expect(colonistData._actionStack).toStrictEqual([
            {
                type: "drink",
                coords: { x: 0, y: 32 },
                duration: 17,           // Duration is one higher than the initial spec since it grew with the hourly update!
                buildingId: 1001
            },
            {
                type: "move",
                coords: { x: 0, y: 32 },
                duration: 0,
                buildingId: 0
            },
            {
                type: "climb",
                coords: { x: 11, y: 31 },
                duration: 0,
                buildingId: 2001
            }
        ])
    })

    // 12 - If no action is found for the current goal, colonist will attempt to get to the nearest ground zone
    test("Colonist will go to ground if no action stack is made for consume/rest/production goal", () => {
        // Use new buildings: two cantinas, with provisions only on the upper floor, and two storage rooms in a stack, with the colonist on top and of course a ladder to reach the upper floor
        const infra = new Infrastructure();
        infra._data.setup(mockMap._mapData.length);
        infra.addModule(0, 30, cantinaModuleInfo, mockMap._topography, mockMap._zones, 1001);
        infra.addModule(0, 27, cantinaModuleInfo, mockMap._topography, mockMap._zones, 1002);
        infra.addModule(10, 30, storageModuleInfo, mockMap._topography, mockMap._zones, 1003);
        infra.addModule(10, 27, storageModuleInfo, mockMap._topography, mockMap._zones, 1004);
        infra.addConnector({ x: 1, y: 32 }, { x: 1, y: 27 }, connectorInfo, mockMap, 2001);
        infra.addConnector({ x: 11, y: 32 }, { x: 11, y: 27 }, connectorInfo, mockMap, 2002);
        // Provision the lone cantina
        infra.addResourcesToModule(1002, ["water", 1000]);
        resetColonistData();
        // Colonist is on the second floor, in the storage module block (not at all connected with the cantina modules)
        colonistData._x = 10;
        colonistData._y = 28;   // Head is one above (lower integer) the feet, which are one higher than the topography value
        colonistData.detectTerrainBeneath(mockMap, infra);
        // Validate that colonist stands on the second floor
        expect(colonistData._standingOnId).toBe(1008);
        // Make Colonist thirsty
        colonistData._needs.water = 16;
        // Validate test conditions
        expect(colonistData._actionStack.length).toBe(0);
        expect(colonistData._currentAction).toBe(null);
        // Initiate test: Colonist determines that cantina is inaccessible; takes the ladder to the ground instead
        colonistData.handleHourlyUpdates(infra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("get-water");
        // Expect results: Current action is to walk to the ladder, and action stack contains a single climb action
        expect(colonistData._actionStack.length).toBe(1);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 11, y: 29 },
            duration: 0,
            buildingId: 0
        });
        expect(colonistData._actionStack).toStrictEqual([
            {
                type: "climb",
                coords: { x: 11, y: 31 },
                duration: 0,
                buildingId: 2002
            }
        ]);
        // Follow-up test: Colonist can then do another update and find the way to the resource
        // Setup: transport the colonist to their destination at the bottom of the ladder
        colonistData.resolveGoal();
        colonistData._x = 11;
        colonistData._y = 31;
        colonistData.detectTerrainBeneath(mockMap, infra);
        colonistData.handleHourlyUpdates(infra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("get-water");
        // Expect results: Current action is to walk to the ladder, and action stack contains a single climb action
        // expect(colonistData._actionStack.length).toBe(3);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 1, y: 32 },
            duration: 0,
            buildingId: 0
        });
        expect(colonistData._actionStack).toStrictEqual([
            {
                type: "drink",
                coords: { x: 0, y: 29 },
                duration: 18,           // Duration is now two higher than initial spec since there have been 2 hourly updates
                buildingId: 1002
            },
            {
                type: "move",
                coords: { x: 0, y: 29 },
                duration: 0,
                buildingId: 0
            },
            {
                type: "climb",
                coords: { x: 1, y: 28 },
                duration: 0,
                buildingId: 2001
            }
        ]);
    })

    // 13 - Given the choice between multiple sleeping modules, colonist will always choose to go to the closest one
    test("Colonist get-rest goal will prioritize the nearest available crew quarters when several are available", () => {
        // Reset colonist location
        resetColonistData();
        colonistData._x = 0;
        colonistData._y = 31;
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        const infra = new Infrastructure();
        infra._data.setup(mockMap._mapData.length);
        // Add several modules to choose from, starting with the farthest from the colonist's position
        infra.addModule(10, 30, crewModuleData, mockMap._topography, mockMap._zones, 1001);
        infra.addModule(6, 30, crewModuleData, mockMap._topography, mockMap._zones, 1002);
        infra.addModule(2, 30, crewModuleData, mockMap._topography, mockMap._zones, 1003);
        // Make Colonist tired
        colonistData._needs.rest = 16;
        // Validate test conditions
        expect(colonistData._actionStack.length).toBe(0);
        expect(colonistData._currentAction).toBe(null);
        // Initiate test: Colonist determines route to nearest crew quarters, ignoring the more distant ones (even though they appear first in the list of available modules)
        colonistData.handleHourlyUpdates(infra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("get-rest");
        // Expect results: Current action is to walk to the nearest module (whose ID is 1003, not 1001)
        expect(colonistData._actionStack.length).toBe(1);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 3, y: 32 },
            duration: 0,
            buildingId: 0
        });
        expect(colonistData._actionStack[0].buildingId).toBe(1003);
        // Reset colonist location to try again from the opposite side of the base
        resetColonistData();
        colonistData._x = 15;
        colonistData._y = 31;
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        // Make Colonist tired
        colonistData._needs.rest = 16;
        // Validate test conditions
        expect(colonistData._actionStack.length).toBe(0);
        expect(colonistData._currentAction).toBe(null);
        // Initiate test: Colonist determines route to nearest crew quarters
        colonistData.handleHourlyUpdates(infra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("get-rest");
        // Expect results: Current action is to walk to the nearest module (whose ID is 1001 this time)
        expect(colonistData._actionStack.length).toBe(1);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 11, y: 32 },
            duration: 0,
            buildingId: 0
        });
        expect(colonistData._actionStack[0].buildingId).toBe(1001);
    })

    // 13 - Module proximity is factored in for Cantina modules too
    test("Colonist get-food / get-water goals prioritize the nearest available cantina when several are available", () => {
        // Reset colonist location
        resetColonistData();
        colonistData._x = 0;
        colonistData._y = 31;
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        const infra = new Infrastructure();
        infra._data.setup(mockMap._mapData.length);
        // Add several modules to choose from, starting with the farthest from the colonist's position
        infra.addModule(10, 30, cantinaModuleInfo, mockMap._topography, mockMap._zones, 1001);
        infra.addModule(6, 30, cantinaModuleInfo, mockMap._topography, mockMap._zones, 1002);
        infra.addModule(2, 30, cantinaModuleInfo, mockMap._topography, mockMap._zones, 1003);
        // Provision modules
        infra.addResourcesToModule(1001, ["food", 1000]);
        infra.addResourcesToModule(1002, ["food", 1000]);
        infra.addResourcesToModule(1003, ["food", 1000]);
        // Make Colonist hungry
        colonistData._needs.food = 16;
        // Validate test conditions
        expect(colonistData._actionStack.length).toBe(0);
        expect(colonistData._currentAction).toBe(null);
        // Initiate test: Colonist determines route to nearest cantina, ignoring the more distant ones (even though they appear first in the list of available modules)
        colonistData.handleHourlyUpdates(infra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("get-food");
        // Expect results: Current action is to walk to the nearest module (whose ID is 1003, not 1001)
        expect(colonistData._actionStack.length).toBe(1);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 2, y: 32 },
            duration: 0,
            buildingId: 0
        });
        expect(colonistData._actionStack[0].buildingId).toBe(1003);
        // Reset colonist location to try again from the opposite side of the base
        resetColonistData();
        colonistData._x = 15;
        colonistData._y = 31;
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        // Make Colonist tired
        colonistData._needs.food = 16;
        // Validate test conditions
        expect(colonistData._actionStack.length).toBe(0);
        expect(colonistData._currentAction).toBe(null);
        // Initiate test: Colonist determines route to nearest cantina
        colonistData.handleHourlyUpdates(infra, mockMap, indy);
        expect(colonistData._currentGoal).toBe("get-food");
        // Expect results: Current action is to walk to the nearest module (whose ID is 1001 this time)
        expect(colonistData._actionStack.length).toBe(1);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 10, y: 32 },
            duration: 0,
            buildingId: 0
        });
        expect(colonistData._actionStack[0].buildingId).toBe(1001);
    })

    // TODO: Test updatePosition method!!!

    test("Can detect when the colonist is standing on a floor vs on a map zone", () => {
        resetColonistData();
        // Colonist is on the ground
        colonistData._x = 3;
        colonistData._y = 31;   // Head is one above (lower integer) the feet, which are one higher than the topography value
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        expect(colonistData._standingOnId).toBe("0033");
        // Colonist is on 2nd floor
        colonistData._x = 10;
        colonistData._y = 28;
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        expect(colonistData._standingOnId).toBe(1004);
    })

    test("Will end the current action if an attempt is made to punch into an already-full module", () => {
        resetColonistData();
        // Colonist is on the ground
        colonistData._x = 3;
        colonistData._y = 31;   // Head is one above (lower integer) the feet, which are one higher than the topography value
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        colonistData._currentAction = {
            type: "farm",
            coords: { x: 6, y: 27 },
            duration: 30,
            buildingId: 1005
        };
        mockInfra._modules[5].punchIn(9999);                // Add a fake punch-in to the production module to make it 'full'
        colonistData.enterModule(mockInfra);                // Try to punch in
        expect(colonistData._currentAction).toBe(null);     // It should cancel the current action
    })

    test("Consume action fails if a module is full to capacity/is not maintained (colonist cannot enter)", () => {
        resetColonistData();
        colonistData._x = 0;
        colonistData._y = 31;
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        mockInfra._modules[0].punchIn(9998);
        mockInfra._modules[0].punchIn(9999);  // Fill the module to capacity
        colonistData._currentAction = {
            type: "drink",
            coords: { x: 0, y: 32 },
            duration: 17,
            buildingId: 1001
        };
        colonistData.consume("water", mockInfra);
        expect(colonistData._currentAction).toBe(null);
        // Reset and try again with unmaintained module
        mockInfra._modules[0].punchOut(9998);
        mockInfra._modules[0].punchOut(9999);  // Empty the module (free up slots)
        mockInfra._modules[0]._isMaintained = false; // Set maintenance to false, then reset action
        colonistData._currentAction = {
            type: "drink",
            coords: { x: 0, y: 32 },
            duration: 17,
            buildingId: 1001
        };
        colonistData.consume("water", mockInfra);
        expect(colonistData._currentAction).toBe(null);
    })

    test("When resolved, mining action produces water in quantity dictated by the mined tile's block type", () => {
        resetColonistData();
        colonistData._x = 0;
        colonistData._y = 31;
        colonistData.detectTerrainBeneath(mockMap, mockInfra);
        // Reset map with new terrain, consisting of various block types at the surface
        const waterMap = new Map();
        // Dummy map data
        const variedTerrain = [[1, 1, 1], [1, 1, 3], [1, 1, 7], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]];
        waterMap.setup(variedTerrain);
        expect(waterMap._columns[0][2]._blockData.name).toBe("Rock");
        expect(waterMap._columns[1][2]._blockData.name).toBe("Clear Ice");
        expect(waterMap._columns[2][2]._blockData.name).toBe("Frozen Mud");    // Validate test setup
        // Dummy storage module
        const inf = new Infrastructure();
        inf.setup(waterMap._mapData.length);
        inf.addModule(4, 30, storageModuleInfo, waterMap._topography, waterMap._zones);
        expect(inf._modules[0]._resources[2][0]).toBe("water");
        expect(inf._modules[0]._resources[2][1]).toBe(0);
        // Test 1: Mining ice yields 10 water
        colonistData._currentAction = {
            type: "mine",
            duration: 25,
            buildingId: 0,
            coords: { x: 1, y: 33 }
        };
        colonistData._actionTimeElapsed = 25;
        colonistData.checkActionStatus(inf, indy, waterMap);
        expect(inf._modules[0]._resources[2][1]).toBe(10);
        // Test 2: Mining frozen mud yields 4 water
        colonistData._currentAction = {
            type: "mine",
            duration: 25,
            buildingId: 0,
            coords: { x: 2, y: 33 }
        };
        colonistData._actionTimeElapsed = 25;
        colonistData.checkActionStatus(inf, indy, waterMap);
        expect(inf._modules[0]._resources[2][1]).toBe(14);  // 4 + 10 from the first time (I'm too lazy to clean it up)
        // Test 3: Mining rock yields zero water!
        colonistData._currentAction = {
            type: "mine",
            duration: 25,
            buildingId: 0,
            coords: { x: 3, y: 33 }
        };
        colonistData._actionTimeElapsed = 25;
        colonistData.checkActionStatus(inf, indy, waterMap);
        expect(inf._modules[0]._resources[2][1]).toBe(14);  // Unchanged since the previous test)
    })
    
});