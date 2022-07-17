// The EconomyData class handles all of the data processing for the economy class, without any of the rendering tasks
import { constants } from "./constants";

export type Resources = {       // ENSURE THJS IS KEPT IN SYNC WITH THE BACKEND'S SAVE FUNCTIONS FILE
    money: [string, number],    // Each value is a tuple, representing the display symbol, and the quantity
    oxygen: [string, number],
    water: [string, number],
    food: [string, number],
    power: [string, number],
    equipment: [string, number],
    minerals: [string, number]
}

export default class EconomyData {
    // Economy Data types:
    _resources: Resources;
    _resourceChangeRates: {             // Resource change rates calculated at moment of update
        money: number
        oxygen: number,
        water: number,
        food: number,
    };
    _resourceDisplayFraction: number;           // The amount by which to divide each resource's display quantity
    _resourceShortages: {                   // List of the key names of resources that have run out
        money: boolean,
        oxygen: boolean,
        water: boolean,
        food: boolean,
    };

    constructor() {
        this._resources = {
            money: ["$", 10000000],
            oxygen: ["Air", 10000],
            water: ["H20", 10000],
            food: ["Food", 10000],
            power: ["Power", 50000],
            equipment: ["Equip.", 10000],
            minerals: ["Minerals", 0],
        };
        this._resourceChangeRates = {
            money: 0,
            oxygen: 0,
            water: 0,
            food: 0,
        }
        this._resourceDisplayFraction = 100;        // We can display 'decimals' down to 0.01
        this._resourceShortages = {
            money: false,
            oxygen: false,
            water: false,
            food: false,
        };
    }

    // Takes a new purchase's costs and compares it with the current resource quantities
    checkResources = (cost: { money: number }) => {
        // Ensure there is enough of the money resource to meet the cost
        if (cost.money <= this._resources.money[1]) {
            return true
        } else {
            return false;
        }
    }

     // Processes positive financial transactions
     addMoney = (amount: number) => {
        this._resources.money[1] += amount;
        this._resourceChangeRates.money += amount;
    }

    // Processes a resource reduction transaction for a building
    subtractMoney = (cost: { money: number }) => {
        const money = this._resources.money[1] - cost.money;
        this._resources.money[1] = money;
        this._resourceChangeRates.money -= cost.money;
    };

    updateResource = ( resource: string, amount: number) => {
        this._resourceChangeRates.money = 0;    // Reset financial costs record each update cycle
        switch (resource) {
            case "oxygen":
                this._resources.oxygen[1] -= amount;
                this._resourceChangeRates.oxygen = -amount; // We have assumed that a positive amount means a decrease
                if (this._resources.oxygen[1] <= 0) {
                    // If value gets to or below zero, add its name to the 'resource shortages' list
                    this._resources.oxygen[1] = 0;
                    this._resourceShortages.oxygen = true;
                } else {
                    this._resourceShortages.oxygen = false;
                }
                break;
            case "water":
                this._resources.water[1] -= amount;
                this._resourceChangeRates.water = -amount;
                if (this._resources.water[1] < 0) {
                    this._resources.water[1] = 0;
                    this._resourceShortages.water = true;
                } else {
                    this._resourceShortages.water = false;
                }
                break;
            case "food":
                this._resources.food[1] -= amount;
                this._resourceChangeRates.food = -amount;
                if (this._resources.food[1] < 0) {
                    this._resources.food[1] = 0;
                    this._resourceShortages.food = true;
                } else {
                    this._resourceShortages.food = false;
                }
                break;
            default:
                console.log(`Unfamiliar resource update request detected: ${resource}`);
        }
    }

    // Used to load/reset both the current and previous tallies to a fixed amount e.g. at game start/load
    setResources = (resources: Resources) => {
        if (resources) {
            // Ridiculous, convoluted way to avoid 'binding' the current and previous resource values
            this._resources = resources;
        } else {
            // If a file that has no resource data is loaded, give the player the regular new game's default starting resources
            this.setResources({
                money: ["$", 10000000],
                oxygen: ["Air", 10000],
                water: ["H20", 10000],
                food: ["Food", 10000],
                power: ["Power", 50000],
                equipment: ["Equip.", 10000],
                minerals: ["Minerals", 0],
            })
        }
    }

    reset = () => {
        const empty: Resources = {
            money: ["$", 10000000],
            oxygen: ["Air", 10000],
            water: ["H20", 10000],
            food: ["Food", 10000],
            power: ["Power", 50000],
            equipment: ["Equip.", 10000],
            minerals: ["Minerals", 0],
        };
        this.setResources(empty);
    }

}