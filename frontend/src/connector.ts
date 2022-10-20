// The Module class represents the basic building block of the colony; roughly speaking, one room or compartment
import P5 from "p5";
import { ConnectorInfo } from "./server_functions";
import { constants } from "./constants";

// Useful shorthand / standardization technique
export type Coords = {
    x: number,          // Representing grid locations, not pixels
    y: number
}

export default class Connector {
    // Connector Types
    _id: number;                // Unique ID from the Infra class
    _segments: {start: Coords, stop: Coords}[]; // Positions are given by a list of segments, each with start/stop coords.
    _length: number;        // Determined, along with orientation, from the start/stop coordinates
    _orientation: string;   // "vertical" or "horizontal"
    _leftEdge: number;      // To help with Infra class's rendering cutoff
    _rightEdge: number;
    _top: number;           // In GRID spaces
    _bottom: number;
    _connectorInfo: ConnectorInfo;
    _thickness: number;     // Width and height for connectors will vary based on length, which will be determined when the connector is placed, and thickness (which will be added soon to the connectorInfo's object shape in the backend).
    _groundZoneId: string;   // Keeps track of whether a transit-style connector is on the ground
    _xOffset: number;   // The offset value, on the other hand, will be in terms of pixels, to allow for smoother scrolling
    _yOffset: number;
    _color: string;

    constructor(id: number, start: Coords, stop: Coords, connectorInfo: ConnectorInfo) {
        this._id = id;
        this._segments = [{start: start, stop: stop}];      // Two sets of coordinates - possibly overlapping
        this._connectorInfo = connectorInfo;
        // Determine length and orientation, for general use
        this._length = 0;
        this._orientation = "";
        if (this._connectorInfo.vertical && this._connectorInfo.horizontal) {
            if (start.x === stop.x) {
                this._orientation = "vertical"   // Connector is vertical if start x and stop x are the same
                this._length = Math.abs(start.y - stop.y);
            } else {
                this._orientation = "horizontal";
                this._length = Math.abs(start.x - stop.x);
            }
        } else if (this._connectorInfo.vertical) {
            this._orientation = "vertical";     // Connector is vertical if only that property is true
            this._length = Math.abs(start.y - stop.y);
        } else {
            this._orientation = "horizontal";
            this._length = Math.abs(start.x - stop.x);
        }
        this._leftEdge = Math.min(start.x, stop.x);
        this._rightEdge = Math.max(start.x, stop.x);
        this._top = Math.min(start.y, stop.y);
        this._bottom = Math.max(start.y, stop.y);
        this._thickness = this._connectorInfo.width;   // All dimensions (including segment coords) are in terms of grid positions
        this._groundZoneId = "";
        this._xOffset = 0;
        this._yOffset = 0;
        this._color = constants.EGGSHELL    // Default value for now; in the future connectors will have custom colours
    }

    // For transport type connectors, see if they touch the ground and record the zone data if so
    setGroundZoneId = (id: string) => {
        this._groundZoneId = id;
    }

    renderLadder = (p5: P5) => {
        // Only one x coordinate on a vertical connector - the x2 coordinate is simply the right bar's location
        const x = this._segments[0].start.x * constants.BLOCK_WIDTH - this._xOffset + 2;
        const x2 = x + constants.BLOCK_WIDTH - 2;
        // Convert y coordinates into top/bottom values since start/stop don't always progress in the same direction
        const top = (Math.min(this._segments[0].start.y, this._segments[0].stop.y)) * constants.BLOCK_WIDTH - this._yOffset;
        const bot = (Math.max(this._segments[0].start.y, this._segments[0].stop.y) + 1) * constants.BLOCK_WIDTH - this._yOffset;
        // Side bars
        p5.strokeWeight(5);
        p5.stroke(constants.ALMOST_BLACK);
        p5.line(x, top, x, bot);
        p5.line(x2, top, x2, bot);
        // Rungs
        p5.strokeWeight(4);
        for (let i = 0; i <= this._length + 1; i += 0.4) {
            p5.line(x, top + (i * constants.BLOCK_WIDTH), x2, top + (i * constants.BLOCK_WIDTH))
        }
    }

    renderDuct = (p5: P5) => {
        // Endpoint coordinates
        const startX = this._segments[0].start.x * constants.BLOCK_WIDTH - this._xOffset;
        const startY = this._segments[0].start.y * constants.BLOCK_WIDTH - this._yOffset;
        const stopX = this._segments[0].stop.x * constants.BLOCK_WIDTH - this._xOffset;
        const stopY = this._segments[0].stop.y * constants.BLOCK_WIDTH - this._yOffset;
        const w = this._thickness * constants.BLOCK_WIDTH;
        const h = this._thickness * constants.BLOCK_WIDTH;
        // Determine 'In-between' coordinates - top left corner is the same regardless of orientation
        let bX = Math.min(startX, stopX);
        let bY = Math.min(startY, stopY);
        let bW = 0;
        let bH = 0;
        // Height and width depend on orientation
        if (this._orientation === "vertical") {
            bX += 4;                        //  Make the pipe slightly less than a whole grid space in width
            bW = this._thickness * constants.BLOCK_WIDTH - 8;
            bH = Math.abs(startY - stopY);
        } else {
            bY += 4;                        //  Make the pipe slightly less than a whole grid space in width
            bW = Math.abs(startX - stopX);
            bH = this._thickness * constants.BLOCK_WIDTH - 8;
        }
        // In-between segment
        p5.fill(constants.GRAY_MEDIUM);
        p5.strokeWeight(1);
        p5.stroke(constants.ALMOST_BLACK);
        p5.rect(bX, bY, bW, bH);
        // Endpoints
        p5.fill(this._color);
        p5.strokeWeight(2);
        p5.stroke(constants.ALMOST_BLACK);
        p5.rect(startX, startY, w, h);
        p5.rect(stopX, stopY, w, h);
        p5.fill(constants.GREEN_DARK);
        p5.ellipse(startX + constants.BLOCK_WIDTH / 2, startY + constants.BLOCK_WIDTH / 2, this._thickness * constants.BLOCK_WIDTH / 2);
        p5.ellipse(stopX + constants.BLOCK_WIDTH / 2, stopY + constants.BLOCK_WIDTH / 2, this._thickness * constants.BLOCK_WIDTH / 2);
    }

    render = (p5: P5, xOffset: number) => {
        this._xOffset = xOffset;    // Offset is in terms of pixels
        if (this._connectorInfo.name === "Ladder") {
            this.renderLadder(p5);
        } else {
            this.renderDuct(p5);
        }
    }

}