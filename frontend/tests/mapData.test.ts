import MapData from "../src/mapData";

describe("MapData", () => {
    const mapData = new MapData();
    const flatTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]];
    const bumpyTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1]];

    test("Defines setup function", () => {
        expect(typeof mapData.setup).toBe("function");
    })

    test("Calculates flat terrain is flat", () => {
        mapData._mapData = flatTerrain;
        expect(mapData.determineFlatness(0, 7)).toBe(true);
    })

    test("Calculates that bumpy terrain isn't flat", () => {
        mapData._mapData = bumpyTerrain;
        expect(mapData.determineFlatness(0, 7)).toBe(false);
    })

    test("Calculates that an area outside the left boundary is unacceptable", () => {
        mapData._mapData = flatTerrain;
        expect(mapData.determineFlatness(-1, 6)).toBe(false);
    })

    test("Calculates that an area outside the right boundary is unacceptable", () => {
        mapData._mapData = flatTerrain;
        // Start at, stop before
        expect(mapData.determineFlatness(10, 17)).toBe(false);
    })

    test("Calculates that a flat area right up against the right edge is acceptable", () => {
        mapData._mapData = flatTerrain;
        expect(mapData.determineFlatness(9, 16)).toBe(true);
    })
})