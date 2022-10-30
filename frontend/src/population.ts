// The Population class is the disembodied list of all your colonists, and the functions for updating them.
import P5 from "p5";
import { constants } from "./constants";
import Colonist, { ColonistSaveData } from "./colonist";
import { Coords } from "./connector";
import Infrastructure from "./infrastructure";
import Map from "./map";

export default class Population {
    // Population types:
    _colonists: Colonist[];
    _colonistsCurrentSerial: number;    // Needed to individually tag colonists when they are created (starts at zero)
    _colonistSerialBase: number;        // Serial base = the large number added to the current serial index (Which starts at zero)

    constructor() {
        this._colonists = [];                   // Default population is zero.
        this._colonistsCurrentSerial = 0;       // Current serial always starts at zero
        this._colonistSerialBase = 9000;        // Colonists are from the 9000 series!

    }

    // SECTION 1: ADDING POPULATION (COLONISTS)

    // Note: When altering this, consider if changes need to be mirrored in the loadColonistData method in Section 5
    addColonist = (x: number, y: number) => {
        const id = this._colonistsCurrentSerial + this._colonistSerialBase;
        const name = this.makeColonistName();
        const colonist = new Colonist(id, name, x, y);
        this._colonistsCurrentSerial++; // Increment ID number for the next colonist
        this._colonists.push(colonist);
    }

    makeColonistName = () => {
        const idx = this._colonistsCurrentSerial % constants.colonistNames.length;  // Ensure index is always inside the array
        const first = constants.colonistNames[idx];
        const rando = Math.floor(Math.random() * constants.colonistLastNames.length);   // Get random last name
        const last = constants.colonistLastNames[rando];
        return `${first} ${last}`;
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
        const terrain = map._mapData;
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

    // SECTION 3: COLONIST ROLE MANAGEMENT

    assignColonistRole = (colonistID: number, role: [string, number]) => {
        const colonist = this._colonists.find((col) => col._data._id === colonistID);
        if (colonist) {
            colonist._data.setRole(role);
        } else {
            console.log(`Error: Colonist ${colonistID} could not be assigned role: ${role[0]}. Reason: Colonist ID not found in Population array`);
            return null;
        }
    }

    // SECTION 4: COLONIST INFO API (GETTER FUNCTIONS)

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

    // SECTION 5: COLONIST SAVE/LOAD DATA MANAGEMENT

    prepareColonistSaveData = () => {
        const colonistData: ColonistSaveData[] = [];
        this._colonists.forEach((colonist) => {
            const d: ColonistSaveData = {
                id: colonist._data._id,
                name: colonist._data._name,
                x: colonist._data._x,
                y: colonist._data._y,
                role: colonist._data._role,
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
                const c = new Colonist(colonistData.id, colonistData.name ? colonistData.name : this.makeColonistName(), colonistData.x, colonistData.y, colonistData);
                this._colonists.push(c);
                // Increase colonist serial number when each colonist is loaded, to prevent duplicate serials
                this._colonistsCurrentSerial++;
            });
        } else {
            console.log("Warning: No colonist data in save file.");
        }
    }

    // Gets horizontal offset and fps (game speed) data from the Engine's render method
    render = (p5: P5, xOffset: number, fps: number, gameOn: boolean) => {
        this._colonists.forEach((colonist) => {
            colonist.render(p5, xOffset, fps, gameOn);
        })
    }

}