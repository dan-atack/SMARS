import Minimap from "../src/minimap";

describe("Minimap", () => {

    const minimap = new Minimap(256, 256, []);

    test("Defines loadTerrain", () => {
        expect(typeof minimap.loadTerrain).toBe("function");
    })

})