// The Map class represents the terrain in the game's world:
import P5 from "p5";
import Block from "./block";
import MapData from "./mapData";
import { constants } from "./constants";

export default class Map {
    // Map types:
    // TODO: Re-unify the map class with its data
    _data: MapData;

    constructor() {
        this._data = new MapData();
    }

    setup = (p5: P5, mapData: number[][]) => {
        this._data.setup(p5, mapData)
    }

    setExpanded = (expanded: boolean) => {
        this._data.setExpanded(expanded);
    }

    determineFlatness = (start: number, stop: number) => {
        return this._data.determineFlatness(start, stop);
    }

    // The Engine passes the H-offset (V-offset coming soon) value here so that the blocks' positions are updated with every render; if the sidebar is open then compact = true, causing a smaller area of the map to be shown:
    render = (p5: P5, horizontalOffset: number) => {
        this._data._horizontalOffset = horizontalOffset;
        // Only render one screen width's worth, taking horizontal offset into account:
        const leftEdge = Math.floor(this._data._horizontalOffset / constants.BLOCK_WIDTH);    // Edges are in terms of columns
        let rightEdge = 0;
        if (this._data._expanded) {
            rightEdge = (this._data._horizontalOffset + constants.SCREEN_WIDTH) / constants.BLOCK_WIDTH;
        } else {
            rightEdge = (this._data._horizontalOffset + constants.WORLD_VIEW_WIDTH) / constants.BLOCK_WIDTH;
        }
        this._data._columns.forEach((column, idx) => {
            if (idx >= leftEdge && idx < rightEdge)
            column.forEach((block) => {
                block.render(this._data._horizontalOffset);     // TODO: Pass offset values to the blocks here
            })
        })
    }

}