import Minimap from "../src/minimap";

describe("Minimap", () => {

    const minimap = new Minimap(256, 256, "Minimap");

    test("Defines setup", () => {
        expect(typeof minimap.setup).toBe("function");
    })

})