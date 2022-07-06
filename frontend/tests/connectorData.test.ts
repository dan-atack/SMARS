import ConnectorData from "../src/connectorData";
// jest.mock("../src/connectorData");

// DUMMY DATA:
// ConnectorData parameters
const start = {x: 10, y: 10};
const stop = { x: 10, y: 20};
const connectorInfo = { "name" : "Air Vent", "type" : "conduit", "resourcesCarried" : [ "air" ], "maxFlowRate" : 1, "buildCosts" : { "money" : 10000 }, "maintenanceCosts" : [ ], "vertical" : true, "horizontal" : true, "width" : 1 }

// 

// it("Check if the constructor is called", () => {
//     const connectorData = new ConnectorData(start, stop, connectorInfo);
//     expect(connectorData).toHaveBeenCalledTimes(1);
// })

//
describe("ConnectorData", () => {

    const connectorData = new ConnectorData(start, stop, connectorInfo);

    test("Defines orientation", () => {
        expect(typeof connectorData._orientation).toBe("string");
    })
})