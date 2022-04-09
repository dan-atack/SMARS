// The Map class represents the terrain in the game's world:
import P5 from "p5";
import Block from "./block";
import { constants } from "./constants";

export default class Map {
    // Map types:
    _p5: P5;
    _mapData: number[][];
    _horizontalOffset: number;  // Value is in pixels
    _maxOffset: number;         // Farthest scroll distance, in pixels
    _columns: Block[][];

    constructor(p5: P5) {
        this._p5 = p5;
        this._mapData = []; // Map data is recieved by setup function
        this._horizontalOffset = 0;
        this._maxOffset = 0;    // Determined during setup routine
        this._columns = [];
    }

    //  NOTE TO FUTURE SELF: When terrain is destroyed or modified, make sure the this._mapData is updated as well

    // The Engine passes the H-offset (V-offset coming soon) value here so that the blocks' positions are updated with every render:
    render = (horizontalOffset: number) => {
        this._horizontalOffset = horizontalOffset;
        // Only render one screen width's worth, taking horizontal offset into account:
        const leftEdge = Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH);    // Edges are in terms of columns
        const rightEdge = (this._horizontalOffset + constants.WORLD_VIEW_WIDTH) / constants.BLOCK_WIDTH;
        this._columns.forEach((column, idx) => {
            if (idx >= leftEdge && idx < rightEdge)
            column.forEach((block) => {
                block.render(this._horizontalOffset);     // TODO: Pass offset values to the blocks here
            })
        })
    }

    // Initial terrain setup (Blockland style but with array for columns list as well as for blocks within a column)
    setup = (mapData: number[][]) => {
        this._mapData = mapData;
        this._maxOffset = mapData.length * constants.BLOCK_WIDTH - constants.WORLD_VIEW_WIDTH;
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