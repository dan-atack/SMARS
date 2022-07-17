// The ModuleData class handles all of the data processing for the module class, without any of the rendering tasks
import { ModuleInfo } from "./server_functions";
import { constants } from "./constants";

export default class ModuleData {
    // Module Data types
    _x: number;     // Buildings' x and y positions will be in terms of grid locations to act as fixed reference points
    _y: number;
    _moduleInfo: ModuleInfo;
    _width: number;     // Width and height are in terms of blocks (grid spaces), not pixels
    _height: number;
    _xOffset: number;   // The offset value, on the other hand, will be in terms of pixels, to allow for smoother scrolling
    _yOffset: number;
    _color: string;
    _isRendered: boolean;

    constructor(x: number, y: number, moduleInfo: ModuleInfo) {
        this._x = x;
        this._y = y;
        this._moduleInfo = moduleInfo;
        this._width = this._moduleInfo.width;       // Width and height are in terms of grid spaces, not pixels!
        this._height = this._moduleInfo.height;
        this._xOffset = 0;
        this._yOffset = 0;
        // Determined by matching block type to entry in the blocktionary:
        this._color = constants.ALMOST_BLACK    // Default value for now; in the future modules will be of no specific color
        this._isRendered = false;
    }

    
}