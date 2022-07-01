// The MouseShadowData class handles all of the data processing for the mouse shadow class, without any of the rendering tasks
import { constants } from "./constants";

export default class MouseShadowData {
    // Mouse Shadow Data types:
    _x: number;
    _y: number;
    _w: number;
    _h: number;
    _locked: boolean;   // Used to anchor the shadow in place, for connector placement

    // W and H are both given in terms of columns, not pixels
    constructor(w: number, h: number) {
        this._x = 0;    // No inputs are needed to construct a mouse shadow; only needed for rendering
        this._y = 0;
        this._w = w * constants.BLOCK_WIDTH;       // All values are in terms of pixels
        this._h = h * constants.BLOCK_WIDTH;
        this._locked = false;       // By default the shadow is free-floating
    }
}