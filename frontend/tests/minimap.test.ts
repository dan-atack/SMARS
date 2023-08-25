import Minimap from "../src/minimap";

describe("Minimap", () => {

    let offset = 0;     // This is wonky but it allows us to simulate the component's output to the Engine, so... pretty useful actually!
    const setHorizontalOffset = (x: number) => { offset = x };

    const minimap = new Minimap(256, 256, "Minimap", setHorizontalOffset);

    // Test terrains
    const terrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1]];   // Length = 64
    const altTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1]];   // Length = 59
    const smallTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4]] // Length = 32

    test("Defines setup", () => {
        expect(typeof minimap.setup).toBe("function");
    })

    test("Setup, by means of determineDisplayWidth, sets the columns/pixels ratio, and sets the 'current screen' box width correctly", () => {
        
        
        minimap.setup(terrain);
        expect(minimap._columnsPerPixel).toBe(0.25);    // 1 column for every 4 pixels
        expect(minimap._currentScreenWidth).toBe(184)   // Screen width is 46 columns; Ratio of 1 : 4 = 46 / 64 = 184 / 256

        minimap.setup(altTerrain);
        expect(minimap._columnsPerPixel).toBe(0.23046875);      // Can be a decimal / float
        expect(minimap._currentScreenWidth).toBe(199);          // Must be an integer
    })

    test("handleClick returns the index number of the map column corresponding to the clicked minimap pixel", () => {
        minimap.setup(terrain);     // Load the terrain with the nice round numbers
        const mouseX = 300;         // Minimap's X is 256 so this is 44 pixels into the map's 256 pixel width
        const mouseLeft = 200;      // Representing a click that is 56 px left of the left edge - out of bounds, in other words
        const mouseRight = 600;     // Representing a click that is 88 px right of the right edge - also out of bounds
        minimap.handleClick(mouseX)
        expect(offset).toBe(360);
        // Test that negative numbers are handled gracefully (stop at the map's left edge AKA offset 0)
        minimap.setup(terrain);
        minimap.handleClick(mouseLeft)
        expect(offset).toBe(0);
        // Test that numbers greater than the width of the map are gracefully handled (stop one screen's width from the map's right edge)
        minimap.handleClick(mouseRight)
        expect(offset).toBe(360);
    })

})