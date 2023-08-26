import { ColonistAction } from "../src/colonistData";
import Population from "../src/population";
import { ModuleInfo } from "../src/server_functions";
import { ConnectorInfo } from "../src/server_functions";
import Infrastructure from "../src/infrastructure";
import InfrastructureData from "../src/infrastructureData";
import Map from "../src/map";

// For test structures
const hydroponicsModuleData: ModuleInfo = {
    name: "Hydroponics Pod",
    width: 3,
    height: 3,
    type: "Production",
    pressurized: true,
    columnStrength: 1,
    durability: 100,
    buildCosts: [
        ["money", 100000],
    ],
    maintenanceCosts: [
        ["power", 10]
    ],
    productionInputs: [     // Plant life needs: water, CO2 and light (in this case electric light)
        ["water", 5]
    ],
    productionOutputs: [
        ["food", 10],
        ["oxygen", 10],
    ],
    storageCapacity: [
        ["oxygen", 1000],
        ["water", 2500],
        ["food", 1000],
    ],
    crewCapacity: 1,
    shapes: []
}

const ladderData: ConnectorInfo = {
    name: "Ladder",
    type: "transport",
    resourcesCarried: ["crew"],
    maxFlowRate: 2,
    buildCosts: [
        ["money", 7500]
    ],
    maintenanceCosts: [],
    vertical: true,
    horizontal: false,
    width: 1
}

// Fake terrain data: plug into Infra class's structure adding methods (ground level is 26 meaning structures' y values should be 25)
const mockography = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
const zonesData = [
    { id: '0026', leftEdge: { x: 0, y: 26 }, rightEdge: { x: 15, y: 26 } }
]

const mockMap = new Map;

describe("Population", () => {
    const population = new Population();
    const infra = new Infrastructure();
    infra._data = new InfrastructureData();                 // Necessary... for now
    infra._data.setup(mockography.length);                  // Setup Infra data with the width of the 'map' being used

    const reset = () => {
        population._colonists = [];
        infra._modules = [];
        infra._connectors = [];
        infra._data = new InfrastructureData();
        infra._data.setup(mockography.length);
    }

    test("Defines addColonist", () => {
        expect(typeof population.addColonist).toBe("function");
    })

    test("AddColonist adds a Colonist", () => {
        population.addColonist(0, 0);
        expect(population._colonists.length).toBe(1);           // Check that colonist is 'on the list'
        expect(population._colonists[0]._data._id).toBe(9000);  // Check their ID... wow, are these unit tests or a nightclub bouncer's instructions manual, amiright?
    })

    test("Can find a Colonist when given a set of coordinates", () => {
        // First move the colonist so that this isn't too easy
        population._colonists[0]._data._x = 10;
        population._colonists[0]._data._y = 31;     // 31 is the head level, so the feet will be on level 32
        expect(population.getColonistDataFromCoords({ x: 10, y: 31 })?._data._id).toBe(9000);   // Head
        expect(population.getColonistDataFromCoords({ x: 10, y: 32 })?._data._id).toBe(9000);   // Feet
        expect(population.getColonistDataFromCoords({ x: 10, y: 33 })).toBe(null);              // Too low!!!
    })

    test("Can assign a role to a colonist when given the colonist's ID", () => {
        population.assignColonistRole(9000, ["farmer", 1001]);
        expect(population._colonists[0]._data._role[0]).toBe("farmer");             // Role is assigned if colonist exists
        expect(population.assignColonistRole(8000, ["farmer", 1001])).toBe(null);   // If colonist ID does not exist return null
    })

    test("Can calculate the average morale of all the colonists each hour", () => {
        population.addColonist(0, 0);                   // Add a second colonist
        expect(population._averageMorale).toBe(50);     // Default value is 50
        population.addColonist(0, 0);                   // Add a third colonist
        population._colonists[0]._data._morale = 80;    // Increase one colonist's morale by 30
        population.updateMoraleRating();
        expect(population._averageMorale).toBe(60);     // Average morale = 50 + 50 + 80 / 3 = 60
        // Reduce one colonist's morale by one point
        population._colonists[1]._data._morale = 49;
        population.updateMoraleRating();
        expect(population._averageMorale).toBe(60);     // Average morale is rounded to the nearest integer (rounded up)
        // Reduce one colonist's morale by one more point
        population._colonists[1]._data._morale = 48;
        population.updateMoraleRating();
        expect(population._averageMorale).toBe(59);     // Average morale is rounded to the nearest integer (rounded down)
    })

    test("Can calculate how many new colonists to send on the next rocket", () => {
        // Manually set morale and then measure
        population._averageMorale = 0;
        expect(population.determineColonistsForNextLaunch()).toBe(0);
        population._averageMorale = 24;
        expect(population.determineColonistsForNextLaunch()).toBe(0);
        population._averageMorale = 25;
        expect(population.determineColonistsForNextLaunch()).toBe(1);
        population._averageMorale = 49.5;
        expect(population.determineColonistsForNextLaunch()).toBe(1);
        population._averageMorale = 50;
        expect(population.determineColonistsForNextLaunch()).toBe(2);
        population._averageMorale = 75;
        expect(population.determineColonistsForNextLaunch()).toBe(3);
        population._averageMorale = 99.99;
        expect(population.determineColonistsForNextLaunch()).toBe(3);
        population._averageMorale = 100;
        expect(population.determineColonistsForNextLaunch()).toBe(4);
    } )

    test("Can mass update colonists' morale with updateColonistsMorale method", () => {
        // Set starting values
        population._colonists[0]._data._morale = 50;
        population._colonists[1]._data._morale = 55;
        population._colonists[2]._data._morale = 60;
        population.updateColonistsMorale(-5);
        // Verify that each colonist's morale has been reduced by 5
        expect(population._colonists[0]._data._morale).toBe(45);
        expect(population._colonists[1]._data._morale).toBe(50);
        expect(population._colonists[2]._data._morale).toBe(55);
        // Verify that morale cannot go above 100
        population.updateColonistsMorale(50);
        expect(population._colonists[0]._data._morale).toBe(95);
        expect(population._colonists[1]._data._morale).toBe(100);
        expect(population._colonists[2]._data._morale).toBe(100);
        // Verify that morale cannot go below 0
        population.updateColonistsMorale(-99);
        expect(population._colonists[0]._data._morale).toBe(0);
        expect(population._colonists[1]._data._morale).toBe(1);
        expect(population._colonists[2]._data._morale).toBe(1);
    })

    test("Can resolve current goal for all colonists with an action in their stack that uses a removed structure", () => {
        reset();
        // Setup: 3 colonists for 3 possible outcomes: two of them need to use the removed structure as an action towards their current goal
        population.addColonist(1, 24);
        population.addColonist(4, 25);
        population.addColonist(2, 22);
        const removedBuildingId = 1003;
        // Setup Colonist A: current action is to climb the ladder; he is in position and currently climbing and his goal is to farm
        population._colonists[0]._data._currentGoal = "farm";
        population._colonists[0]._data._currentAction = {
            type: "climb",
            coords: { x: 1, y: 22 },
            duration: 0,
            buildingId: 1003
        };
        // Setup Colonist B: current action is to move, but has a climb with the removed structure's ID in his action stack
        population._colonists[1]._data._currentGoal = "farm";
        population._colonists[1]._data._currentAction = {
            type: "move",
            coords: { x: 1, y: 25 },
            duration: 0,
            buildingId: 0
        };
        population._colonists[1]._data._actionStack = [
            {
                type: "climb",
                coords: { x: 1, y: 22 },
                duration: 0,
                buildingId: 1003
            },
            {
                type: "farm",
                coords: { x: 0, y: 22 },
                duration: 22,
                buildingId: 1005
            }
        ];
        // Setup Colonist C: current action is to farm, and has no other items in his stack
        population._colonists[2]._data._currentGoal = "farm";
        population._colonists[2]._data._currentAction = {
            type: "farm",
            coords: { x: 0, y: 22 },
            duration: 25,
            buildingId: 1005
        };
        // Expected outcome: Colonists A and B have their goal resolved immediately and colonist C does not, and goes on farming
        population.resolveGoalsWhenStructureRemoved(1003);
        // Goal canceled since current action uses removed structure ID
        expect(population._colonists[0]._data._currentAction).toBe(null);
        expect(population._colonists[0]._data._currentGoal).toBe("");
        // Goal canceled since action stack contains removed structure ID
        expect(population._colonists[1]._data._currentAction).toBe(null);
        expect(population._colonists[1]._data._actionStack).toStrictEqual([]);
        expect(population._colonists[1]._data._currentGoal).toBe("");
        // Goal remains in place
        expect(population._colonists[2]._data._currentGoal).toBe("farm");
        expect(population._colonists[2]._data._currentAction).toStrictEqual({
            type: "farm",
            coords: { x: 0, y: 22 },
            duration: 25,
            buildingId: 1005
        })
    })

    test("areColonistsNear can tell if there are any colonists within a given distance of a given location", () => {
        reset();
        population.addColonist(0, 33);
        population.addColonist(10, 33);
        // Test 1: No colonists are within a wide radius
        expect(population.areColonistsNear({ x: 5, y: 33 }, 5));
        // Test 2: Colonists are within a wide radius
        expect(population.areColonistsNear({ x: 6, y: 33 }, 5));
        // Test 3: Colonists are not within a small radius
        expect(population.areColonistsNear({ x: 8, y: 33 }, 2));
        // Test 4: Colonists are within a small radius
        expect(population.areColonistsNear({ x: 9, y: 33 }, 2));
    })

})