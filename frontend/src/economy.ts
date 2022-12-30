// The Economy class is the disembodied list of all your resources, and the functions that change them.
import P5 from "p5";
import EconomyData from "./economyData";
import { constants } from "./constants";

export default class Economy {
    // Economy class types:
    _p5: P5;
    _data: EconomyData;
    _displayX: number;
    _displayY: number;
    _xInterval: number;
    _yInterval: number;
    

    constructor(p5: P5) {
        this._p5 = p5;
        this._data = new EconomyData();
        this._displayX = 24;
        this._displayY = 24;
        this._xInterval = 176;
        this._yInterval = 80;
    }

    displayResource = (resource: [string, number], x: number, y: number, shortage: boolean) => {
        const p5 = this._p5;
        // @ts-ignore
        const symbol = this._data._resourceSymbols[resource[0]];
        symbol.length < 2 ? p5.textSize(24) : p5.textSize(22);
        p5.fill(constants.YELLOW_TEXT);
        p5.text(symbol, x, y);
        if (shortage) {
            p5.fill(constants.RED_CONTRAST);
        } else {
            p5.fill(constants.GREEN_TERMINAL);
        }
        p5.textSize(18);
        // Display resource quantity as decimal value:
        // TODO: Replace resource name string with symbol, to be defined in dictionary in econo data class
        const offset = Math.max(Math.log10(Math.max(resource[1], 1)) * 4 + symbol.length * 5, 16);
        const val = Math.round(resource[1]/this._data._resourceDisplayFraction);
        p5.text(val, x + offset + 24, y);
    }

    displayResourceChangeRate = (delta: number, x: number, y: number, shortage: boolean) => {
        const p5 = this._p5;
        p5.textSize(16);
        if (!shortage && delta >= 0) {
            p5.fill(constants.GREEN_TERMINAL);
            p5.text(`+ ${(delta) / this._data._resourceDisplayFraction} / hour`, x, y);
        } else {
            p5.fill(constants.RED_ERROR);
            p5.text(`${(delta) / this._data._resourceDisplayFraction} / hour`, x, y);
        }
        
    }

    render = () => {
        const p5 = this._p5;
        p5.textSize(16);
        let deltas: number[] = [];
        this._data._resourceChangeRates.forEach((rate) => {
            deltas.push(rate[1]);
        })
        this._data._resources.forEach((resource, idx) => {
            // Only display the first 5 resource types (incl. money)
            if (idx < 5) {
                // This is ugly and brittle - if indices for resources/shortages ever get out of sync, display will be wrong
                const shortage = Object.values(this._data._resourceShortages)[idx];
                this.displayResource(resource, this._displayX + idx * this._xInterval, this._displayY, shortage);
                this.displayResourceChangeRate(deltas[idx], this._displayX + 32 + idx * this._xInterval, this._displayY + 24, shortage);
            }
        })
    }

}