import Floor from "../src/floor";

const id = 1000;
const elev = 10;

const footprint = [1, 2, 3];
const disorderedFootprint = [7, 4, 6, 5];

describe("Floor Tests", () => {
    const floor = new Floor(id, elev);

    test("Defines elevation", () => {
        expect(typeof floor._elevation).toBe("number");
    })

    // Given a particular footprint, the floor should be able to update its left and right edge values
    test("Can update footprint", () => {
        floor.updateFootprint(footprint);
        expect(floor._leftSide).toBe(1);
        expect(floor._rightSide).toBe(3);
        // Should also work even if given an unordered list as a footprint (so long as the numbers are valid)
        floor.updateFootprint(disorderedFootprint);
        expect(floor._leftSide).toBe(1);
        expect(floor._rightSide).toBe(7);
    })

    // Given a new module's footprint, the floor should be able to say if it is adjacent or not
    test("Can check for adjacency", () => {
        // Standardize left/right edges, to isolate this test from previous ones:
        floor._leftSide = 2;
        floor._rightSide = 7;
        // Adjacent to the left of current footprint
        expect(floor.checkIfAdjacent([1])).toStrictEqual([true, "Adjacent: Left"]);
        // Overlaps the current footprint
        expect(floor.checkIfAdjacent([0, 1, 2])).toStrictEqual([false, "ERROR: Overlap detected"]);
        // Adjacent to the right
        expect(floor.checkIfAdjacent([8, 9, 10])).toStrictEqual([true, "Adjacent: Right"]);
        // Disordered list but still adjacent
        expect(floor.checkIfAdjacent([10, 8, 9])).toStrictEqual([true, "Adjacent: Right"]);
        // Too far to the right
        expect(floor.checkIfAdjacent([9, 10, 11])).toStrictEqual([false, "Too far right"]);
        // Too far to the left
        expect(floor.checkIfAdjacent([0])).toStrictEqual([false, "Too far left"]);
    })
})