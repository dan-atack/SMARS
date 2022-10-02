// The ConnectorData class handles all of the data processing for the Connector class, without any of the rendering tasks
import { ConnectorInfo } from "./server_functions";

// Useful shorthand / standardization technique
export type Coords = {
    x: number,          // Representing grid locations, not pixels
    y: number
}

export default class ConnectorData {
    // Connector data types:
    _id: number;                // Unique ID from the Infra class
    _segments: {start: Coords, stop: Coords}[]; // Positions are given by a list of segments, each with start/stop coords.
    _length: number;        // Determined, along with orientation, from the start/stop coordinates
    _orientation: string;   // "vertical" or "horizontal"
    _leftEdge: number;      // To help with Infra class's rendering cutoff
    _rightEdge: number;
    _connectorInfo: ConnectorInfo;
    _thickness: number;     // Width and height for connectors will vary based on length, which will be determined when the connector is placed, and thickness (which will be added soon to the connectorInfo's object shape in the backend).
    _groundZoneId: string;   // Keeps track of whether a transit-style connector is on the ground
    _xOffset: number;   // The offset value, on the other hand, will be in terms of pixels, to allow for smoother scrolling
    _yOffset: number;

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
        this._thickness = this._connectorInfo.width;   // All dimensions (including segment coords) are in terms of grid positions
        this._groundZoneId = "";
        this._xOffset = 0;
        this._yOffset = 0;
    }

    // For transport type connectors, see if they touch the ground and record the zone data if so
    setGroundZoneId = (id: string) => {
        this._groundZoneId = id;
    }

}