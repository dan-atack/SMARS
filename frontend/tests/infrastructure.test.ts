import { ModuleInfo } from "../src/server_functions";
import { constants } from "../src/constants";

// TODO: Add two fake module info objects here to use for tests number 1 and 3 to make them more realistic

// Since we can't import the actual Infrastructure class directly, its methods are copied here for unit testing:
test("Can calculate module area", () => {
    function calculateModuleArea (w: number, h: number, mouseX: number, mouseY: number) {
        let coords: {x: number, y: number}[] = [];
        for (let i = 0; i < w; i++) {
            for (let k = 0; k < h; k++)  {
                coords.push({x: i + mouseX, y: k + mouseY});
            }
        }
        return coords;
    }

    // One-by-one structure in upper left corner
    expect(calculateModuleArea(1, 1, 0, 0)).toStrictEqual([{"x": 0, "y": 0}]);
    // Two-by-two structure in upper left corner
    expect(calculateModuleArea(2, 2, 0, 0)).toStrictEqual([
        {"x": 0, "y": 0},
        {"x": 0, "y": 1},
        {"x": 1, "y": 0},
        {"x": 1, "y": 1}
    ]);
    // Two-by-three structure in middle of map
    expect(calculateModuleArea(2, 3, 4, 5)).toStrictEqual([
        {"x": 4, "y": 5},
        {"x": 4, "y": 6},
        {"x": 4, "y": 7},
        {"x": 5, "y": 5},
        {"x": 5, "y": 6},
        {"x": 5, "y": 7},
    ])

})

test("Can check terrain for obstructions", () => {
    function checkTerrainForObstructions (moduleArea: {x: number, y: number}[], terrain: number[][], ) {
        let clear = true;               // Set to false if there is any overlap between the map and the proposed new module
        let collisions: number[][] = [];  // Keep track of the coordinates of any collisions (obstructions) that are detected
        const rightEdge = moduleArea[0].x;  // Get x coordinates of the right and left edges of the module
        const leftEdge = moduleArea[moduleArea.length - 1].x;
        // Check only the map columns that match the module area's x coordinates:
        const cols: number[][] = [];
        for (let i = 0; i < terrain.length; i++) {
            if (i >= rightEdge && i <= leftEdge) {
                cols.push(terrain[i]);
            }
        }
        cols.forEach((column, idx) => {
            moduleArea.forEach((coordPair) => {
                if (coordPair.x === rightEdge + idx) {
                    // Match each module column with each terrain column
                    const y = constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - coordPair.y - 1;
                    column.forEach((block, jdx) => {
                        if (block && jdx === y) {
                            collisions.push([rightEdge + idx, jdx])
                            clear = false;
                        }
                    })
                }
            })
        })
        // If there is no obstruction we get a 'true' here; otherwise return the coordinates that overlap.
        if (clear) {
            return true;
        } else {
            return collisions;
        }
    }

    // One-by-two building that does not overlap should return true:
    expect(checkTerrainForObstructions([
        {x: 0, y: constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - 4},
        {x: 1, y: constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - 4}
    ],
    [
        [1, 1, 1],
        [1, 1, 1]
    ])).toStrictEqual(true);
    // One-by-two building that does overlap in one place should return the coordinates of the obstruction:
    expect(checkTerrainForObstructions([
        {x: 0, y: constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - 4},
        {x: 1, y: constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - 4}
    ],
    [
        [1, 1, 1, 1, 1],
        [1, 1, 1],
        [1, 1, 1, 1]
    ])).toStrictEqual([[0, 3]]);
})

test("Can check other modules for obstructions", () => {
    type FakeModule = {
        _x: number
        _y: number
        _w: number
        _h: number
    }
    // We need to use this function to test the checkOtherModulesForObstructions function... Dear god, if only we could mock!!
    function calculateModuleArea (w: number, h: number, mouseX: number, mouseY: number) {
        let coords: {x: number, y: number}[] = [];
        for (let i = 0; i < w; i++) {
            for (let k = 0; k < h; k++)  {
                coords.push({x: i + mouseX, y: k + mouseY});
            }
        }
        return coords;
    }
    const modules: FakeModule[] = [
        {
            _x: 0,
            _y: 0,
            _w: 3,
            _h: 3
        },
        {
            _x: 3,
            _y: 1,
            _w: 3,
            _h: 3
        }
    ];
    function checkOtherModulesForObstructions (moduleArea: {x: number, y: number}[]) {
        let clear = true;               // Set to false if there is any overlap between the map and the proposed new module
        let collisions: number[][] = [];
        modules.forEach((mod) => {
            // TODO: Improve efficiency by only checking modules with the same X coordinates?
            const modArea = calculateModuleArea(mod._w, mod._h, mod._x, mod._y);
            modArea.forEach((coordPair) => {
                moduleArea.forEach((coords) => {
                    if (coordPair.x === coords.x && coordPair.y === coords.y) {
                        clear = false;
                        collisions.push([coordPair.x, coordPair.y]);
                    }
                })
            })
        })
        // If there is no obstruction we get a 'true' here; otherwise return the coordinates that overlap.
        if (clear) {
            return true;
        } else {
            return collisions;
        }
    }

    // One-by-one building in top-left corner should overlap
    expect(checkOtherModulesForObstructions([{x: 0, y: 0}])).toStrictEqual([[0, 0]]);
    // One-by-one building below the existing modules should be clear
    expect(checkOtherModulesForObstructions([{x: 1, y: 3}])).toStrictEqual(true);
    // Two-by-one building just above the floor of the existing modules should overlap in once place
    expect(checkOtherModulesForObstructions([{x: 1, y: 2}, {x: 1, y: 3}])).toStrictEqual([[1, 2]]);
})

test("Can check module footprint vs terrain to ensure flat ground beneath module", () => {
    function checkModuleFootprintWithTerrain (moduleArea: {x: number, y: number}[], terrain: number[][]) {
        let okay = true;            // Like the other checks, set this to false if there are any gaps under the requested location
        let gaps: number[] = [];  // If there are any gaps, keep track of their locations
        // Get module floor height and 'footprint' from module Area:
        let floor: number = moduleArea[0].y;
        // Get the highest y value to establish the height of the module's "floor"
        moduleArea.forEach((pair) => {
            if (pair.y > floor) floor = pair.y;
        })
        // Get all unique x values to establish the module's "footprint"
        const footprint: number[] = [];
        moduleArea.forEach((pair) => {
            if (!footprint.includes(pair.x)) {
                footprint.push(pair.x);
            }
        })
        // Compare footprint to map - don't forget to invert the y-value!
        const y = constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - floor - 1;
        terrain.forEach((col, idx) => {
            // Set okay to false and add a gap if the last non-zero number in the list is not exactly y - 1
            if (footprint.includes(idx)) {
                // To make sure you only say there's terrain if there is a block, make sure it's a number and that it's non-zero
                if (typeof col[y - 1] == "number" && col[y - 1] != 0) {
                } else {
                    okay = false;
                    gaps.push(idx);
                }
            } 
        })
        // If there are no gaps we get a 'true' here; otherwise return the coordinates where there is no floor:
        if (okay) {
            return true;
        } else {
            return gaps;
        }
    }

    const tinyModFootprint: {x: number, y: number}[] = [{x: 3, y: 30}, {x: 3, y: 29}];
    const wideModFootprint: {x: number, y: number}[] = [
        {x: 0, y: 27},
        {x: 1, y: 27},
        {x: 2, y: 27},
        {x: 0, y: 28},
        {x: 1, y: 28},
        {x: 2, y: 28}
    ];
    const map1 = [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
    ]
    const map2 = [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
    ]

    // Tiny building in a little niche in the map should be clear
    expect(checkModuleFootprintWithTerrain(tinyModFootprint, map1)).toStrictEqual(true);
    // Tiny building placed higher up in the air (lower y = higher elevation) has no floor
    expect(checkModuleFootprintWithTerrain(tinyModFootprint, map2)).toStrictEqual([3]);
    // Wide building on flat ground is A-Okay
    expect(checkModuleFootprintWithTerrain(wideModFootprint, map1)).toStrictEqual(true);
    // Wide building over a gap fails for the gap column
    expect(checkModuleFootprintWithTerrain(wideModFootprint, map2)).toStrictEqual([1]);
})