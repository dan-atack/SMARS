// The MapData class handles all of the data processing for the Map class, without any of the rendering tasks

import P5 from 'p5';
import { constants } from "./constants";
import Block from "./block";

export default class MapData {
    // Map data types:
    _mapData: number[][];
    _horizontalOffset: number;  // Value is in pixels
    _maxOffset: number;         // Farthest scroll distance, in pixels
    _columns: Block[][];
    _expanded: boolean          // Sometimes the map occupies the whole screen

    constructor() {
        this._mapData = []; // Map data is recieved by setup function
        this._horizontalOffset = 0;
        this._maxOffset = 0;    // Determined during setup routine
        this._columns = [];
        this._expanded = true; // By default the map is expanded
    }

    
    //  NOTE TO FUTURE SELF: When terrain is destroyed or modified, make sure the this._mapData is updated as well since that is where the save data is stored.

    // Initial terrain setup (Blockland style but with array for columns list as well as for blocks within a column)
    setup = (p5: P5, mapData: number[][]) => {
        this._mapData = mapData;
        if (this._expanded) {
            this._maxOffset = mapData.length * constants.BLOCK_WIDTH - constants.SCREEN_WIDTH;
        } else {
            this._maxOffset = mapData.length * constants.BLOCK_WIDTH - constants.WORLD_VIEW_WIDTH;
        }
        this._mapData.forEach((column, idx) => {
            this._columns.push([]);
            column.forEach((blockType, jdx) => {
                if (blockType != 0) {  // Ignore 'empty' blocks (ensures easy compatibility with BlockLand map editor!)
                    const x = idx;
                    const y = (constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH) - jdx - 1;
                    const protoBlock = new Block(p5, x, y, blockType);
                    this._columns[idx].push(protoBlock);
                }
            })
        });
    }

    setExpanded = (expanded: boolean) => {
        this._expanded = expanded;
        if (expanded) {
            this._maxOffset = this._mapData.length * constants.BLOCK_WIDTH - constants.SCREEN_WIDTH;
        } else {
            this._maxOffset = this._mapData.length * constants.BLOCK_WIDTH - constants.WORLD_VIEW_WIDTH;
        }
    }

    // For a given stretch of columns, do they all have the same height? Returns true for yes, false for no
    determineFlatness = (start: number, stop: number) => {
        // Ensure this works with numbers going from lower to higher, or vice versa
        const ascending = start < stop;
        let height = 0; // Set this value with the first column to be tested; if any other column is different, return false
        for (let i = start; ascending ? i < stop : i > stop; ascending ? i++ : i--) {
            // Ensure column selection is not outside the map edges:
            if (i >= 0 && i < this._columns.length) {
                // Set the first column as the measure to compare against
                if (i === start) {
                    height = this._columns[i].length;
                } else {
                    if (this._columns[i].length != height) {
                        // Area is not flat
                        // TODO: Upgrade this method's return to include failure messages
                        return false;
                    }
                }
            } else {
                // Placement is out of bounds
                // TODO: Upgrade this method's return to include failure messages
                return false;
            }
        }
        return true;    // If the method gets this far without returning false, the terrain is level
    }
    // NOTE: When adding new methods, add them to the base Map class too, and have them called from there
}