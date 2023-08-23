// The pre-game (And in-game??) minimap module:
import P5 from "p5"
import { constants } from "./constants";

export default class Minimap {
    // Minimap class types
    _x: number;
    _y: number;
    _terrain: number[][];
    _columnWidth: number;

    constructor(x: number, y: number, terrain: number[][]) {
        this._x = x;
        this._y = y;
        this._terrain = terrain;
        this._columnWidth = 4   // Width in pixels of each 'block' in the minimap
    }

    loadTerrain = () => {
        // TODO: Use this instead of the updater in the Engine's setup routine
    }

    updateTerrain = (terrain: number[][]) => {
        this._terrain = terrain;
    }

    render = (p5: P5) => {
        p5.stroke(constants.GREEN_DARK);
        p5.fill(constants.APP_BACKGROUND);
        p5.rect(this._x - 16, this._y - 128, 256, 128, 12, 12, 12, 12);
        p5.fill(constants.GREEN_TERMINAL);
        p5.noStroke();
        // Start rendering columns at this.x:
        this._terrain.forEach((column, idx) => {
            if (idx < 55) {     // Limit max width of map preview so it doesn't spill out of its frame
                p5.rect(this._x + this._columnWidth * idx, this._y, this._columnWidth, - column.length * this._columnWidth);
            }
        })
    }
}