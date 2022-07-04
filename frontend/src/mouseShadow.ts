// The MouseShadow class will be used to help with the placement of new base structures
import P5 from "p5";
import MouseShadowData from "./mouseShadowData";
import { constants } from "./constants";

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

    // Takes up to 5 parameters: x and y (mouse coords) + offset are mandatory
    // Vertical and Horizontal are optional booleans to help with stretching a connector shadow
    render = (x: number, y: number, xOffset: number, horizontal?: boolean, vertical?: boolean) => {
        const p5 = this._p5;
        this._data._xOffset = xOffset;
        p5.fill(this._data._color);
        // Allow the shadow to follow the mouse if it is not locked
        if (!this._data._locked) {
            this._data.setPosition(x, y);       // If the shadow is not locked, allow it to move
        }
        p5.rect(this._data._x - this._data._xOffset, this._data._y, this._data._w, this._data._h);
        if (this._data._connectorStartCoords) p5.text(this._data._connectorStartCoords.x, 20, 120);
        if (this._data._connectorStartCoords) p5.text(this._data._connectorStartCoords.y, 20, 140);
        // if (this._data._connectorStopCoords) p5.text(this._data._deltaX, 20, 160);
        // if (this._data._connectorStopCoords) p5.text(this._data._deltaY, 20, 180);
        if (this._data._connectorStopCoords) p5.text(this._data._connectorStopCoords.x, 20, 200);
        if (this._data._connectorStopCoords) p5.text(this._data._connectorStopCoords.y, 20, 220);
        // p5.text(this._data._direction, 20, 200);
    }
}