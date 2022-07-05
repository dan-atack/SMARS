// The Module class represents the basic building block of the colony; roughly speaking, one room or compartment
import P5 from "p5";
import ConnectorData, { Coords } from "./connectorData";
import { ConnectorInfo } from "./server_functions";
import { constants } from "./constants";

export default class Connector {
    // Block types:
    _p5: P5;
    _data: ConnectorData;
    _color: string;

    constructor(p5: P5, start: Coords, stop: Coords, connectorInfo: ConnectorInfo) {
        this._p5 = p5;
        this._data = new ConnectorData(start, stop, connectorInfo);
        this._color = constants.EGGSHELL    // Default value for now; in the future modules will be of no specific color: ;
    }

    render = (xOffset: number) => {    // TODO: Block gets y offset values as arguments to renderer
        const p5 = this._p5;
        this._data._xOffset = xOffset;    // Offset is in terms of pixels
        // HERE IS WHERE START AND STOP COORDINATES (AND THICKNESS AND LENGTH ARE CONVERTED TO PIXEL VALUES:
        const startX = this._data._segments[0].start.x * constants.BLOCK_WIDTH - this._data._xOffset;
        const startY = this._data._segments[0].start.y * constants.BLOCK_WIDTH - this._data._yOffset;
        const stopX = this._data._segments[0].stop.x * constants.BLOCK_WIDTH - this._data._xOffset;
        const stopY = this._data._segments[0].stop.y * constants.BLOCK_WIDTH - this._data._yOffset;
        const w = this._data._thickness * constants.BLOCK_WIDTH;
        const h = this._data._length * constants.BLOCK_WIDTH;
        p5.fill(constants.BLUE_ICE);
        p5.strokeWeight(1);
        p5.stroke(constants.ALMOST_BLACK);
        // Render 'inbetween' section here
        // Determine dimensions for rendering - top left corner is the same regardless of orientation
        const bX = Math.min(startX, stopX);
        const bY = Math.min(startY, stopY);
        let bW = 0;
        let bH = 0;
        // Height and width depend on orientation
        if (this._data._orientation === "vertical") {
            bW = this._data._thickness * constants.BLOCK_WIDTH;
            bH = Math.abs(startY - stopY);
        } else {
            bW = Math.abs(startX - stopX);
            bH = this._data._thickness * constants.BLOCK_WIDTH;
        }
        p5.rect(bX, bY, bW, bH);
        p5.fill(this._color);
        p5.strokeWeight(2);
        p5.stroke(constants.ALMOST_BLACK);
        p5.rect(startX, startY, w, h);
        p5.rect(stopX, stopY, w, h);
        p5.text(bX, 20, 160);
        p5.text(bY, 20, 180);
        p5.text(bW, 20, 200);
        p5.text(bH, 20, 220);
    }

}