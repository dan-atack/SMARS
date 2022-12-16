// The MouseShadow class will be used to help with the placement of new base structures
import P5 from "p5";
import { Coords } from "./connector";
import { constants } from "./constants";

export default class MouseShadow {
    // Mouse Shadow types:
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
    _jackhammerTipPosition: number  // Current frame in the jackhammer animation
    _jackhammerMaxPosition: number  // Maximum frame number for jackhammer animation
    _jackhammerOutward: boolean          // Whether the jackhammer point is coming in or going out
    _inspectMode: boolean;  // Used to indicate whether the mouse cursor should show the 'inspect tool' animation
    _resourceMode: boolean; // Used to indicate whether the mouse cursor should show the 'jackhammer' animation

    // W and H are both given in terms of columns, not pixels; inspect and resource are for custom cursor animations
    constructor(w: number, h: number, inspectMode?: boolean, resource?: boolean) {
        this._x = 0;    // No inputs are given to construct a mouse shadow; only needed for rendering
        this._y = 0;
        this._inspectMode = inspectMode || false;   // Unless provided, assume the mouse is not in inspect mode
        this._resourceMode = resource || false;     // Unless provided, assume the mouse is not in jackhammer mode
        this._w = w * constants.BLOCK_WIDTH;        // All values are in terms of pixels
        this._h = h * constants.BLOCK_WIDTH;
        this._color = constants.BLUEGREEN_CRYSTAL;
        this._xOffset = 0;
        this._locked = false;                       // By default the shadow is free-floating
        this._connectorStartCoords = null;          // Confusingly, these are in terms of grid locations
        this._connectorStopCoords = null;
        this._deltaX = 0;
        this._deltaY = 0;
        this._jackhammerTipPosition = 0;
        this._jackhammerMaxPosition = 8;
        this._jackhammerOutward = true;         // At the start of its animation, jackhammer is going outward
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
    
    setPosition (x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    setColor (valid: boolean) {
        if (valid) {
            this._color = constants.GREEN_TERMINAL;
        } else {
            this._color = constants.RED_ERROR;
        }
    }

    // Calculates new dimensions for connector stop placement (x and y are in pixels)
    resizeForConnector = (x: number, y: number, h: boolean, v: boolean) => {
        this.setWidthAndHeight(x, y, h, v);
    }

    // Separate render method for the jackhammer shadow
    renderJackhammer = (p5: P5) => {
        const x = this._x - this._xOffset + constants.BLOCK_WIDTH / 2;
        const y = this._y;  // for convenience
        const tip = this._jackhammerTipPosition;
        // Advance the drill head position
        // Outwards
        if (this._jackhammerOutward && this._jackhammerTipPosition < this._jackhammerMaxPosition) {
            this._jackhammerTipPosition++;
            if (this._jackhammerTipPosition >= this._jackhammerMaxPosition) {
                this._jackhammerOutward = false;        // Reverse if fully extended
            }
        // Inwards
        } else {
            this._jackhammerTipPosition--;
            if (this._jackhammerTipPosition <= 0) {
                this._jackhammerOutward = true;         // Reverse if fully retracted
            }
        }
        // NOTE: Could minimize this for the colonist's 'tool' animation??
        p5.strokeWeight(2);
        p5.stroke(constants.ALMOST_BLACK);
        p5.fill(constants.GRAY_METEOR);
        p5.rect(x - 20, y - 32, 40, 4);
        p5.fill(constants.YELLOW_TEXT);
        p5.quad(x - 5, y - 10, x + 5, y - 10, x + 10, y - 30, x - 10, y - 30);
        p5.quad(x - 10, y - 30, x + 10, y - 30, x + 5, y - 40, x - 5, y - 40);
        // Drill head
        p5.fill(constants.GRAY_DRY_ICE);
        p5.rect(x - 2, y - 10, 4, tip);
        p5.quad(x - 4, y + tip - 12, x + 4, y + tip - 12, x + 2, y + tip - 2, x - 2, y + tip - 2)
    }

    render = (p5: P5, x: number, y: number, xOffset: number) => {
        this._xOffset = xOffset;
        p5.fill(this._color);
        // Allow the shadow to follow the mouse if it is not locked
        if (!this._locked) {
            this.setPosition(x, y);       // If the shadow is not locked, allow it to move
        }
        // If the mouse is in inspect mode, show a little magnifying glass; otherwise show a rectangle
        if (this._inspectMode) {
            const centerX = this._x - this._xOffset + constants.BLOCK_WIDTH / 2;
            const centerY = this._y + constants.BLOCK_WIDTH / 2;
            const rad = constants.BLOCK_WIDTH / 2;
            p5.noFill();
            p5.stroke(constants.GRAY_DARK);
            p5.strokeWeight(5);
            p5.ellipse(centerX, centerY, this._w + constants.BLOCK_WIDTH / 4);
            p5.stroke(constants.GRAY_METEOR);
            p5.strokeWeight(7);
            p5.line(centerX + rad, centerY + rad, centerX + rad * 2, centerY + rad * 2);
            p5.strokeWeight(2);
            p5.stroke(constants.ALMOST_BLACK);
            p5.ellipse(centerX, centerY, this._w + rad);
            p5.ellipse(centerX, centerY, this._w);
        } else if (this._resourceMode) {
            this.renderJackhammer(p5);
        } else {
            p5.rect(this._x - this._xOffset, this._y, this._w, this._h);
        }
    }
}