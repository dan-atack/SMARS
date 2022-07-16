// The MouseShadowData class handles all of the data processing for the mouse shadow class, without any of the rendering tasks
import { Coords } from "./connectorData";
import { constants } from "./constants";

export default class MouseShadowData {
    // Mouse Shadow Data types:
    _x: number;                 // All values are in terms of PIXELS, not grid spaces
    _y: number;
    _w: number;
    _h: number;
    _color: string;
    _xOffset: number;   // Needed only if the shadow is locked in place
    _locked: boolean;   // Used to anchor the shadow in place, for connector placement
    _connectorStartCoords: Coords | null;   // Both this and the stop coords are in terms of GRID LOCATIONS
    _connectorStopCoords: Coords | null;
    _deltaX: number;    // Used to help quickly determine a connector's length
    _deltaY: number;

    // W and H are both given in terms of columns, not pixels
    constructor(w: number, h: number) {
        this._x = 0;    // No inputs are given to construct a mouse shadow; only needed for rendering
        this._y = 0;
        this._w = w * constants.BLOCK_WIDTH;       // All values are in terms of pixels
        this._h = h * constants.BLOCK_WIDTH;
        this._color = constants.BLUEGREEN_CRYSTAL;
        this._xOffset = 0;
        this._locked = false;       // By default the shadow is free-floating
        this._connectorStartCoords = null;          // Confusingly, these are in terms of grid locations
        this._connectorStopCoords = null;
        this._deltaX = 0;
        this._deltaY = 0;
    }

    setPosition (x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    // Used for 'stretching' a connector from its start point to a second set of coords
    setWidthAndHeight (x: number, y: number, h: boolean, v: boolean) {
        if (this._connectorStartCoords) {
            // Convert x and y back to grid values here:
            const gridX = x / constants.BLOCK_WIDTH;
            const gridY = y / constants.BLOCK_WIDTH;
            this._deltaX = this._connectorStartCoords.x - gridX;
            this._deltaY = this._connectorStartCoords.y - gridY;
            // For convenience
            const startX = this._connectorStartCoords.x;
            const startY = this._connectorStartCoords.y;
            // Choose which vector to use and then cancel the other one
            if (h && v) {
                Math.abs(this._deltaX) > Math.abs(this._deltaY) ? this._deltaY = 0 : this._deltaX = 0; // If connector can be either vertical or horizontal, take the greater of the two vectors (default to picking y) and set the other vector to zero for this round
            } else if (h) {
                this._deltaY = 0
            } else {
                this._deltaX = 0
            };
            // Update position and/or width/height using the selected vector
            if (this._deltaX !== 0) {         // HORIZONTAL
                this._x = Math.min((startX - this._deltaX), startX) * constants.BLOCK_WIDTH;
                this._y = startY * constants.BLOCK_WIDTH;
                this._w = (Math.abs(this._deltaX) + 1) * constants.BLOCK_WIDTH;
                this._h = constants.BLOCK_WIDTH;
                this._connectorStopCoords = {x: gridX, y: startY};
            } else if (this._deltaY !== 0) {  // VERTICAL
                this._x = startX * constants.BLOCK_WIDTH;
                this._y = Math.min((startY - this._deltaY), startY) * constants.BLOCK_WIDTH;
                this._w = constants.BLOCK_WIDTH;
                this._h = (Math.abs(this._deltaY) + 1) * constants.BLOCK_WIDTH;
                this._connectorStopCoords = {x: startX, y: gridY};
            } else {                    // NEITHER
                this._x = startX * constants.BLOCK_WIDTH;
                this._y = startY * constants.BLOCK_WIDTH;
                this._w = constants.BLOCK_WIDTH;
                this._h = constants.BLOCK_WIDTH;
                this._connectorStopCoords = {x: startX, y: startY};
            }
        }
    }

    setOffset (x: number) {
        this._xOffset = x;
    }

    setWidth (w: number) {
        this._w = w;
    }

    setHeight (h: number) {
        this._h = h;
    }

    setLocked (locked: boolean, coords?: Coords) {
        this._locked = locked;
        // If a lock is being set, it should come with a set of coordinates to anchor the connector start in place
        if (coords) {
            this._connectorStartCoords = coords;
        }
    }

    setColor (valid: boolean) {
        if (valid) {
            this._color = constants.GREEN_TERMINAL;
        } else {
            this._color = constants.RED_ERROR;
        }
    }

}