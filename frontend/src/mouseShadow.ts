// The MouseShadow class will be used to help with the placement of new base structures
import P5 from "p5";
import MouseShadowData from "./mouseShadowData";
import { constants } from "./constants";

export default class MouseShadow {
    // Mouse Shadow types:
    _p5: P5;
    _data: MouseShadowData;

    constructor(p5: P5, x: number, y: number, w: number, h: number) {
        this._p5 = p5;
        this._data = new MouseShadowData(x, y, w, h);
    }

    // Takes up to 4 parameters: x and y (mouse coords) and optionally w and h (in case of a connector being stretched)
    render = (x: number, y: number, w?: number, h?: number) => {
        const p5 = this._p5;
        // TODO: Make color dependent on placement viability calculation
        p5.fill(constants.BLUEGREEN_CRYSTAL);
        // Allow the shadow to follow the mouse if it is not locked
        if (!this._data._locked) {
            this._data._x = x;
            this._data._y = y;
        } else {
            // If the shadow is not locked, allow it to stretch
        };
        p5.rect(this._data._x, this._data._y, this._data._w, this._data._h);
    }
}