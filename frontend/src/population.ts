// The Population class is the disembodied list of all your colonists, and the functions for updating them.
import P5 from "p5";
import Colonist from "./colonist";
import { constants } from "./constants";

export default class Population {
    // Population types:
    _p5: P5;
    _colonists: Colonist[];
    _xOffset: number;           // Needed for colonist render functions

    constructor(p5: P5) {
        this._p5 = p5;
        this._colonists = [];       // Default population is zero.
        this._xOffset = 0;          // Default position is the left edge of the world.
    }

    addColonist = (x: number, y: number) => {
        const colonist = new Colonist(this._p5, x, y);
        this._colonists.push(colonist);
    }

    // Master updater function for controlling all individual colonist updater methods:
    // Needs terrain info for position updates (every minute), a boolean for whether to update colonists' needs (every hour), and the Engine's game speed, express as the number of ticks (frames) per minute
    updateColonists = (terrain: number[][], needs: boolean) => {
        this.updateColonistPositions(terrain);              // Should happen once every minute
        if (needs) this.updateColonistNeedsAndGoals(terrain);      // Should happen once every hour
    }

    updateColonistPositions = (terrain: number[][]) => {
        // For each colonist, isolate the 3 terrain columns around them:
        this._colonists.forEach((colonist) => {
            let cols: number[][] = [terrain[colonist._x]];
            // If colonist is next to the right or left edge of the map, only return 2 columns:
            if (colonist._x > 0) {
                cols.unshift(terrain[colonist._x - 1]); // Push leftward column to the START of the array
            }
            if (colonist._x < terrain.length - 1) {
                cols.push(terrain[colonist._x + 1]);
            }
            // The colonists' movement functions will be controlled indirectly by the goal status checker
            colonist.checkGoalStatus(cols, terrain.length - 1);
        })
    }

    updateColonistNeedsAndGoals = (terrain: number[][]) => {
        this._colonists.forEach((colonist) => {
            colonist.updateNeedsAndGoals(terrain.length - 1);
        })
    }

    // Gets horizontal offset and fps (game speed) data from the Engine's render method
    render = (xOffset: number, fps: number, gameOn: boolean) => {
        const p5 = this._p5;
        this._xOffset = xOffset;
        this._colonists.forEach((colonist) => {
            colonist.render(this._xOffset, fps, gameOn);
        })
    }

}