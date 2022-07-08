import MouseShadowData from "../src/mouseShadowData";

// TEST DATA
const w = 100;      // W and H are in terms of PIXELS for the Mouse Shadow; X and Y aren't used by the constructor
const h = 100;

describe("MouseShadowData", () => {

    const mouseShadowData = new MouseShadowData(w, h);

    test("Defines locked status", () => {
        expect(typeof mouseShadowData._locked).toBe("boolean");
    });

    // Set position
    test("Can set position", () => {
        mouseShadowData.setPosition(100, 100);
        expect(mouseShadowData._x).toBe(100);
        expect(mouseShadowData._x).toBe(100);
    });

    // setWidthAndHeight does not set width and height if no start coords are set
    test("Can adjust height and width to stretch", () => {
        const x1 = 100;
        const y1 = 100;
        // Does nothing if no start coordinates have been selected
        mouseShadowData.setPosition(x1, y1);
        mouseShadowData.setWidthAndHeight(200, 200, false, false);
        expect(mouseShadowData._x).toBe(100);
        expect(mouseShadowData._y).toBe(100);
    });

    // setWidthAndHeight sets height value if x and y with equal, and positive deltas are given (And start coords are set)
    test("Can adjust height and width to stretch down", () => {
        const x = 200;
        const y = 200;
        // Start and stop coords are in terms of grid positions - rather confusing!!
        mouseShadowData._connectorStartCoords = {x: 5, y: 5};
        // Takes effect if start coords have been provided
        mouseShadowData.setWidthAndHeight(x, y, true, true);
        // Should pick y for the update if both x and y have an equal delta
        expect(mouseShadowData._x).toBe(100);
        expect(mouseShadowData._y).toBe(100);
        expect(mouseShadowData._w).toBe(20);
        expect(mouseShadowData._h).toBe(120);   // Expect height to equal the difference between y1 and y2, plus one block
    });

    // setWidthAndHeight sets width value if x > y, and positive deltas are given (And start coords are set)
    test("Can adjust height and width to stretch to the right", () => {
        const x = 200;
        const y = 199;
        // Start and stop coords are in terms of grid positions - rather confusing!!
        mouseShadowData._connectorStartCoords = {x: 5, y: 5};
        // Takes effect if start coords have been provided
        mouseShadowData.setWidthAndHeight(x, y, true, true);
        // Should pick y for the update if both x and y have an equal delta
        expect(mouseShadowData._x).toBe(100);
        expect(mouseShadowData._y).toBe(100);
        expect(mouseShadowData._w).toBe(120);  // Expect width to equal the difference between x1 and x2, plus one block
        expect(mouseShadowData._h).toBe(20);
    });

    // setWidthAndHeight sets width value if x > y, and positive deltas are given (And start coords are set)
    test("Can adjust height and width to stretch upwards", () => {
        const x = 100;
        const y = 0;
        // Start and stop coords are in terms of grid positions - rather confusing!!
        mouseShadowData._connectorStartCoords = {x: 5, y: 5};
        // Takes effect if start coords have been provided
        mouseShadowData.setWidthAndHeight(x, y, true, true);
        // Should pick y for the update if both x and y have an equal delta
        expect(mouseShadowData._x).toBe(100);
        expect(mouseShadowData._y).toBe(0); // Expect y value to decrease if new y < start y (paradoxically, higher on the screen)
        expect(mouseShadowData._w).toBe(20);
        expect(mouseShadowData._h).toBe(120);   // Also expect height to increase whenever delta y is in play
    });

    // setWidthAndHeight sets width value if x > y, and positive deltas are given (And start coords are set)
    test("Can adjust height and width to stretch to the left", () => {
        const x = 0;
        const y = 100;
        // Start and stop coords are in terms of grid positions - rather confusing!!
        mouseShadowData._connectorStartCoords = {x: 5, y: 5};
        // Takes effect if start coords have been provided
        mouseShadowData.setWidthAndHeight(x, y, true, true);
        // Should pick y for the update if both x and y have an equal delta
        expect(mouseShadowData._x).toBe(0); // Expect x value to decrease if new x < start x
        expect(mouseShadowData._y).toBe(100);
        expect(mouseShadowData._w).toBe(120);      // Also expect width to increase whenever delta x is in play
        expect(mouseShadowData._h).toBe(20);
    });

    // Set offset
    test("Can set horizontal offset", () => {
        mouseShadowData.setOffset(100);
        expect(mouseShadowData._xOffset).toBe(100);
    })

    // Set locked (two cases)
    test("Can set to locked or unlocked", () => {
        // Is unlocked by default
        expect(mouseShadowData._locked).toBe(false);
        // Can be set to true
        mouseShadowData.setLocked(true);
        expect(mouseShadowData._locked).toBe(true);
        // Can be set back to false
        mouseShadowData.setLocked(false);
        expect(mouseShadowData._locked).toBe(false);
    })

    test("Can set start coords via locking method", () => {
        // Reset from previous attempts
        mouseShadowData._connectorStartCoords = null;
        expect(mouseShadowData._connectorStartCoords).toBe(null);
        mouseShadowData.setLocked(true, {x: 5, y: 5});
        expect(mouseShadowData._connectorStartCoords).toStrictEqual({x: 5, y: 5});
    })

    // Set Color (two cases)
    test("Can set color based on validity test", () => {
        mouseShadowData.setColor(true);
        expect(mouseShadowData._color).toBe("#0FFF13");
        mouseShadowData.setColor(false);
        expect(mouseShadowData._color).toBe("#D10000");
    })

})