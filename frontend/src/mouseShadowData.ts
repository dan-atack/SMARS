// The MouseShadowData class handles all of the data processing for the mouse shadow class, without any of the rendering tasks
import { constants } from "./constants";

export default class MouseShadowData {
    // Mouse Shadow Data types:
    _x: number;
    _y: number;
    _w: number;
    _h: number;
    _locked: boolean;   // Used to anchor the shadow in place, for connector placement

    constructor(x: number, y: number, w: number, h: number) {
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = w;
        this._locked = false;       // By default the shadow is free-floating
    }
}