import InfrastructureData from "../src/infrastructureData";
import { constants } from "../src/constants";

// DUMMY DATA:
const moduleInfo = { "name" : "Lander", "width" : 3, "height" : 2, "type" : "test", "pressurized" : true, "columnStrength" : 2, "durability" : 10, "buildCosts" : { "money" : 200000 }, "maintenanceCosts" : [ { "power" : 1 } ], "storageCapacity" : [ { "power" : 10 } ], "crewCapacity" : 2, "shapes" : [ { "shape" : "quad", "color" : "#7D7D7D", "params" : [ 0, 0, 4, 0, 3.5, 0.5, 0.5, 0.5 ] }, { "shape" : "quad", "color" : "#353837", "params" : [ 0, 3, 0.5, 2.5, 3.5, 2.5, 4, 3 ] }, { "shape" : "quad", "color" : "#BCC4C1", "params" : [ 0, 0, 0.5, 0.5, 0.5, 2.5, 0, 3 ] }, { "shape" : "quad", "color" : "#BCC4C1", "params" : [ 3.5, 0.5, 4, 0, 4, 3, 3.5, 2.5 ] }, { "shape" : "rect", "color" : "#4B4446", "params" : [ 0.5, 0.5, 3, 2 ] }, { "shape" : "ellipse", "color" : "#050094", "params" : [ 2, 1.5, 1 ] }, { "shape" : "arc", "color" : "#2E1409", "params" : [ 2, 1.5, 1, 1, 0, 3.14159 ], "mode" : "PIE" } ] }

describe("Infrastructure Data", () => {
    const infraData = new InfrastructureData();

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
        ])
        expect(infraData.calculateModuleArea(moduleInfo, 2, 3)).toStrictEqual([
            {x: 2, y: 3},
            {x: 2, y: 4},
            {x: 3, y: 3},
            {x: 3, y: 4},
            {x: 4, y: 3},
            {x: 4, y: 4}
        ])
    })

    test("Can calculate module footprint", () => {
        const coords = [
            {x: 0, y: 0},
            {x: 0, y: 1},
            {x: 1, y: 0},
            {x: 1, y: 1},
            {x: 2, y: 0},
            {x: 2, y: 1}
        ]
        const altCoords = [
            {x: 2, y: 3},
            {x: 2, y: 4},
            {x: 3, y: 3},
            {x: 3, y: 4},
            {x: 4, y: 3},
            {x: 4, y: 4}
        ]
        expect(infraData.calculateModuleFootprint(coords)).toStrictEqual({
            floor: 1,
            footprint: [0, 1, 2]
        });
        expect(infraData.calculateModuleFootprint(altCoords)).toStrictEqual({
            floor: 4,
            footprint: [2, 3, 4]
        })
    })

})