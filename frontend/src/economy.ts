// The Economy class is the disembodied list of all your resources, and the functions that change them.
import P5 from "p5";
import { constants } from "./constants";

export type Resources = {
    money: [string, number],    // Each value is a tuple, representing the display symbol, and the quantity
    oxygen: [string, number],
    water: [string, number],
    food: [string, number],
}

export default class Economy {
    // Economy class types:
    _p5: P5;
    _resources: Resources;
    _resourceChangeRates: {             // Resource change rates calculated at moment of update
        money: number
        oxygen: number,
        water: number,
        food: number,
    };
    _resourceDisplayFraction: number;           // The amount by which to divide each resource's display quantity
    _resourceShortages: {
        money: boolean,
        oxygen: boolean,
        water: boolean,
        food: boolean,
    };           // List of the key names of resources that have run out
    _displayX: number;
    _displayY: number;
    _xInterval: number;
    _yInterval: number;
    

    constructor(p5: P5) {
        this._p5 = p5;
        this._resources = {
            money: ["$", 10000000],
            oxygen: ["Air", 10000],
            water: ["H20", 10000],
            food: ["Food", 10000],
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
        this._displayX = 24;
        this._displayY = 24;
        this._xInterval = 176;
        this._yInterval = 80;
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
              })
        }
    }

    displayResource = (resource: [string, number], x: number, y: number, shortage: boolean) => {
        const p5 = this._p5;
        resource[0].length < 2 ? p5.textSize(24) : p5.textSize(22);
        p5.fill(constants.YELLOW_TEXT);
        p5.text(resource[0], x, y);
        // @ts-ignore
        if (shortage) {
            p5.fill(constants.RED_CONTRAST);
        } else {
            p5.fill(constants.GREEN_TERMINAL);
        }
        p5.textSize(18);
        // Display resource quantity as decimal value:
        const offset = Math.max(Math.log10(resource[1]) * 4 + resource[0].length * 5, 16);
        const val = Math.round(resource[1]/this._resourceDisplayFraction);
        p5.text(val, x + offset + 24, y);
    }

    displayResourceChangeRate = (delta: number, x: number, y: number, shortage: boolean) => {
        const p5 = this._p5;
        p5.textSize(16);
        if (!shortage && delta >= 0) {
            p5.fill(constants.GREEN_TERMINAL);
            p5.text(`+ ${(delta) / this._resourceDisplayFraction} / hour`, x, y);
        } else {
            p5.fill(constants.RED_ERROR);
            p5.text(`${(delta) / this._resourceDisplayFraction} / hour`, x, y);
        }
        
    }

    render = () => {
        const p5 = this._p5;
        p5.textSize(16);
        const deltas = Object.values(this._resourceChangeRates);
        Object.values(this._resources).forEach((resource, idx) => {
            const shortage = Object.values(this._resourceShortages)[idx];
            this.displayResource(resource, this._displayX + idx * this._xInterval, this._displayY, shortage);
            this.displayResourceChangeRate(deltas[idx], this._displayX + 32 + idx * this._xInterval, this._displayY + 24, shortage);
        })
    }

    reset = () => {
        const empty: Resources = { money: ["$", 0], oxygen: ["Air", 0], water: ["H20", 0], food: ["Food", 0] };
        this.setResources(empty);
    }

}