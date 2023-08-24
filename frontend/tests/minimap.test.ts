import Minimap from "../src/minimap";

describe("Minimap", () => {

    const minimap = new Minimap(256, 256, "Minimap");

    test("Defines setup", () => {
        expect(typeof minimap.setup).toBe("function");
    })

    test("Setup, by means of determineDisplayWidth, sets the columns/pixels ratio, and sets the 'current screen' box width correctly", () => {
        const terrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1]];   // Length = 64
        
        minimap.setup(terrain);
        expect(minimap._columnsPerPixel).toBe(0.25);    // 1 column for every 4 pixels
        expect(minimap._currentScreenWidth).toBe(184)   // Screen width is 46 columns; Ratio of 1 : 4 = 46 / 64 = 184 / 256

        const altTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1]];   // Length = 59

        minimap.setup(altTerrain);
        expect(minimap._columnsPerPixel).toBe(0.23046875);      // Can be a decimal / float
        expect(minimap._currentScreenWidth).toBe(199);          // Must be an integer
    })

})