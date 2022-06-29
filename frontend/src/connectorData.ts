// The ConnectorData class handles all of the data processing for the Connector class, without any of the rendering tasks
import { constants } from "./constants";
import { ConnectorInfo } from "./server_functions";

// Useful shorthand / standardization technique
export type Coords = {
    x: number,
    y: number
}

export default class ConnectorData {
    // Connector data types:
    _x: number;     // Buildings' x and y positions will be in terms of grid locations to act as fixed reference points
    _y: number;
    _segments: {start: Coords, stop: Coords}[];    // New way of positioning Connectors will involve a list of segments, each with start/stop coords.
    _connectorInfo: ConnectorInfo;
    _thickness: number;     // Width and height for connectors will vary based on length, which will be determined when the connector is placed, and thickness (which will be added soon to the connectorInfo's object shape in the backend).
    _length: number;
    _xOffset: number;   // The offset value, on the other hand, will be in terms of pixels, to allow for smoother scrolling
    _yOffset: number;

    constructor(x: number, y: number, connectorInfo: ConnectorInfo) {
        this._x = x;
        this._y = y;
        this._segments = [{start: {x: x, y: y}, stop: {x: x, y: y}}];   // Just for now, start and stop can overlap
        this._connectorInfo = connectorInfo;
        this._thickness = 1;
        this._length = 1;
        this._xOffset = 0;
        this._yOffset = 0;
    }
}