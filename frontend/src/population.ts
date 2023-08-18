// The Population class is the disembodied list of all your colonists, and the functions for updating them.
import P5 from "p5";
import { constants } from "./constants";
import Colonist, { ColonistSaveData } from "./colonist";
import { Coords } from "./connector";
import Infrastructure from "./infrastructure";
import Map from "./map";
import Industry from "./industry";

export default class Population {
    // Population types:
    _colonists: Colonist[];
    _colonistsCurrentSerial: number;    // Needed to individually tag colonists when they are created (starts at zero)
    _colonistSerialBase: number;        // Serial base = the large number added to the current serial index (Which starts at zero)
    _averageMorale: number;             // Calculate the average morale level of the colonists
    _messages: { subject: string, id: number, text: string }[]  // Collection of all colonist messages, to pass to the Engine

    constructor() {
        this._colonists = [];                   // Default population is zero.
        this._colonistsCurrentSerial = 0;       // Current serial always starts at zero
        this._colonistSerialBase = 9000;        // Colonists are from the 9000 series!
        this._averageMorale = 50;               // Default value is 50, which is what new colonists start with
        this._messages = [];
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
        // TODO: Add random 'personality' trait here too ?
        return `${first} ${last}`;
    }

    // SECTION 2: COLONIST UPDATERS

    // Master updater function for controlling all individual colonist updater methods:
    // Needs terrain info for position updates (every minute), and a boolean for whether to update colonists' needs (every hour)
    updateColonists = (needs: boolean, infra: Infrastructure, map: Map, industry: Industry) => {
        // Every minute:
        this.handleColonistMinutelyUpdates(infra, map, industry);              // Should happen once every minute
        // Every hour:
        if (needs) this.handleColonistHourlyUpdates(infra, map, industry);      // Should happen once every hour
        return this.collectColonistMessages();  // Collect colonist messages, reset the list, and pass it to the Engine
    }

    // Passes terrain info to each colonist and then checks if they have achieved their current goal
    handleColonistMinutelyUpdates = (infra: Infrastructure, map: Map, industry: Industry) => {
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
            colonist._data.handleMinutelyUpdates(cols, infra, map, industry);
        })
    }

    // Subroutine of the minutely updater for message collection from the individual colonists
    collectColonistMessages = () => {
        this._colonists.forEach((colonist) => {
            if (colonist._data._message) {
                const msg = { subject: colonist._data._message.subject, id: colonist._data._id, text: colonist._data._message.text };
                this._messages.push(msg);
                colonist._data.clearMessage();
            }
        })
        // Reset messages list and return any messages it contained to the Engine
        const messages = this._messages;
        this._messages = [];
        return messages;
    }

    // Calls each colonist's hourly updates routine, then gets the average morale each hour
    handleColonistHourlyUpdates = (infra: Infrastructure, map: Map, industry: Industry) => {
        this._colonists.forEach((colonist) => {
            colonist._data.handleHourlyUpdates(infra, map, industry);
        });
        this.updateMoraleRating();
    }

    // Cancels the current goal of all colonists whose action stacks / current action refer to a structure that has been removed
    resolveGoalsWhenStructureRemoved = (structureId: number) => {
        this._colonists.forEach((col) => {
            const current = col._data._currentAction?.buildingId === structureId;
            const stack = col._data._actionStack.filter((action) => action.buildingId === structureId).length > 0;
            if ( current || stack ) {
                col._data.resolveGoal();
            }
        })
    }

    // SECTION 3: COLONIST MORALE FUNCTIONS

    // Called after each hourly update, to get the average morale of all the colonists in the base
    updateMoraleRating = () => {
        if (this._colonists.length > 0) {   // Only allow morale updates when the colonists have actually landed!
            let total = 0;
            this._colonists.forEach((col) => {
                total += col._data._morale;
            });
            this._averageMorale = Math.round(total / this._colonists.length);
        }
    }

    // Based on the current average morale of the colony, determine how many new people to +
    determineColonistsForNextLaunch = () => {
        return Math.floor(this._averageMorale / 25);
    }

    // Update morale by value (delta can be +/-) for either a list of colonists, or all of them (if no IDs list is provided)
    updateColonistsMorale = (delta: number, colonistIds?: number[]) => {
        if (colonistIds) {
            console.log("Coming soon: Individually targeted morale effects!");
        } else {
            this._colonists.forEach((col) => {
                col._data.updateMorale(delta);
            })
        }
    }

    // SECTION 4: COLONIST ROLE MANAGEMENT

    assignColonistRole = (colonistID: number, role: [string, number]) => {
        const colonist = this._colonists.find((col) => col._data._id === colonistID);
        if (colonist) {
            colonist._data.setRole(role);
        } else {
            console.log(`Error: Colonist ${colonistID} could not be assigned role: ${role[0]}. Reason: Colonist ID not found in Population array`);
            return null;
        }
    }

    // SECTION 5: COLONIST INFO API (GETTER FUNCTIONS)

    // Used to get colonist data for the Inspect Tool
    getColonistDataFromCoords = (coords: Coords) => {
        const colonist = this._colonists.find((col) => {
            return col._data._x === coords.x && (col._data._y === coords.y || col._data._y === coords.y - 1)
        });
        if (colonist) {
            // If a Colonist is found at the given coords, return their data and then highlight them
            // TODO: Decouple highlighting from the colonist data from coordinates method
            this.highlightColonist(colonist._data._id);
            return colonist;
        } else {
            // If no colonist is found return a null and de-highlight all colonists
            this.highlightColonist(0);
            return null;
        }
    }

    // Highlights the selected colonist (if any) and de-highlights all the others (will de-highlight all if no ID is given)
    highlightColonist = (id: number) => {
        // Start by de-highlighting everybody so that there are no double highlights
        this._colonists.forEach((col) => {
            col.setHighlighted(false);
        })
        const colonist = this._colonists.find((col) => col._data._id === id);
        if (colonist) {
            colonist.setHighlighted(true);
        }
    }

    // SECTION 6: COLONIST SAVE/LOAD DATA MANAGEMENT

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
                morale: colonist._data._morale,
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
        this.updateMoraleRating();      // Update morale as soon as colonist is loaded
    }

    // Gets horizontal offset and fps (game speed) data from the Engine's render method
    render = (p5: P5, xOffset: number, fps: number, gameOn: boolean) => {
        this._colonists.forEach((colonist) => {
            colonist.render(p5, xOffset, fps, gameOn);
        })
    }

}