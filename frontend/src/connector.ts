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

    renderLadder = () => {
        const p5 = this._p5;
        // Only one x coordinate on a vertical connector - the x2 coordinate is simply the right bar's location
        const x = this._data._segments[0].start.x * constants.BLOCK_WIDTH - this._data._xOffset + 2;
        const x2 = x + constants.BLOCK_WIDTH - 2;
        // Convert y coordinates into top/bottom values since start/stop don't always progress in the same direction
        const top = (Math.min(this._data._segments[0].start.y, this._data._segments[0].stop.y)) * constants.BLOCK_WIDTH - this._data._yOffset;
        const bottom = (Math.max(this._data._segments[0].start.y, this._data._segments[0].stop.y) + 1) * constants.BLOCK_WIDTH - this._data._yOffset;
        // Side bars
        p5.strokeWeight(5);
        p5.stroke(constants.ALMOST_BLACK);
        p5.line(x, top, x, bottom);
        p5.line(x2, top, x2, bottom);
        // Rungs
        p5.strokeWeight(4);
        for (let i = 0; i <= this._data._length + 1; i += 0.4) {
            p5.line(x, top + (i * constants.BLOCK_WIDTH), x2, top + (i * constants.BLOCK_WIDTH))
        }
    }

    renderDuct = () => {
        // For convenience
        const p5 = this._p5;
        const bw = constants.BLOCK_WIDTH;
        // Endpoint coordinates
        const startX = this._data._segments[0].start.x * constants.BLOCK_WIDTH - this._data._xOffset;
        const startY = this._data._segments[0].start.y * constants.BLOCK_WIDTH - this._data._yOffset;
        const stopX = this._data._segments[0].stop.x * constants.BLOCK_WIDTH - this._data._xOffset;
        const stopY = this._data._segments[0].stop.y * constants.BLOCK_WIDTH - this._data._yOffset;
        const w = this._data._thickness * constants.BLOCK_WIDTH;
        const h = this._data._thickness * constants.BLOCK_WIDTH;
        // Determine 'In-between' coordinates - top left corner is the same regardless of orientation
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
        p5.fill(constants.GRAY_MEDIUM);
        p5.strokeWeight(1);
        p5.stroke(constants.ALMOST_BLACK);
        p5.rect(bX, bY, bW, bH);
        p5.fill(this._color);
        p5.strokeWeight(2);
        p5.stroke(constants.ALMOST_BLACK);
        // Endpoints
        p5.rect(startX, startY, w, h);
        p5.rect(stopX, stopY, w, h);
        p5.ellipse(startX + constants.BLOCK_WIDTH / 2, startY + constants.BLOCK_WIDTH / 2, this._data._thickness * constants.BLOCK_WIDTH / 2);
        p5.ellipse(stopX + constants.BLOCK_WIDTH / 2, stopY + constants.BLOCK_WIDTH / 2, this._data._thickness * constants.BLOCK_WIDTH / 2);
    }

    render = (xOffset: number) => {    // TODO: Block gets y offset values as arguments to renderer
        const p5 = this._p5;
        this._data._xOffset = xOffset;    // Offset is in terms of pixels
        if (this._data._connectorInfo.name === "Ladder") {
            this.renderLadder();
        } else {
            this.renderDuct();
        }
        // p5.text(this._data._length, 20, 160);
    }

}