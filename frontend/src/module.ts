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
    _isRendered: boolean;

    constructor(p5: P5, x: number, y: number, moduleInfo: ModuleInfo) {
        this._p5 = p5;
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

    render = (xOffset: number) => {    // TODO: Block gets y offset values as arguments to renderer
        const p5 = this._p5;
        this._xOffset = xOffset;    // Offset is in terms of pixels
        // HERE IS WHERE X AND Y COORDINATES AND WIDTH AND HEIGHT ARE CONVERTED TO PIXEL VALUES:
        const x = this._x * constants.BLOCK_WIDTH - this._xOffset;
        const y = this._y * constants.BLOCK_WIDTH - this._yOffset;
        const w = this._width * constants.BLOCK_WIDTH;
        const h = this._height * constants.BLOCK_WIDTH;
        this._p5.fill(this._color);
        this._p5.strokeWeight(2);
        this._p5.stroke(constants.ALMOST_BLACK);
        if (this._moduleInfo.shapes != undefined) {
            this._moduleInfo.shapes.forEach((shape) => {
                const p = shape.params;
                const b = constants.BLOCK_WIDTH;
                p5.fill(shape.color);
                switch (shape.shape) {
                    case "triangle":
                        p5.triangle(p[0] * b + x, p[1] * b + y, p[2] * b + x, p[3] * b + y, p[4] * b + x, p[5] * b + y);
                        break;
                    case "rect":
                        if (shape.params.length === 4) {
                            p5.rect(p[0] * b + x, p[1] * b + y, p[2] * b, p[3] * b);
                        } else {
                            p5.rect(p[0] * b + x, p[1] * b + y, p[2] * b, p[3] * b, p[4] * b, p[5] * b, p[6] * b, p[7] * b);    // Rounded corners
                        }
                        break;
                    case "quad":
                        p5.quad(p[0] * b + x, p[1] * b + y, p[2] * b + x, p[3] * b + y, p[4] * b + x, p[5] * b + y, p[6] * b + x, p[7] * b + y);
                        break;
                    case "ellipse":
                        p5.ellipse(p[0] * b + x, p[1] * b + y, p[2] * b, p[3] ? p[3] * b : p[2] * b);
                        break;
                    case "arc":
                        let mode: any;
                        if (shape.mode === "OPEN") {
                            mode = this._p5.OPEN;
                        } else if (shape.mode === "PIE") {
                            mode = this._p5.PIE;
                        } else if (shape.mode = "CHORD") {
                            mode = this._p5.CHORD;
                        }
                        p5.arc(p[0] * b + x, p[1] * b + y, p[2] * b, p[3] * b, p[4], p[5], mode);
                        break;
                }
            })
        } else {
            p5.rect(x, y, w, h);    // If no image is provided, render a black box:
        }
    }

}