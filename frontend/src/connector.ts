// The Module class represents the basic building block of the colony; roughly speaking, one room or compartment
import P5 from "p5";
import { ConnectorInfo } from "./server_functions";
import { constants } from "./constants";

export default class Connector {
    // Block types:
    _p5: P5;
    _x: number;     // Buildings' x and y positions will be in terms of grid locations to act as fixed reference points
    _y: number;
    _connectorInfo: ConnectorInfo;
    _thickness: number;     // Width and height for connectors will vary based on length, which will be determined when the connector is placed, and thickness (which will be added soon to the connectorInfo's object shape in the backend).
    _length: number;
    _xOffset: number;   // The offset value, on the other hand, will be in terms of pixels, to allow for smoother scrolling
    _yOffset: number;
    _color: string;

    constructor(p5: P5, x: number, y: number, connectorInfo: ConnectorInfo) {
        this._p5 = p5;
        this._x = x;
        this._y = y;
        this._connectorInfo = connectorInfo;
        this._thickness = constants.BLOCK_WIDTH * 0.75;    // TODO: Replace width with 'thickness' in the backend
        this._length = constants.BLOCK_WIDTH * 1.5;        // so that either value here can be horizontal/vertical
        this._xOffset = 0;
        this._yOffset = 0;
        // Determined by matching block type to entry in the blocktionary:
        this._color = constants.EGGSHELL    // Default value for now; in the future modules will be of no specific color: ;
    }

    render = (xOffset: number) => {    // TODO: Block gets y offset values as arguments to renderer
        this._xOffset = xOffset;    // Offset is in terms of pixels
        // HERE IS WHERE X AND Y COORDINATES ARE CONVERTED TO PIXEL VALUES:
        const x = this._x * constants.BLOCK_WIDTH - this._xOffset;
        const y = this._y * constants.BLOCK_WIDTH - this._yOffset;
        this._p5.fill(this._color);
        this._p5.strokeWeight(2);
        this._p5.stroke(constants.ALMOST_BLACK);
        this._p5.rect(x, y, this._thickness, this._length);
    }

}