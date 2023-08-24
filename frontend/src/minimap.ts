// The pre-game (And in-game??) minimap module:
import P5 from "p5"
import { constants } from "./constants";

export default class Minimap {
    // Minimap class types
    _x: number;
    _y: number;
    _w: number;             // Use default value of 256 width for now
    _h: number;             // Use default value of 128 height for now
    _label: string;         // Either 'Map Preview' or 'Minimap' depending on whether it's part of the New Game screen or the Sidebar
    _terrain: number[];
    _columnsPerPixel: number; // Width in pixels to display for each map column

    constructor(x: number, y: number, label: string) {
        this._x = x;
        this._y = y;
        this._w = 256;
        this._h = 128;
        this._label = label;
        this._terrain = [];         // Wait for terrain data to be loaded by the setup method
        this._columnsPerPixel = 1;    // Default value of 1 pixel per map column
    }

    // Takes the map terrain data from the NewGameSetup / Map component and converts it to a topography-like list of elevation numbers
    setup = (terrain: number[][]) => {
        this._terrain = [];         // Reset terrain every time setup is called
        terrain.forEach((col) => {
            this._terrain.push(col.length);
        })
        this.determineDisplayWidth();
    }

    // Determines how many lines to render (or skip) based on the map's width
    determineDisplayWidth = () => {
        this._columnsPerPixel = this._terrain.length / this._w;
        console.log(`Map display ratio: ${this._columnsPerPixel}`)
    }

    // Used to update terrain / infra displays after the game has started
    updateTerrain = (terrain: number[][]) => {
        //
    }

    render = (p5: P5) => {
        p5.stroke(constants.GREEN_DARK);
        p5.fill(constants.APP_BACKGROUND);
        p5.rect(this._x - 2, this._y - this._h - 2, this._w + 2, this._h + 4);      // Add a tiny buffer to the edges of the container
        p5.fill(constants.GREEN_TERMINAL);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(24);
        p5.text(this._label, this._x + (this._w / 2), this._y - this._h * 1.25);
        p5.stroke(constants.GREEN_TERMINAL);
        // Start rendering columns as lines:
        let p = 0;  // Keep track of which pixel is being rendered
        this._terrain.forEach((column, idx) => {
           // if (idx < 255) {     // Limit max width so minimap doesn't spill out of its frame
                if (idx >= p) {
                    const x = Math.floor(this._x + idx / this._columnsPerPixel);
                    const yBase = this._y;
                    p5.line(x, yBase, x, yBase - (column * 2));
                    p += this._columnsPerPixel;
                }   
          //  }
        })
    }
}