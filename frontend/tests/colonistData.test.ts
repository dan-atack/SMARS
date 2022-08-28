import ColonistData from "../src/colonistData";
import Infrastructure from "../src/infrastructure";
jest.mock("../src/infrastructure");

describe("ColonistData", () => {
    const colonistData = new ColonistData(1, 0);
    const mockInfra = new Infrastructure();

    const flatTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
    // Heights per column: 3, 4, 6 (max three columns shown)
    const unevenTerrain = [[1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1, 1, 1]];

    test("Defines updateNeeds()", () => {
        expect(typeof colonistData.updateNeeds).toBe("function");
    });

    test("Sets goal to explore", () => {
        colonistData.setGoal("explore");
        expect(colonistData._currentGoal).toBe("explore");
    })

    test("Colonist with no goal will set goal to explore when updateGoal is called", () => {
        colonistData._currentGoal = "";
        colonistData.updateGoal(3, mockInfra);
        expect(colonistData._currentGoal).toBe("explore");
    })

    test("Colonist increases movement progress when moving towards destination", () => {
        colonistData._currentGoal = "explore";
        colonistData._x = 1;
        colonistData._movementDest = 2;
        colonistData._isMoving = true;
        colonistData._movementCost = 10;
        colonistData._movementProg = 0;
        colonistData.checkGoalStatus(flatTerrain, 3, mockInfra);
        expect(colonistData._movementProg).toBe(1);
    })

    test("Colonist starts to walk towards destination when on flat ground, and not already moving", () => {
        colonistData.stopMovement();        // Reset movement from previous test
        colonistData._currentGoal = "explore";
        colonistData._x = 1;
        colonistData._movementDest = 0;
        colonistData._isMoving = false;
        colonistData.checkGoalStatus(flatTerrain, 3, mockInfra);
        expect(colonistData._isMoving).toBe(true);
        expect(colonistData._movementType).toBe("walk");
        expect(colonistData._y).toBe(31);       // y = 31 when the current column has 3 blocks
    })

    test("Colonist starts to big climb towards destination when it is two above them", () => {
        colonistData.stopMovement();        // Reset movement from previous test
        colonistData._currentGoal = "explore";
        colonistData._x = 1;                // Start away from the edge
        colonistData._y = 0;                // Start the colonist up in the air to test their gravity as well!
        colonistData._movementDest = 4;     // Destination is to the right - current column = 4, dest = 6
        colonistData.checkGoalStatus(unevenTerrain, 5, mockInfra);
        expect(colonistData._isMoving).toBe(true);
        expect(colonistData._y).toBe(30);   // Column is 4 blocks tall
        expect(colonistData._movementType).toBe("big-climb");
    })

    // This also tests that the colonist goes in the right direction (left vs right)
    test("Colonist starts to small drop towards destination when it is one below them", () => {
        colonistData.stopMovement();        // Reset movement from previous test
        colonistData._currentGoal = "explore";
        colonistData._x = 4;                // Start away from the edge
        colonistData._y = 0;                // Start the colonist up in the air to test their gravity as well!
        colonistData._movementDest = 0;     // Destination is to the right - current column = 4, dest = 6
        colonistData.checkGoalStatus(unevenTerrain, 5, mockInfra);
        expect(colonistData._isMoving).toBe(true);
        expect(colonistData._movementType).toBe("small-drop");
        expect(colonistData._facing).toBe("left");
    })
});