import MouseShadow from "../src/mouseShadow";

// TEST DATA
const w = 100;      // W and H are in terms of PIXELS for the Mouse Shadow; X and Y aren't used by the constructor
const h = 100;

describe("mouseShadow", () => {

    const mouseShadow = new MouseShadow(w, h);

    test("Defines setPosition", () => {
        expect(typeof mouseShadow.setPosition).toBe("function");
    })

    test("Defines locked status", () => {
        expect(typeof mouseShadow._locked).toBe("boolean");
    });

    // Set position
    test("Can set position", () => {
        mouseShadow.setPosition(100, 100);
        expect(mouseShadow._x).toBe(100);
        expect(mouseShadow._x).toBe(100);
    });

    // setWidthAndHeight does not set width and height if no start coords are set
    test("Can adjust height and width to stretch", () => {
        const x1 = 100;
        const y1 = 100;
        // Does nothing if no start coordinates have been selected
        mouseShadow.setPosition(x1, y1);
        mouseShadow.setWidthAndHeight(200, 200, false, false);
        expect(mouseShadow._x).toBe(100);
        expect(mouseShadow._y).toBe(100);
    });

    // setWidthAndHeight sets height value if x and y with equal, and positive deltas are given (And start coords are set)
    test("Can adjust height and width to stretch down", () => {
        const x = 200;
        const y = 200;
        // Start and stop coords are in terms of grid positions - rather confusing!!
        mouseShadow._connectorStartCoords = {x: 5, y: 5};
        // Takes effect if start coords have been provided
        mouseShadow.setWidthAndHeight(x, y, true, true);
        // Should pick y for the update if both x and y have an equal delta
        expect(mouseShadow._x).toBe(100);
        expect(mouseShadow._y).toBe(100);
        expect(mouseShadow._w).toBe(20);
        expect(mouseShadow._h).toBe(120);   // Expect height to equal the difference between y1 and y2, plus one block
    });

    // setWidthAndHeight sets width value if x > y, and positive deltas are given (And start coords are set)
    test("Can adjust height and width to stretch to the right", () => {
        const x = 200;
        const y = 199;
        // Start and stop coords are in terms of grid positions - rather confusing!!
        mouseShadow._connectorStartCoords = {x: 5, y: 5};
        // Takes effect if start coords have been provided
        mouseShadow.setWidthAndHeight(x, y, true, true);
        // Should pick y for the update if both x and y have an equal delta
        expect(mouseShadow._x).toBe(100);
        expect(mouseShadow._y).toBe(100);
        expect(mouseShadow._w).toBe(120);  // Expect width to equal the difference between x1 and x2, plus one block
        expect(mouseShadow._h).toBe(20);
    });

    // setWidthAndHeight sets width value if x > y, and positive deltas are given (And start coords are set)
    test("Can adjust height and width to stretch upwards", () => {
        const x = 100;
        const y = 0;
        // Start and stop coords are in terms of grid positions - rather confusing!!
        mouseShadow._connectorStartCoords = {x: 5, y: 5};
        // Takes effect if start coords have been provided
        mouseShadow.setWidthAndHeight(x, y, true, true);
        // Should pick y for the update if both x and y have an equal delta
        expect(mouseShadow._x).toBe(100);
        expect(mouseShadow._y).toBe(0); // Expect y value to decrease if new y < start y (paradoxically, higher on the screen)
        expect(mouseShadow._w).toBe(20);
        expect(mouseShadow._h).toBe(120);   // Also expect height to increase whenever delta y is in play
    });

    // setWidthAndHeight sets width value if x > y, and positive deltas are given (And start coords are set)
    test("Can adjust height and width to stretch to the left", () => {
        const x = 0;
        const y = 100;
        // Start and stop coords are in terms of grid positions - rather confusing!!
        mouseShadow._connectorStartCoords = {x: 5, y: 5};
        // Takes effect if start coords have been provided
        mouseShadow.setWidthAndHeight(x, y, true, true);
        // Should pick y for the update if both x and y have an equal delta
        expect(mouseShadow._x).toBe(0); // Expect x value to decrease if new x < start x
        expect(mouseShadow._y).toBe(100);
        expect(mouseShadow._w).toBe(120);      // Also expect width to increase whenever delta x is in play
        expect(mouseShadow._h).toBe(20);
    });

    // Set offset
    test("Can set horizontal offset", () => {
        mouseShadow.setOffset(100);
        expect(mouseShadow._xOffset).toBe(100);
    })

    // Set locked (two cases)
    test("Can set to locked or unlocked", () => {
        // Is unlocked by default
        expect(mouseShadow._locked).toBe(false);
        // Can be set to true
        mouseShadow.setLocked(true);
        expect(mouseShadow._locked).toBe(true);
        // Can be set back to false
        mouseShadow.setLocked(false);
        expect(mouseShadow._locked).toBe(false);
    })

    test("Can set start coords via locking method", () => {
        // Reset from previous attempts
        mouseShadow._connectorStartCoords = null;
        expect(mouseShadow._connectorStartCoords).toBe(null);
        mouseShadow.setLocked(true, {x: 5, y: 5});
        expect(mouseShadow._connectorStartCoords).toStrictEqual({x: 5, y: 5});
    })

    // Set Color (two cases)
    test("Can set color based on validity test", () => {
        mouseShadow.setColor(true);
        expect(mouseShadow._color).toBe("#0FFF13");
        mouseShadow.setColor(false);
        expect(mouseShadow._color).toBe("#D10000");
    })

})