import { ModuleInfo } from "../src/server_functions";

// Since we can't import the actual Infrastructure class directly, its methods are copied here for unit testing:
test("Can get all coordinates in area defined by height and width and x and y", () => {
    function calculateModuleArea (w: number, h: number, mouseX: number, mouseY: number) {
        let coords: {x: number, y: number}[] = [];
        for (let i = 0; i < w; i++) {
            for (let k = 0; k < h; k++)  {
                coords.push({x: i + mouseX, y: k + mouseY});
            }
        }
        return coords;
    }

    function checkTerrainForObstructions (moduleArea: {x: number, y: number}[], terrain: number[][], ) {
        // List only the map columns that match the module area's x coordinates:
        const cols: number[][] = [];
        for (let i = 0; i < terrain.length; i++) {
            if (i >= moduleArea[0].x && i <= moduleArea[moduleArea.length - 1].x) {
                cols.push(terrain[i]);
            }
        }
        
    }

    expect(calculateModuleArea(1, 1, 0, 0)).toStrictEqual([{"x": 0, "y": 0}]);
    expect(calculateModuleArea(2, 2, 0, 0)).toStrictEqual([
        {"x": 0, "y": 0},
        {"x": 0, "y": 1},
        {"x": 1, "y": 0},
        {"x": 1, "y": 1}
    ]);
    expect(calculateModuleArea(2, 3, 4, 5)).toStrictEqual([
        {"x": 4, "y": 5},
        {"x": 4, "y": 6},
        {"x": 4, "y": 7},
        {"x": 5, "y": 5},
        {"x": 5, "y": 6},
        {"x": 5, "y": 7},
    ])

})