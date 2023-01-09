import InfrastructureData from "../src/infrastructureData";
import Map from "../src/map";
import { ModuleInfo } from "../src/server_functions";

// DUMMY DATA:
// Module Info
const moduleInfo: ModuleInfo = { "name" : "Lander", "width" : 3, "height" : 2, "type" : "test", "pressurized" : true, "columnStrength" : 2, "durability" : 10, "buildCosts" : [[ "money", 200000 ]], "maintenanceCosts" : [ ["power", 1] ], "storageCapacity" : [ ["power", 100] ], "crewCapacity" : 2, "shapes" : [ { "shape" : "quad", "color" : "#7D7D7D", "params" : [ 0, 0, 4, 0, 3.5, 0.5, 0.5, 0.5 ] }, { "shape" : "quad", "color" : "#353837", "params" : [ 0, 3, 0.5, 2.5, 3.5, 2.5, 4, 3 ] }, { "shape" : "quad", "color" : "#BCC4C1", "params" : [ 0, 0, 0.5, 0.5, 0.5, 2.5, 0, 3 ] }, { "shape" : "quad", "color" : "#BCC4C1", "params" : [ 3.5, 0.5, 4, 0, 4, 3, 3.5, 2.5 ] }, { "shape" : "rect", "color" : "#4B4446", "params" : [ 0.5, 0.5, 3, 2 ] }, { "shape" : "ellipse", "color" : "#050094", "params" : [ 2, 1.5, 1 ] }, { "shape" : "arc", "color" : "#2E1409", "params" : [ 2, 1.5, 1, 1, 0, 3.14159 ], "mode" : "PIE" } ] };
const storageModuleInfo: ModuleInfo = {
    name: "Basic Storage",
    width: 4,
    height: 3,
    type: "Storage",
    pressurized: true,
    columnStrength: 10,
    durability: 100,
    buildCosts:[
        ["money", 100000]
    ],  // money
    maintenanceCosts: [
        ["power", 1]
    ],
    storageCapacity: [
        ["oxygen", 1000],
        ["food", 10000],
        ["water", 10000],
        ["equipment", 20000]// oxygen, water, food... and equipment??
    ],
    crewCapacity: 1,
    shapes: []
}
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

// Slightly lumpy map (one map zone only)
const map1 = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 2],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 3],
];

// Perfectly flat map (one map zone only)
const map2 = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
];

// Map with a 'butte' dividing it into three zones
const map3 = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
];

const map3Zones = [
    { id: '0033', leftEdge: { x: 0, y: 33 }, rightEdge: { x: 7, y: 33 } },
    {
      id: '8030',
      leftEdge: { x: 8, y: 30 },
      rightEdge: { x: 11, y: 30 }
    },
    {
      id: '12033',
      leftEdge: { x: 12, y: 33 },
      rightEdge: { x: 19, y: 33 }
    }
]


// Floor test data
const footprintA = [0, 1, 2, 3];    // Left side
const footprintB = [4, 5, 6, 7];    // Will link A and C
const footprintC = [8, 9, 10, 11];  // Right side
const footprintD = [12, 13, 14, 15];  // Far right

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
        // Ensure the tests are starting clean
        expect(infraData._floors.length).toBe(0);
        infraData.addModuleToFloors(9000, { floor: 8, footprint: footprintA}, [], []);
        expect(infraData._floors.length).toBe(1);   // Create first module --> first floor also
        infraData.addModuleToFloors(9001, { floor: 8, footprint: footprintC}, [], []);
        expect(infraData._floors.length).toBe(2);   // Create second module a ways away --> second floor instance
        infraData.addModuleToFloors(9002, { floor: 8, footprint: footprintD}, [], []);
        expect(infraData._floors.length).toBe(2);   // Create third module in position to merge with second one
        expect(infraData._floors[1]._modules).toStrictEqual([9001, 9002]);
        expect(infraData._floors[1]._leftSide).toBe(8);
        expect(infraData._floors[1]._rightSide).toBe(15);
        infraData.addModuleToFloors(9003, { floor: 8, footprint: footprintB}, [], []);
        expect(infraData._floors.length).toBe(1);   // Create fourth module between first and second, merging into one big floor
        expect(infraData._floors[0]._modules).toStrictEqual([9000, 9001, 9002, 9003]);
        expect(infraData._floors[0]._leftSide).toBe(0);
        expect(infraData._floors[0]._rightSide).toBe(15);
        infraData.addModuleToFloors(9004, { floor: 5, footprint: footprintA}, [], []);
        expect(infraData._floors.length).toBe(2);   // Create a fifth module on another level, just because
    })

    test("Can create a new floor", () => {
        // Reset test conditions
        infraData._floors = [];
        infraData.setSerialNumber(1000);
        expect(infraData._currentSerial).toBe(1000);
        infraData.addNewFloor(5, footprintA, infraData._currentSerial, [], []);
        expect(infraData._floors.length).toBe(1);
        expect(infraData._currentSerial).toBe(1001);    // Validate serial number augmentation
        infraData.addNewFloor(5, footprintB, infraData._currentSerial, [], []);
        infraData.addNewFloor(2, footprintB, infraData._currentSerial, [], []);
        expect(infraData._floors.length).toBe(3);
        expect(infraData._currentSerial).toBe(1003);
    })

    test("Can find floors at a certain elevation", () => {
        // Note: Floors created by the previous test persist here, so be sure the two tests are kept in sync
        expect(infraData.findFloorsAtElevation(5).length).toBe(2);  // 2 Floors now exists here
        expect(infraData.findFloorsAtElevation(2).length).toBe(1);  // 1 here
        expect(infraData.findFloorsAtElevation(1).length).toBe(0);  // None here
    })

    

    test("Can delete a floor", () => {
        // Delete all of the floors from the previous test (validates unique ID generator as well)
        infraData._floors.forEach((floor) => {
            infraData.deleteFloor(floor._id);
        })
        expect(infraData._floors.length).toBe(0);
    })

    test("Can combine two floors", ()  => {
        // Reset serial number to target the right floor IDs
        infraData.setSerialNumber(1000);
        expect(infraData._currentSerial).toBe(1000);    // Validate serial number reset
        // Ensure no previous floors exist
        infraData._floors = [];
        // Add two new floors that are on the same level, but with a gulf between them
        infraData.addNewFloor(5, footprintA, 9001, [], []);
        expect(infraData._floors[0]._id).toBe(1001);
        infraData.addNewFloor(5, footprintC, 9002, [], []);
        expect(infraData._floors.length).toBe(2);
        expect(infraData._floors[0]._id).toBe(1001);
        expect(infraData._floors[1]._id).toBe(1002);
        // Validate pre-combine details for comparison
        expect(infraData._floors[0]._modules).toStrictEqual([9001]);
        expect(infraData._floors[0]._rightSide).toBe(3);
        infraData.combineFloors(1001, 1002, 9003);
        // Validate post-combine details
        expect(infraData._floors.length).toBe(1);       // Only one floor exists
        expect(infraData._floors[0]._id).toBe(1001);    // Its ID is that of the first floor created
        expect(infraData._floors[0]._modules).toStrictEqual([9001, 9002, 9003]);  // Both of the existing floors' modules IDs are preserved, and the new ID of the new module that unites them is also present
        expect(infraData._floors[0]._leftSide).toBe(0);
        expect(infraData._floors[0]._rightSide).toBe(11);
    })

    test("Can add connectors to floors", () => {
        // Connector is added which intersects the existing floor (continuing from the previous test case)
        infraData.addConnectorToFloors(9000, { x: 1, y: 0 }, { x: 1, y: 20 }, "");
        expect(infraData._floors[0]._connectors).toStrictEqual([9000]);  // Floor has the connector's ID registered
        infraData.addNewFloor(2, footprintA, 6000, [], []);
        // TO IMPLEMENT: Every time a new floor is added, all connectors must be checked
        expect(infraData._floors[1]._connectors).toStrictEqual([9000]);     // Newly added floor gets existing connectors
        infraData.addConnectorToFloors(9001, { x: 3, y: 0 }, { x: 3, y: 20 }, "");
        // New connectors are added to all applicable floors
        expect(infraData._floors[0]._connectors).toStrictEqual([9000, 9001]);
        expect(infraData._floors[1]._connectors).toStrictEqual([9000, 9001]);   // Both floors get new connector
        infraData.addNewFloor(8, footprintA, 6001, [], []);
        // All new floors get all applicable connectors
        expect(infraData._floors[2]._connectors).toStrictEqual([9000, 9001]);   // New floor gets both existing connectors
        infraData.addConnectorToFloors(9002, { x: 4, y: 0 }, { x: 4, y: 20 }, "");
        // Connectors are only added to floors they intersect with
        expect(infraData._floors[2]._connectors).toStrictEqual([9000, 9001]);
        expect(infraData._floors[1]._connectors).toStrictEqual([9000, 9001]);
        expect(infraData._floors[0]._connectors).toStrictEqual([9000, 9001, 9002]); // Only floors that are in-bounds are connected
    })

    // Floor and Elevator (Ladder) Info methods - to be called by the Colonist to help with pathfinding

    // Returns a pointer to the entire floor object
    test("Can find the floor that contains a module with a given ID", () => {
        expect(infraData.getFloorFromModuleId(9003)?._id).toBe(1001);   // Returns the whole object if found (in this case the mega-floor from the floor combiner test)
        expect(infraData.getFloorFromModuleId(6001)?._id).toBe(1004);   // Finds the other, smaller floor added in the last test
        expect(infraData.getFloorFromModuleId(9004)).toBe(null);        // When the module is not found, return a null value
    })

    // Also returns pointer to the whole floor object
    test("Can find a floor when provided with its ID", () => {
        expect(infraData.getFloorFromId(1004)).toBeTruthy();    // Just make sure the floor exists
        expect(infraData.getFloorFromId(9999)).toBe(null);      // Ensure that non-valid floor IDs return a null
    })

    // Returns pointer to the whole floor object as well
    test("Can find the floor that is stood on at a pair of coordinates", () => {
        expect(infraData.getFloorFromCoords({ x: 1, y: 8 })?._id).toBe(1004);
    })

    // Returns a pointer to the entire elevator object (which is just an id, x, top and bottom - all integers, incidentally)
    test("Can find an elevator from its ID", () => {
        expect(infraData.getElevatorFromId(9000)).toStrictEqual({ id: 9000, x: 1, top: 0, bottom: 20, groundZoneId: "" });    // Find the first elevator added in the 'add connectors to floors' test
        expect(infraData.getElevatorFromId(9002)).toStrictEqual({ id: 9002, x: 4, top: 0, bottom: 20, groundZoneId: "" });    // Find other elevator
        expect(infraData.getElevatorFromId(1000)).toBe(null);   // Always return null when something isn't found
    })

    // Returns true or false, depending on if the elevator ID is in the Floor's connectors list
    test("Can determine if an elevator segment reaches a particular floor", () => {
        expect(infraData.doesElevatorReachFloor(1001, 9000)).toBe(true);
        expect(infraData.doesElevatorReachFloor(1001, 9001)).toBe(true);
        expect(infraData.doesElevatorReachFloor(1001, 9002)).toBe(true);    // Big floor has all 3 connectors
        expect(infraData.doesElevatorReachFloor(1003, 9000)).toBe(true);
        expect(infraData.doesElevatorReachFloor(1003, 9001)).toBe(true);
        expect(infraData.doesElevatorReachFloor(1003, 9002)).toBe(false);   // Smaller floor has only 2 connectors
    })

    // Returns true or false depending on whether a new Floor's elevation is at the map's surface level
    test("Can determine if Floor is at ground level on flat map", () => {
        // Create instance of Map Data class to provide topographical data for ground floor calculation
        const topographicalMap = new Map();
        topographicalMap._mapData = map2;   // Use the flat map for starters
        topographicalMap.updateTopographyAndZones();
        const topo = topographicalMap._topography;
        const zones = topographicalMap._zones;
        expect(infraData.determineFloorGroundZones(topo, zones, 31, footprintA)).toStrictEqual([]);      // Too high - no zones
        expect(infraData.determineFloorGroundZones(topo, zones, 33, footprintA)).toStrictEqual([]);      // Too low - no zones
        expect(infraData.determineFloorGroundZones(topo, zones, 32, footprintB)).toStrictEqual([{id: "0033", leftEdge: {x: 0, y: 33}, rightEdge: {x: 15, y: 33}}]);   // On the ground = in the zone
        // TODO: Write additional test cases using map3 (the butte) to evaluate more complicated scenarios
    })

    test("Can determine Floor's ground zone on uneven map", () => {
        // Load map data for 'butte' shaped map
        const topographicalMap = new Map();
        topographicalMap._mapData = map3;
        topographicalMap.updateTopographyAndZones();
        const topo = topographicalMap._topography;
        const zones = topographicalMap._zones;
        expect(topographicalMap._zones).toStrictEqual(map3Zones);   // Quick check to verify that map zones are updated correctly
        expect(infraData.determineFloorGroundZones(topo, zones, 32, footprintA)).toStrictEqual([{ id: '0033', leftEdge: { x: 0, y: 33 }, rightEdge: { x: 7, y: 33 } }]);    // On the ground at the leftmost edge
        expect(infraData.determineFloorGroundZones(topo, zones, 32, footprintB)).toStrictEqual([{ id: '0033', leftEdge: { x: 0, y: 33 }, rightEdge: { x: 7, y: 33 } }]);    // On the ground, flush with the left edge of the 'butte'
        expect(infraData.determineFloorGroundZones(topo, zones, 32, footprintC)).toStrictEqual([]);    // Forbidden due to collision with the butte
        expect(infraData.determineFloorGroundZones(topo, zones, 29, footprintC)).toStrictEqual([{
            id: '8030',
            leftEdge: { x: 8, y: 30 },
            rightEdge: { x: 11, y: 30 }
        }]);    // On the ground, on top of the butte
        expect(infraData.determineFloorGroundZones(topo, zones, 32, footprintD)).toStrictEqual([{
            id: '12033',
            leftEdge: { x: 12, y: 33 },
            rightEdge: { x: 19, y: 33 }
        }]);    // On the ground, on right side of the butte
        // TODO: Add a case where a floor bridges two zones??
    })

    test("Can get a list of floors that are connected to an elevator (ladder) from the elevator's ID", () => {
        expect(infraData.getFloorsFromElevatorId(9000).length).toBe(3);
    })

})