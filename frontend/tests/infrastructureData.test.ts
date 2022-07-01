import InfrastructureData from "../src/infrastructureData";
import { constants } from "../src/constants";

// DUMMY DATA:
const moduleInfo = { "name" : "Lander", "width" : 4, "height" : 3, "type" : "test", "pressurized" : true, "columnStrength" : 2, "durability" : 10, "buildCosts" : { "money" : 200000 }, "maintenanceCosts" : [ { "power" : 1 } ], "storageCapacity" : [ { "power" : 10 } ], "crewCapacity" : 2, "shapes" : [ { "shape" : "quad", "color" : "#7D7D7D", "params" : [ 0, 0, 4, 0, 3.5, 0.5, 0.5, 0.5 ] }, { "shape" : "quad", "color" : "#353837", "params" : [ 0, 3, 0.5, 2.5, 3.5, 2.5, 4, 3 ] }, { "shape" : "quad", "color" : "#BCC4C1", "params" : [ 0, 0, 0.5, 0.5, 0.5, 2.5, 0, 3 ] }, { "shape" : "quad", "color" : "#BCC4C1", "params" : [ 3.5, 0.5, 4, 0, 4, 3, 3.5, 2.5 ] }, { "shape" : "rect", "color" : "#4B4446", "params" : [ 0.5, 0.5, 3, 2 ] }, { "shape" : "ellipse", "color" : "#050094", "params" : [ 2, 1.5, 1 ] }, { "shape" : "arc", "color" : "#2E1409", "params" : [ 2, 1.5, 1, 1, 0, 3.14159 ], "mode" : "PIE" } ] }

describe("Infrastructure Data", () => {
    const infraData = new InfrastructureData();

    

})