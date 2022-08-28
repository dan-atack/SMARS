// The Population class is the disembodied list of all your colonists, and the functions for updating them.
import P5 from "p5";
import Colonist, { ColonistSaveData } from "./colonist";

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
    // Needs terrain info for position updates (every minute), and a boolean for whether to update colonists' needs (every hour)
    updateColonists = (terrain: number[][], needs: boolean) => {
        this.updateColonistPositions(terrain);              // Should happen once every minute
        if (needs) this.updateColonistNeedsAndGoals(terrain);      // Should happen once every hour
    }

    updateColonistPositions = (terrain: number[][]) => {
        // For each colonist, isolate the 3 terrain columns around them:
        this._colonists.forEach((colonist) => {
            let cols: number[][] = [terrain[colonist._data._x]];
            // If colonist is next to the right or left edge of the map, only return 2 columns:
            if (colonist._data._x > 0) {
                cols.unshift(terrain[colonist._data._x - 1]); // Push leftward column to the START of the array
            }
            if (colonist._data._x < terrain.length - 1) {
                cols.push(terrain[colonist._data._x + 1]);
            }
            // The colonists' movement functions will be controlled indirectly by the goal status checker
            colonist._data.checkGoalStatus(cols, terrain.length - 1);
        })
    }

    updateColonistNeedsAndGoals = (terrain: number[][]) => {
        this._colonists.forEach((colonist) => {
            colonist._data.updateNeedsAndGoals(terrain.length - 1);
        })
    }

    calculatePopulationResourceConsumption = (hour: number) => {
        const air = this._colonists.length;
        const water = this._colonists.length;
        let food = 0;
        if (hour % 8 === 0) food = this._colonists.length;
        return { air, water, food };
    }

    prepareColonistSaveData = () => {
        const colonistData: ColonistSaveData[] = [];
        this._colonists.forEach((colonist) => {
            const d: ColonistSaveData = {
                x: colonist._data._x,
                y: colonist._data._y,
                needs: colonist._data._needs,
                goal: colonist._data._currentGoal,
                actionStack: colonist._data._actionStack,
                actionTimeElapsed: colonist._data._actionTimeElapsed,
                isMoving: colonist._data._isMoving,
                movementType: colonist._data._movementType,
                movementCost: colonist._data._movementCost,
                movementProg: colonist._data._movementProg,
                movementDest: colonist._data._movementDest,
                facing: colonist._data._facing
            };
            colonistData.push(d);
        })
        return colonistData;
    }

    loadColonistData = (data: ColonistSaveData[]) => {
        if (data) {
            data.forEach((colonist) => {
                const c = new Colonist(this._p5, colonist.x, colonist.y, colonist);
                this._colonists.push(c);
            });
        } else {
            console.log("No colonist data in save file.");
        }
    }

    // Gets horizontal offset and fps (game speed) data from the Engine's render method
    render = (xOffset: number, fps: number, gameOn: boolean) => {
        this._xOffset = xOffset;
        this._colonists.forEach((colonist) => {
            colonist.render(this._xOffset, fps, gameOn);
        })
    }

}