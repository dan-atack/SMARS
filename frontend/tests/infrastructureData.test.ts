import InfrastructureData from "../src/infrastructureData";
import Floor from "../src/floor";
import { constants } from "../src/constants";

// DUMMY DATA:
// Module Info
const moduleInfo = { "name" : "Lander", "width" : 3, "height" : 2, "type" : "test", "pressurized" : true, "columnStrength" : 2, "durability" : 10, "buildCosts" : { "money" : 200000 }, "maintenanceCosts" : [ { "power" : 1 } ], "storageCapacity" : [ { "power" : 10 } ], "crewCapacity" : 2, "shapes" : [ { "shape" : "quad", "color" : "#7D7D7D", "params" : [ 0, 0, 4, 0, 3.5, 0.5, 0.5, 0.5 ] }, { "shape" : "quad", "color" : "#353837", "params" : [ 0, 3, 0.5, 2.5, 3.5, 2.5, 4, 3 ] }, { "shape" : "quad", "color" : "#BCC4C1", "params" : [ 0, 0, 0.5, 0.5, 0.5, 2.5, 0, 3 ] }, { "shape" : "quad", "color" : "#BCC4C1", "params" : [ 3.5, 0.5, 4, 0, 4, 3, 3.5, 2.5 ] }, { "shape" : "rect", "color" : "#4B4446", "params" : [ 0.5, 0.5, 3, 2 ] }, { "shape" : "ellipse", "color" : "#050094", "params" : [ 2, 1.5, 1 ] }, { "shape" : "arc", "color" : "#2E1409", "params" : [ 2, 1.5, 1, 1, 0, 3.14159 ], "mode" : "PIE" } ] };
// Dummy Module area data (simulates the output from calculateModuleArea)
const coords = [
    {x: 0, y: 0},
    {x: 0, y: 1},
    {x: 1, y: 0},
    {x: 1, y: 1},
    {x: 2, y: 0},
    {x: 2, y: 1}
];
const altCoords = [
    {x: 2, y: 3},
    {x: 2, y: 4},
    {x: 3, y: 3},
    {x: 3, y: 4},
    {x: 4, y: 3},
    {x: 4, y: 4}
];
const justRightCoords = [
    {x: 0, y: 27},
    {x: 0, y: 28},
    {x: 1, y: 27},
    {x: 1, y: 28},
    {x: 2, y: 27},
    {x: 2, y: 28}
];
const onTopOfJustRightCoords = [
    {x: 0, y: 25},
    {x: 0, y: 26},
    {x: 1, y: 25},
    {x: 1, y: 26},
    {x: 2, y: 25},
    {x: 2, y: 26}
]
const tooLowCoords = [
    {x: 0, y: 28},
    {x: 0, y: 29},
    {x: 1, y: 28},
    {x: 1, y: 29},
    {x: 2, y: 28},
    {x: 2, y: 29}
];
const partlyBlockedCoords = [
    {x: 4, y: 27},
    {x: 4, y: 28},
    {x: 5, y: 27},
    {x: 5, y: 28},
    {x: 6, y: 27},
    {x: 6, y: 28}
];
// Terrain test data
const map1 = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 2],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 3],
]
// Floor test data

describe("Infrastructure Data", () => {
    const infraData = new InfrastructureData();

    infraData.setup(map1.length);

    test("Defines calculateModuleArea", () => {
        expect(typeof infraData.calculateModuleArea).toBe("function");
    })
    
    test("Can calculate a module's area", () => {
        expect(infraData.calculateModuleArea(moduleInfo, 0, 0)).toStrictEqual([
            {x: 0, y: 0},
            {x: 0, y: 1},
            {x: 1, y: 0},
            {x: 1, y: 1},
            {x: 2, y: 0},
            {x: 2, y: 1}
        ]);
        expect(infraData.calculateModuleArea(moduleInfo, 2, 3)).toStrictEqual([
            {x: 2, y: 3},
            {x: 2, y: 4},
            {x: 3, y: 3},
            {x: 3, y: 4},
            {x: 4, y: 3},
            {x: 4, y: 4}
        ]);
    })

    test("Can calculate module footprint", () => {
        expect(infraData.calculateModuleFootprint(coords)).toStrictEqual({
            floor: 1,
            footprint: [0, 1, 2]
        });
        expect(infraData.calculateModuleFootprint(altCoords)).toStrictEqual({
            floor: 4,
            footprint: [2, 3, 4]
        });
    })

    test("Can check terrain for obstructions on flat ground", () => {
        // Right corner, just on the ground
        expect(infraData.checkTerrainForObstructions(justRightCoords, map1)).toBe(true);
        // Right corner, bottom is just below ground level
        expect(infraData.checkTerrainForObstructions(tooLowCoords, map1)).toStrictEqual([
            [0, 29],
            [1, 29],
            [2, 29]
        ]);
        // Further to the left, with one terrain obstruction at the far left
        expect(infraData.checkTerrainForObstructions(partlyBlockedCoords, map1)).toStrictEqual([[6, 28]])
    })

    test("Can check module footprint versus terrain for gaps", () => {
        // Floor is at ground level, with no gaps
        expect(infraData.checkFootprintWithTerrain(28, [0, 1, 2, 3], map1)).toBe(true);
        // Floor is above ground level (all gaps) (Lower "floor" value = higher elevation, of course)
        expect(infraData.checkFootprintWithTerrain(27, [0, 1, 2, 3], map1)).toStrictEqual([
            0, 1, 2, 3
        ]);
        // Floor is at ground level, with one gap
        expect(infraData.checkFootprintWithTerrain(28, [2, 3, 4, 5], map1)).toStrictEqual([4]);
    })

    test("Can call top-level connector initial placement check", () => {
        expect(infraData.checkConnectorEndpointPlacement(4, 29, map1)).toBe(true);   // Nestled in the little 'gap'
        expect(infraData.checkConnectorEndpointPlacement(4, 30, map1)).toBe(false);  // One too low
    })

    // BASE VOLUME TESTS

    test("Can calculate base volume and use it for connector placement initial check", () => {
        // Test setup
        expect(infraData._baseVolume).toStrictEqual([
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]);
        // Test Connector placement with base volume BEFORE structures are added
        expect(infraData.checkConnectorEndpointPlacement(0, 25, map1)).toBe(false);   // Too high... for now!
        infraData.updateBaseVolume(justRightCoords);
        // Test adding just one structure
        expect(infraData._baseVolume).toStrictEqual([
            [27, 28],
            [27, 28],
            [27, 28],
            [],
            [],
            [],
            []
        ]);
        // Test adding a second structure and sorting the list
        infraData.updateBaseVolume(onTopOfJustRightCoords);
        expect(infraData._baseVolume).toStrictEqual([
            [25, 26, 27, 28],
            [25, 26, 27, 28],
            [25, 26, 27, 28],
            [],
            [],
            [],
            []
        ]);
        // Test Connector placement AFTER adding structures (base volume)
        expect(infraData.checkConnectorEndpointPlacement(0, 25, map1)).toBe(true);   // Same coords as before; now acceptable
        expect(infraData.checkConnectorEndpointPlacement(0, 24, map1)).toBe(false);  // Still too high (above the roof)
    })

    // FLOOR MANAGEMENT TESTS

    // Top-level floor management method
    test("Can decide whether to create, merge or expand floors when a new module is placed", () => {

    })

    test("Can create a new floor", () => {
        infraData.addNewFloor(5, [0, 1, 2, 3], infraData._currentSerial);
        expect(infraData._floors.length).toBe(1);
    })

    test("Can find floors at a certain elevation", () => {
        // Note: Floors created by the previous test persist here, so be sure the two tests are kept in sync
        expect(infraData.findFloorsAtElevation(5).length).toBe(1);  // Floor exists here
        expect(infraData.findFloorsAtElevation(6).length).toBe(0);  // Not here
    })

    

    test("Can delete a floor", () => {

    })

    test("Can combine two floors", ()  => {

    })

    

})