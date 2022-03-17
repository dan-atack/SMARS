// The Module class represents the basic building block of the colony; roughly speaking, one room or compartment
import P5 from "p5";
import { ModuleInfo } from "./server_functions";
import { constants } from "./constants";

export default class Module {
    // Block types:
    _p5: P5;
    _x: number;     // Buildings' x and y positions will be in terms of grid locations to act as fixed reference points
    _y: number;
    _moduleInfo: ModuleInfo;
    _width: number;     // Width and height are in terms of blocks (grid spaces), not pixels
    _height: number;
    _xOffset: number;   // The offset value, on the other hand, will be in terms of pixels, to allow for smoother scrolling
    _yOffset: number;
    _color: string;

    constructor(p5: P5, x: number, y: number, moduleInfo: ModuleInfo) {
        this._p5 = p5;
        this._x = x;
        this._y = y;
        this._moduleInfo = moduleInfo;
        this._width = this._moduleInfo.width * constants.BLOCK_WIDTH;
        this._height = this._moduleInfo.height * constants.BLOCK_WIDTH;
        this._xOffset = 0;
        this._yOffset = 0;
        // Determined by matching block type to entry in the blocktionary:
        this._color = constants.ALMOST_BLACK    // Default value for now; in the future modules will be of no specific color
    }

    render = (xOffset: number) => {    // TODO: Block gets y offset values as arguments to renderer
        this._xOffset = xOffset;
        const x = this._x * this._width - this._xOffset;
        const y = this._y * this._width - this._yOffset;
        this._p5.fill(this._color);
        this._p5.strokeWeight(2);
        this._p5.stroke(constants.ALMOST_BLACK);
        this._p5.rect(x, y, this._width, this._height);
    }

}