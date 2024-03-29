// The EconomyData class handles all of the data processing for the economy class, without any of the rendering tasks
import { constants } from "./constants";

export type Resource = [ string, number ]   // New system: Each individual resource type is represented as a Resource, consisting of the resource's name and quantity (qty can thus be used either as a current quantity, or max capacity, depending on context)

export default class EconomyData {
    // Economy Data types:
    _resources: Resource[];                     // Just a simple display, with data taken from the Infrastructure class
    _resourceSymbols: Object;       // Dictionary to convert resource names into their shorter display symbols
    _resourceChangeRates: Resource[];
    _resourceDisplayFraction: number;           // The amount by which to divide each resource's display quantity
    _resourceShortages: {                       // List of the key names of resources that have run out
        money: boolean,
        oxygen: boolean,
        water: boolean,
        food: boolean,
    };

    constructor() {
        this._resources = [
            ["money", 0],       // Start with nothing and add initial money based on difficulty level
            ["oxygen", 0],
            ["water", 0],
            ["food", 0],
            ["power", 0],
            ["equipment", 0],
            ["minerals", 0]
        ];
        this._resourceSymbols = {
            money: "$",
            oxygen: "Air",
            water: "H2O",
            food: "Food",
            power: "Power",
            equipment: "Equip.",
            minerals: "Minerals"
        };
        this._resourceChangeRates = [       // Brittleness: Must be kept in the same order as the resources array
            ["money", 0],
            ["oxygen", 0],
            ["water", 0],
            ["food", 0],
            ["power", 0],
            ["equipment", 0],
            ["minerals", 0]
        ];
        this._resourceDisplayFraction = 100;        // We can display 'decimals' down to 0.01
        this._resourceShortages = {
            money: false,
            oxygen: false,
            water: false,
            food: false,
        };
    }

    // Takes a new purchase's costs and compares it with the current resource quantities
    checkResources = (cost: number) => {
        // Ensure there is enough of the money resource to meet the cost
        // NOTE: THIS ASSUMES THAT MONEY IS ALWAYS THE FIRST TYPE OF RESOURCE IN A STRUCTURE'S COST LIST
        if (cost <= this._resources[0][1]) {
            return true
        } else {
            return false;
        }
    }

    // Processes positive financial transactions
    addMoney = (amount: number) => {
        this._resources[0][1] += amount;
        this._resourceChangeRates[0][1] += amount;
    }

    // Processes a resource reduction transaction for a building
    subtractMoney = (cost: number) => {
        const money = this._resources[0][1] - cost;
        this._resources[0][1] = money;
        this._resourceChangeRates[0][1] -= cost;
    };

    // Gets passed the full list of all module resources once per game hour, and calculates the totals
    // (Updates rate of change data also)
    updateResources = (resources: Resource[]) => {
        // First, keep track of previous quantities - INCLUDING CASH!
        const prevs: number[] = [];
        this._resources.forEach((res) =>  {
            prevs.push(res[1]);
        })
        // Reset counters next - do for all counters EXCEPT CASH!!
        this._resources.forEach((res, idx) => {
            if (idx > 0) res[1] = 0;
        })
        // Lookup each resource name and add the value from the update parameter
        resources.forEach((resource) => {
            if (this._resources.find(res => res[0] === resource[0]) !== undefined) {
                // @ts-ignore
                this._resources.find(res => res[0] === resource[0])[1] += resource[1]
            }
        })
        // Update rate of change display by comparing previous values to current ones INCLUDING CASH!!!
        prevs.forEach((val, idx) => {
            this._resourceChangeRates[idx][1] = this._resources[idx][1] - val;
        })
    }

    // Called by the Engine to update the display/rate-of-change for a single resource (Called in the aftermath of a random event, e.g.)
    updateOneResource = (delta: Resource) => {
        // Find the resource to be updated as well as its rate-of-change-display
        const res: Resource | undefined = this._resources.find((r) => r[0] === delta[0]);
        const prev: Resource | undefined= this._resourceChangeRates.find((r) => r[0] === delta[0]);
        if (res && prev) {
            // If found, add the delta to both, to update their displays
            res[1] += delta[1];
            prev[1] += delta[1];
        } else {
            console.log(`ERROR: Unable to find ${delta[0]} in resources list.`);
        }
    }

    // Used to load/reset the rate-of-change values display e.g. at game start/load. If no value is given, it is a reset
    setResourceChangeRates = (resources?: Resource[]) => {
        if (resources) {
            // Expects the full, ordered list of resources, including money
            this._resourceChangeRates = resources;
        } else {
            this._resourceChangeRates = [       // Reset if no list is provided
                ["money", 0],
                ["oxygen", 0],
                ["water", 0],
                ["food", 0],
                ["power", 0],
                ["equipment", 0],
                ["minerals", 0]
            ]
        }
    }

}