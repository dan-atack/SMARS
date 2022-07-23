// The Module class represents the basic building block of the colony; roughly speaking, one room or compartment
import P5 from "p5";
import { ModuleInfo } from "./server_functions";
import ModuleData from "./moduleData";
import { constants } from "./constants";

export default class Module {
    // Block types:
    _p5: P5;
    _data: ModuleData;      // Separate date class to enable unit tests

    constructor(p5: P5, id: number, x: number, y: number, moduleInfo: ModuleInfo) {
        this._p5 = p5;
        this._data = new ModuleData(id, x, y, moduleInfo);
    }

    render = (xOffset: number) => {    // TODO: Block gets y offset values as arguments to renderer
        const p5 = this._p5;
        this._data._xOffset = xOffset;    // Offset is in terms of pixels
        // HERE IS WHERE X AND Y COORDINATES AND WIDTH AND HEIGHT ARE CONVERTED TO PIXEL VALUES:
        const x = this._data._x * constants.BLOCK_WIDTH - this._data._xOffset;
        const y = this._data._y * constants.BLOCK_WIDTH - this._data._yOffset;
        const w = this._data._width * constants.BLOCK_WIDTH;
        const h = this._data._height * constants.BLOCK_WIDTH;
        this._p5.fill(this._data._color);
        this._p5.strokeWeight(2);
        this._p5.stroke(constants.ALMOST_BLACK);
        if (this._data._moduleInfo.shapes != undefined) {
            this._data._moduleInfo.shapes.forEach((shape) => {
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