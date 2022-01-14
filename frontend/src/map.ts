// The Map class represents the terrain in the game's world:
import P5 from "p5";
import Block from "./block";
import { constants } from "./constants";

export default class Map {
    // Map types:
    _p5: P5;
    _mapData: number[][];
    _horizontalOffset: number; // Value is in pixels
    _columns: Block[][];

    constructor(p5: P5) {
        this._p5 = p5;
        this._mapData = []; // Map data is recieved by setup function
        this._horizontalOffset = 0;
        this._columns = [];
    }

    render = () => {
        // Only render one screen width's worth:
        const range = [0, constants.WORLD_VIEW_WIDTH / constants.BLOCK_WIDTH];
        this._columns.forEach((column, idx) => {
            if (idx >= range[0] && idx < range[1])
            column.forEach((block) => {
                block.render();     // TODO: Pass offset values to the blocks here
            })
        })
    }

    // Initial terrain setup (Blockland style but with array for columns list as well as for blocks within a column)
    setup = (mapData: number[][]) => {
        this._mapData = mapData;
        this._mapData.forEach((column, idx) => {
            this._columns.push([]);
            column.forEach((blockType, jdx) => {
                if (blockType != 0) {  // Ignore 'empty' blocks (ensures easy compatibility with BlockLand map editor!)
                    const x = idx;
                    const y = (constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH) - jdx - 1;
                    const protoBlock = new Block(this._p5, x, y, blockType);
                    this._columns[idx].push(protoBlock);
                }
            })
        });
    }

}