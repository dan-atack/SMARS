import Block from "../src/block";
import Map from "../src/map";

describe("Map", () => {
    const mapTest = new Map();
    const flatTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]];
    const flatTopography = [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33];
    const bumpyTerrain = [[1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 4, 4], [1, 1, 1, 4], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1], [1], [1, 1], [1, 1], [1, 1, 1, 4], [1, 1, 1]];
    const bumpyTopography = [33, 33, 32, 31, 32, 33, 33, 33, 33, 33, 34, 35, 34, 34, 32, 33];
    const cliffs = [[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3, 4, 5], [1, 2, 3, 4], [1, 2, 3], [1, 2, 3], [1, 2, 3], ]

    test("Defines setup function", () => {
        expect(typeof mapTest.setup).toBe("function");
    })

    test("Calculates flat terrain is flat", () => {
        mapTest._mapData = flatTerrain;
        expect(mapTest.determineFlatness(0, 7)).toBe(true);
    })

    test("Calculates that bumpy terrain isn't flat", () => {
        mapTest._mapData = bumpyTerrain;
        expect(mapTest.determineFlatness(0, 7)).toBe(false);
    })

    test("Calculates that an area outside the left boundary is unacceptable", () => {
        mapTest._mapData = flatTerrain;
        expect(mapTest.determineFlatness(-1, 6)).toBe(false);
    })

    test("Calculates that an area outside the right boundary is unacceptable", () => {
        mapTest._mapData = flatTerrain;
        // Start at, stop before
        expect(mapTest.determineFlatness(10, 17)).toBe(false);
    })

    test("Calculates that a flat area right up against the right edge is acceptable", () => {
        mapTest._mapData = flatTerrain;
        expect(mapTest.determineFlatness(9, 16)).toBe(true);
    })

    test("Calculates the map's topography", () => {
        mapTest._mapData = flatTerrain;
        mapTest.determineTopography();  // This inverse y-axis is confusing but I'm almost used to it!
        expect(mapTest._topography).toStrictEqual(flatTopography);
        mapTest._mapData = bumpyTerrain;
        mapTest.determineTopography();
        expect(mapTest._topography).toStrictEqual(bumpyTopography);
    })

    test("Determines map zones", () => {
        mapTest._mapData = bumpyTerrain;    // Bumpy though it is, this should only be a single zone as it is all traversible
        mapTest.updateTopographyAndZones(); // This calls both the topography and the zone determinator methods
        expect(mapTest._zones).toStrictEqual([{id: "0033", leftEdge: {x: 0, y: 33}, rightEdge: {x: 15, y: 33}}]);
        mapTest._mapData = cliffs;      // Cliffs map has a cliff with a height of 3 near the middle - thus it should be two zones
        mapTest.updateTopographyAndZones();
        expect(mapTest._zones).toStrictEqual([
            {
                id: "0033",
                leftEdge: {x: 0, y: 33},
                rightEdge: {x: 6, y: 30}
            },
            {
                id: "7033",
                leftEdge: {x: 7, y: 33},
                rightEdge: {x: 15, y: 33}
            }
        ])
    })

    test("Determines if a point is walkable from another point", () => {
        mapTest._mapData = bumpyTerrain;
        mapTest.updateTopographyAndZones();
        expect(mapTest.walkableFromLocation(0, 32, 15, 32)).toBe(true);     // Can walk all the way across a flat zone
        mapTest._mapData = cliffs;
        mapTest.updateTopographyAndZones();
        expect(mapTest.walkableFromLocation(0, 32, 14, 32)).toBe(false);    // Cannot walk over cliff
        expect(mapTest.walkableFromLocation(0, 33, 1, 33)).toBe(false);     // Cannot start too low
        expect(mapTest.walkableFromLocation(0, 31, 1, 33)).toBe(false);     // Cannot start too high
        expect(mapTest.walkableFromLocation(0, 32, 5, 29)).toBe(false);     // Cannot walk to destination that is too high
        expect(mapTest.walkableFromLocation(0, 32, 5, 31)).toBe(false);     // Cannot walk to destination that is too low
        expect(mapTest.walkableFromLocation(0, 32, 6, 29)).toBe(true);      // CAN walk up to the edge of the cliff
        expect(mapTest.walkableFromLocation(15, 32, 7, 32)).toBe(true);     // CAN walk to the edge of cliff (from other side)
    })

    test("Returns the ID of a map zone for a pair of surface coordinates", () => {
        expect(mapTest.getZoneIdForCoordinates({x: 0, y: 32})).toBe("0033");
        expect(mapTest.getZoneIdForCoordinates({x: 6, y: 29})).toBe("0033");
        expect(mapTest.getZoneIdForCoordinates({x: 7, y: 32})).toBe("7033");
        expect(mapTest.getZoneIdForCoordinates({x: 0, y: 33})).toBe("");  // Invalid (non-surface) location gives empty result
    })

    test("Returns the Block at a given pair of non-surface coordinates", () => {
        mapTest.setup(cliffs);
        // Inspect the block at the top of the cliff, and all points around it
        expect(mapTest.getBlockForCoords({ x: 6, y: 30 })?._blockData.name).toBe("Meteor");     // Cliff top block type = Meteor
        expect(mapTest.getBlockForCoords({ x: 6, y: 29 })).toBe(null);                          // One above = empty
        expect(mapTest.getBlockForCoords({ x: 5, y: 30 })).toBe(null);                          // One to the right = empty
        expect(mapTest.getBlockForCoords({ x: 7, y: 30 })).toBe(null);                          // One to the left = empty
        expect(mapTest.getBlockForCoords({ x: 6, y: 31 })?._blockData.name).toBe("Dry Ice");    // One below block type = Dry Ice
    })

    test("isBlockOnSurface can tell if a block is at the top of its column", () => {
        const block = mapTest.getBlockForCoords({ x: 6, y: 30});
        if (block) {    // We know it's there, this is just to soothe typescript
            expect(mapTest.isBlockOnSurface(block)).toBe(true);
        }
        const deepBlock = mapTest.getBlockForCoords({ x: 6, y: 31});
        if (deepBlock) {    // We know it's there, this is just to soothe typescript
            expect(mapTest.isBlockOnSurface(deepBlock)).toBe(false);
        }
    })

    test("Constructor determines bedrock depth", () => {
        expect(mapTest._bedrock).toBe(35);
    })

    // "Cliff" in this context means a height difference of 3 or more between two adjacent map columns
    test("isBlockRemovable checks that a block is at the surface, not at or below bedrock, and that its removal would not form a cliff", () => {
        // Test 1: Block is at the surface, flush with its neighbors (allow removal)
        mapTest.setup(flatTerrain);
        const flatSurfaceCoords = { x: 3, y: 33 };
        expect((mapTest.isBlockRemovable(flatSurfaceCoords) as Block)._blockData.name).toBe("Rock");
        // Test 2: Coordinates are above the surface (do not allow removal)
        const tooHighCoords = { x: 3, y: 32 };
        expect(mapTest.isBlockRemovable(tooHighCoords)).toBe("Click on a tile\nto excavate it.");
        // Test 3: Block is at the surface, on the slope of a steep hill (height delta 2 between it and its neighbors) (do not allow removal)
        mapTest.setup(bumpyTerrain);
        const steepCoords = { x: 13, y: 34 };
        expect(mapTest.isBlockRemovable(steepCoords)).toBe("Cannot excavate Rock:\nSite is too steep");
        // Test 4: Block is not at the surface (do not allow)
        const deepCoords = { x: 1, y: 34 }
        expect(mapTest.isBlockRemovable(deepCoords)).toBe("Cannot excavate Rock:\nMust be at surface level");
        // Test 5: Block is at the surface, at bedrock level (do not allow)
        const rockBottomCoords = { x: 11, y: 35 };
        expect(mapTest.isBlockRemovable(rockBottomCoords)).toBe("Cannot excavate Rock:\nSite is too deep");
    })

})