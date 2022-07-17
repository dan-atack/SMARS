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
        const deltas = Object.values(this._data._resourceChangeRates);
        Object.values(this._data._resources).forEach((resource, idx) => {
            const shortage = Object.values(this._data._resourceShortages)[idx];
            this.displayResource(resource, this._displayX + idx * this._xInterval, this._displayY, shortage);
            this.displayResourceChangeRate(deltas[idx], this._displayX + 32 + idx * this._xInterval, this._displayY + 24, shortage);
        })
    }

}