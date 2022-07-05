// The ConnectorData class handles all of the data processing for the Connector class, without any of the rendering tasks
import { constants } from "./constants";
import { ConnectorInfo } from "./server_functions";

// Useful shorthand / standardization technique
export type Coords = {
    x: number,          // Representing grid locations, not pixels
    y: number
}

export default class ConnectorData {
    // Connector data types:
    // Connectors' positions are given by a list of segments, each with start/stop coords.
    _segments: {start: Coords, stop: Coords}[];
    _orientation: string;   // "vertical" or "horizontal"
    _connectorInfo: ConnectorInfo;
    _thickness: number;     // Width and height for connectors will vary based on length, which will be determined when the connector is placed, and thickness (which will be added soon to the connectorInfo's object shape in the backend).
    _length: number;
    _xOffset: number;   // The offset value, on the other hand, will be in terms of pixels, to allow for smoother scrolling
    _yOffset: number;

    constructor(start: Coords, stop: Coords, connectorInfo: ConnectorInfo) {
        this._segments = [{start: start, stop: stop}];      // Two sets of coordinates - possibly overlapping
        this._connectorInfo = connectorInfo;
        // Determine orientation
        this._orientation = "";
        if (this._connectorInfo.vertical && this._connectorInfo.horizontal) {
            if (start.x === stop.x) {
                this._orientation = "vertical"   // Connector is vertical if start x and stop x are the same
            }
        } else if (this._connectorInfo.vertical) {
            this._orientation = "vertical";     // Connector is vertical if only that property is true
        } else {
            this._orientation = "horizontal";
        }
        this._thickness = 1;                    // All dimensions (including segment coords) are in terms of grid positions
        this._length = 1;
        this._xOffset = 0;
        this._yOffset = 0;
    }

}