import EconomyData from "../src/economyData";
import { Resource } from "../src/economyData";

const economyData = new EconomyData();

const basicResources: Resource[] = [    // A simple set of all the basic resources
    ["water", 10000],
    ["oxygen", 10000],
    ["food", 10000]
];

const extraResources: Resource[] = [    // Mimics a likely distribution of resources from several modules
    ["water", 10000],
    ["oxygen", 10000],
    ["food", 10000],
    ["water", 10000],
    ["oxygen", 10000],
    ["water", 10000],
    ["oxygen", 10000],
    ["power", 10000]
]

describe("EconomyData", () => {

    test("Can add basic resources", () => {
        economyData.updateResources(basicResources);
        expect(economyData._resources).toStrictEqual(
            [
                ["money", 0],  // Money should always be default value, as it is not updated with the other resources
                ["oxygen", 10000],
                ["water", 10000],
                ["food", 10000],
                ["power", 0],
                ["equipment", 0],
                ["minerals", 0]
            ]
        )
    })

    test("Can add money", () => {
        economyData.addMoney(10000000);
    })

    test("Can add additional resources and calculate rate of change", () => {
        economyData.updateResources(extraResources);
        expect(economyData._resources).toStrictEqual(
            [
                ["money", 10000000],
                ["oxygen", 30000],
                ["water", 30000],
                ["food", 10000],
                ["power", 10000],
                ["equipment", 0],
                ["minerals", 0]
            ]
        )
        // Update function updates resource change rate when called
        expect(economyData._resourceChangeRates).toStrictEqual(
            [
                ["money", 0],
                ["oxygen", 20000],
                ["water", 20000],
                ["food", 0],
                ["power", 10000],
                ["equipment", 0],
                ["minerals", 0]
            ]
        )
    })

    test("Can update a single resource/rate of change with updateOneResource method", () => {
        economyData.updateOneResource(["oxygen", -1000]);
        // NOTE: Using values from the previous test, to illustrate their continuity
        expect(economyData._resources).toStrictEqual(
            [
                ["money", 10000000],
                ["oxygen", 29000],
                ["water", 30000],
                ["food", 10000],
                ["power", 10000],
                ["equipment", 0],
                ["minerals", 0]
            ]
        )
        // Update function updates resource change rate when called
        expect(economyData._resourceChangeRates).toStrictEqual(
            [
                ["money", 0],
                ["oxygen", 19000],
                ["water", 20000],
                ["food", 0],
                ["power", 10000],
                ["equipment", 0],
                ["minerals", 0]
            ]
        )
    })
    
})