// The MouseShadow class will be used to help with the placement of new base structures
import P5 from "p5";
import MouseShadowData from "./mouseShadowData";

export default class MouseShadow {
    // Mouse Shadow types:
    _p5: P5;
    _data: MouseShadowData;

    // W and H are both given in terms of columns, not pixels
    constructor(p5: P5, w: number, h: number) {
        this._p5 = p5;
        this._data = new MouseShadowData(w, h);
    }

    // Calculates new dimensions for connector stop placement (x and y are in pixels)
    resizeForConnector = (x: number, y: number, h: boolean, v: boolean) => {
        this._data.setWidthAndHeight(x, y, h, v);
    }

    // Takes 3 parameters: x and y (mouse coords) + offset
    // Vertical and Horizontal are optional booleans to help with stretching a connector shadow
    render = (x: number, y: number, xOffset: number) => {
        const p5 = this._p5;
        this._data._xOffset = xOffset;
        p5.fill(this._data._color);
        // Allow the shadow to follow the mouse if it is not locked
        if (!this._data._locked) {
            this._data.setPosition(x, y);       // If the shadow is not locked, allow it to move
        }
        p5.rect(this._data._x - this._data._xOffset, this._data._y, this._data._w, this._data._h);
    }
}