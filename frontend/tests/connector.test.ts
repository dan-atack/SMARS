import Connector from "../src/connector";
import { ConnectorInfo } from "../src/server_functions";
// jest.mock("../src/connectorData");

// DUMMY DATA:
// ConnectorData parameters for a vertical air vent
const ids = [111, 222, 333];
const start = {x: 10, y: 10};
const stop1 = {x: 10, y: 20};
const stop2 = {x: 20, y: 10};
const connectorInfo: ConnectorInfo = { "name" : "Air Vent", "type" : "conduit", "resourcesCarried" : [ "air" ], "maxFlowRate" : 1, "buildCosts" : [["money", 10000]], "maintenanceCosts" : [ ], "vertical" : true, "horizontal" : true, "width" : 1 }

// Attempted mock test code... de-comment to see its excuse for not working as advertised.

// it("Check if the constructor is called", () => {
//     const connectorData = new ConnectorData(start, stop, connectorInfo);
//     expect(connectorData).toHaveBeenCalledTimes(1);
// })

describe("ConnectorData", () => {

    const connector = new Connector(ids[0], start, stop1, connectorInfo);
    const connectorDataHorizontal = new Connector(ids[1], start, stop2, connectorInfo);
    const connectorDataSinglePoint = new Connector(ids[2], start, start, connectorInfo);

    // Defines a property (proof that the constructor executed successfully)
    test("Defines orientation", () => {
        expect(typeof connector._orientation).toBe("string");
    })

    test("Calculates orientation correctly", () => {
        expect(connector._orientation).toBe("vertical");
    })

    test("Calculates horizontal orientation correctly", () => {
        expect(connectorDataHorizontal._orientation).toBe("horizontal");
    })

    test("Calculates orientation for single-point connector as horizontal", () => {
        expect(connectorDataHorizontal._orientation).toBe("horizontal");
    })
})