// The Population class is the disembodied list of all your colonists, and the functions for updating them.
import P5 from "p5";
import Colonist, { ColonistSaveData } from "./colonist";
import { Coords } from "./connectorData";
import Infrastructure from "./infrastructure";
import Map from "./map";

export default class Population {
    // Population types:
    _colonists: Colonist[];
    _colonistsCurrentSerial: number;    // Needed to individually tag colonists when they are created
    _xOffset: number;                   // Needed for colonist render functions

    constructor() {
        this._colonists = [];                   // Default population is zero.
        this._colonistsCurrentSerial = 9000;    // Colonists are from the 9000 series!
        this._xOffset = 0;                      // Default position is the left edge of the world.
    }

    // SECTION 1: ADDING POPULATION (COLONISTS)

    addColonist = (x: number, y: number) => {
        const id = this._colonistsCurrentSerial;
        const colonist = new Colonist(id, x, y);
        this._colonistsCurrentSerial++; // Increment ID number for the next colonist
        this._colonists.push(colonist);
    }

    // SECTION 2: COLONIST UPDATERS

    // Master updater function for controlling all individual colonist updater methods:
    // Needs terrain info for position updates (every minute), and a boolean for whether to update colonists' needs (every hour)
    updateColonists = (needs: boolean, infra: Infrastructure, map: Map) => {
        // Every minute:
        this.handleColonistMinutelyUpdates(infra, map);              // Should happen once every minute
        // Every hour:
        if (needs) this.handleColonistHourlyUpdates(infra, map);      // Should happen once every hour
    }

    // Passes terrain info to each colonist and then checks if they have achieved their current goal
    handleColonistMinutelyUpdates = (infra: Infrastructure, map: Map) => {
        // For each colonist, isolate the 3 terrain columns around them:
        const terrain = map._data._mapData;
        this._colonists.forEach((colonist) => {
            let cols: number[][] = [terrain[colonist._data._x]];
            // If colonist is next to the right or left edge of the map, only return 2 columns:
            if (colonist._data._x > 0) {
                cols.unshift(terrain[colonist._data._x - 1]); // Push leftward column to the START of the array
            }
            if (colonist._data._x < terrain.length - 1) {
                cols.push(terrain[colonist._data._x + 1]);
            }
            // Pass all info to the colonist's minutely update handler
            colonist._data.handleMinutelyUpdates(cols, infra, map);
        })
    }

    handleColonistHourlyUpdates = (infra: Infrastructure, map: Map) => {
        this._colonists.forEach((colonist) => {
            colonist._data.handleHourlyUpdates(infra, map);
        })
    }

    // SECTION 3: COLONIST INFO API (GETTER FUNCTIONS)

    getColonistDataFromCoords = (coords: Coords) => {
        const colonists = this._colonists.find((col) => {
            return col._data._x === coords.x && (col._data._y === coords.y || col._data._y === coords.y - 1)
        });
        if (colonists) {
            return colonists;
        } else {
            return null;    // If no colonist is found return a null
        }
    }

    // SECTION 4: COLONIST SAVE/LOAD DATA MANAGEMENT

    prepareColonistSaveData = () => {
        const colonistData: ColonistSaveData[] = [];
        this._colonists.forEach((colonist) => {
            const d: ColonistSaveData = {
                id: colonist._data._id,
                x: colonist._data._x,
                y: colonist._data._y,
                needs: colonist._data._needs,
                goal: colonist._data._currentGoal,
                currentAction: colonist._data._currentAction,
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
            data.forEach((colonistData) => {
                const c = new Colonist(colonistData.id, colonistData.x, colonistData.y, colonistData);
                this._colonists.push(c);
                // Keep track of saved colonists' serials so that newer colonists can resume the series
                this._colonistsCurrentSerial = colonistData.id + 1;
            });
        } else {
            console.log("No colonist data in save file.");
        }
    }

    // Gets horizontal offset and fps (game speed) data from the Engine's render method
    render = (p5: P5, xOffset: number, fps: number, gameOn: boolean) => {
        this._xOffset = xOffset;
        this._colonists.forEach((colonist) => {
            colonist.render(p5, this._xOffset, fps, gameOn);
        })
    }

}