import MapData from "../src/mapData";

describe("MapData", () => {
    const mapData = new MapData();
    const flatTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]];
    const flatTopography = [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33];
    const bumpyTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1]];
    const bumpyTopography = [33, 33, 32, 31, 32, 33, 33, 33, 33, 33, 34, 35, 34, 34, 32, 33];
    const cliffs = [[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3, 4, 5], [1, 2, 3, 4], [1, 2, 3], [1, 2, 3], [1, 2, 3], ]

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

    test("Calculates the map's topography", () => {
        mapData._mapData = flatTerrain;
        mapData.determineTopography();  // This inverse y-axis is confusing but I'm almost used to it!
        expect(mapData._topography).toStrictEqual(flatTopography);
        mapData._mapData = bumpyTerrain;
        mapData.determineTopography();
        expect(mapData._topography).toStrictEqual(bumpyTopography);
    })

    // test("Determines map zones", () => {
    //     mapData._mapData = bumpyTerrain;    // Bumpy though it is, this should only be a single zone as it is all traversible
    //     mapData.determineTopography();
    //     mapData.determineZones();
    //     expect(mapData._zones).toStrictEqual([{leftEdge: {x: 0, y: 33}, rightEdge: {x: 15, y: 33}}]);
    //     mapData._mapData = cliffs;      // Cliffs map has a cliff with a height of 3 near the middle - thus it should be two zones
    //     mapData.determineTopography();
    //     mapData.determineZones();
    //     expect(mapData._zones).toStrictEqual([
    //         {
    //             leftEdge: {x: 0, y: 33},
    //             rightEdge: {x: 6, y: 30}
    //         },
    //         {
    //             leftEdge: {x: 7, y: 33},
    //             rightEdge: {x: 15, y: 33}
    //         }
    //     ])
    // })

    // test("Determines if a point is walkable from another point", () => {
    //     mapData._mapData = bumpyTerrain;
    //     mapData.determineTopography();
    //     mapData.determineZones();
    //     expect(mapData.walkableFromLocation(0, 32, 14, 31)).toBe(true);
    //     mapData._mapData = cliffs;
    //     mapData.determineTopography();
    //     mapData.determineZones();
    //     expect(mapData.walkableFromLocation(0, 32, 14, 32)).toBe(false);
    // })
})