import ColonistData from "../src/colonistData";
import Infrastructure from "../src/infrastructure";
import Map from "../src/map";

describe("ColonistData", () => {
    let colonistData = new ColonistData(1, 0);
    const mockInfra = new Infrastructure();
    const mockMap = new Map();

    const flatTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
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
        colonistData.startGoalProgress(mockInfra);
        expect(colonistData._currentAction).toStrictEqual({
            type: "move",
            coords: { x: 0, y: 0 },
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