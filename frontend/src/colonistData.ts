// The ColonistData class handles all of the data processing for the colonist class, without any of the rendering tasks
import { ColonistSaveData, ColonistNeeds } from "./colonist";
import { constants } from "./constants";

export default class ColonistData {
    // Colonist data types
    _x: number;         // Colonists' x and y positions will be in terms of grid locations
    _y: number;
    _width: number;     // Colonists' width is in terms of grid spaces...
    _height: number;    // Colonists' height is in terms of grid spaces...
    _xOffset: number;   // ...The offset value, on the other hand, will be in terms of pixels, to allow for smoother scrolling
    _yOffset: number;
    _needs: ColonistNeeds;          // Keep track of the colonist's needs to help them choose what to do with their lives
    _needThresholds: ColonistNeeds; // Separately keep track of the various thresholds for each type of need
    _currentGoal: string;           // String name of the Colonist's current goal (e.g. "get food", "get rest", "explore", etc.)
    _isMoving: boolean;             // Is the colonist currently trying to get somewhere?
    _movementType: string           // E.g. walk, climb-up, climb-down, etc. (used to control animations)
    _movementCost: number;          // The cost, in units of time (and perhaps later, 'exertion') for the current movement
    _movementProg: number;          // The amount of time and/or exertion expended towards the current movement cost
    _movementDest: number;          // The x value of the current destination for the colonist's movement
    _facing: string;                // Either "right" or "left"... until SMARS 3D is released, that is!
    _animationTick: number;         // Governs the progression of movement/activity animations

    constructor(x: number, y: number, saveData?: ColonistSaveData) {
        this._x = x;
        this._y = y;
        this._width = 1;
        this._height = 2;
        this._xOffset = 0;
        this._yOffset = 0;
        this._needs = saveData ? saveData.needs : { // Load existing needs, or set to zero for new colonists
            water: 0,
            food: 0,
            rest: 0
        };
        this._needThresholds = {                    // The higher the threshold, the longer a colonist can go without
            water: 4,
            food: 6,
            rest: 8
        };
        this._currentGoal = saveData ? saveData.goal : "explore"    // Load saved goal, or go exploring (for new colonists).
        this._isMoving = saveData ? saveData.isMoving : false;      // Load saved status or colonists is at rest by default
        this._movementType = saveData ? saveData.movementType :  "" // Load name of movement type or default to no movement
        this._movementCost = saveData ? saveData.movementCost : 0;  // Load value or default to zero
        this._movementProg = saveData ? saveData.movementProg : 0;  // Load value or default to zero
        this._movementDest = saveData ? saveData.movementDest : this._x + 1; // Load destination or go one to the right
        this._facing = saveData ? saveData.facing : "right";        // Let's not make this a political issue, Terry.
        this._animationTick = 0;                                    // By default, no animation is playing
    }

    // Handles hourly updates to the colonist's needs and priorities (goals)
    updateNeedsAndGoals = (maxColumns: number) => {
        // TODO: Only introduce need-based goal-setting when they are possible to fulfill
        // this.updateNeeds();
        this.updateGoal(maxColumns);
    }

    // This may take arguments some day, like how much the Colonist has exerted himself since the last update
    updateNeeds = () => {
        // TODO: Add complexity to the rates of change
        this._needs.food += 1;
        this._needs.water += 1;
        this._needs.rest += 1;
    }

    // Checks whether any needs have exceeded their threshold and assigns a new goal if so; otherwise sets goal to 'explore'
    updateGoal = (maxColumns: number) => {
        // If the colonist has no current goal, or is set to exploring, check if any needs have reached their thresholds
        if (this._currentGoal === "explore" || this._currentGoal === "") {
            Object.keys(this._needs).forEach((need) => {
                // @ts-ignore
                if (this._needs[need] >= this._needThresholds[need]) {
                    this.setGoal(`get-${need}`);
                }
            })
        };
        // If no goal has been set, tell them to go exploring
        if (this._currentGoal === "") {
            this.setGoal("explore", maxColumns);
        };
    }

    // Takes a string naming the current goal, and uses that to set the destination (and sets that string as the current goal)
    // Also takes optional parameter when setting the "explore" goal, to ensure the colonist isn't sent off the edge of the world
    setGoal = (goal: string, maxColumns?: number) => {
        this._currentGoal = goal;
        switch(this._currentGoal) {
            case "explore":
                // Assign the colonist to walk to a nearby position
                const dir = Math.random() > 0.5;
                const dist = Math.ceil(Math.random() * 10);
                const dest = dir ? dist : -dist;
                this._movementDest = Math.max(this._x + dest, 0);    // Ensure the colonist doesn't wander off the edge
                if (maxColumns && this._movementDest > maxColumns) {
                    this._movementDest = maxColumns;
                }
                break;
            case "get-water":
                break;
            case "get-food":
                break;
        }
    }

    // Resets all goal-oriented values
    resolveGoal = () => {
        this.setGoal("");
        this._movementDest = this._x;
    }

    // Determines if a colonist has reached their destination, and if so, what to do next
    checkGoalStatus = (terrain: number[][], maxColumns: number) => {
        // Check if colonist is at their destination and update their goal if so...
        if (this._x === this._movementDest) {
            // If the goal was to explore, check if any needs have become urgent enough to make them the new goal
            if (this._currentGoal === "explore") {
                this.resolveGoal();
                this.updateGoal(maxColumns);
            } else {
                // console.log(`Arrived at destination for goal ${this._currentGoal}. Interact with building now?`);
                // TODO: Resolve goal for non-exploration cases!
            }
        } else {
            // ...Otherwise, initiate movement sequence
            this.handleMovement(terrain);
        }
    }

    // Movement controller method: Takes a small terrain sample and 'fpm' which is short for 'frames per minute'
    handleMovement = (terrain: number[][]) => {
        // Colonists are passed an array of 2-3 columns: The one they're in, and the ones to the left and to the right
        // By default, the middle (second) column is the colonist's current position
        let currentColumn = 1;
        // If the colonist is at the right-most edge, then they are standing on column zero
        if (terrain.length === 2 && this._x === 0) currentColumn = 0;
        // 1 - Check what colonist is standing on
        this.detectTerrainBeneath(terrain[currentColumn]);
        // 2 - Conclude moves in progress
        if (this._isMoving) {
            this._movementProg ++;
            if (this._movementProg >= this._movementCost) {    // If current movement is complete
                this.updatePosition();
                this.stopMovement();
            }
        // 3 - If no movement is currently taking place and the colonist is not at their destination, start a new move
        } else if (this._x !== this._movementDest) {
            this.startMovement(terrain, currentColumn);
        }
    }

    // Determines what type of move is needed next (walking, climbing, etc) and initiates it
    startMovement = (terrain: number[][], currentColumn: number) => {
        // Determine direction
        const dir = this._x > this._movementDest ? "left" : "right";
        this._facing = dir;
        // Determine movement type by comparing current height to height of target column
        const currentHeight = terrain[currentColumn].length;
        const destHeight = dir === "right" ? terrain[currentColumn + 1].length : terrain[currentColumn - 1].length;
        const delta = currentHeight - destHeight;
        switch (delta) {
            // Jumping down from either 1 or 2 blocks takes the same movement
            case 2:
                this._movementType = "big-drop";
                this._movementCost = 5;
                break;
            case 1:
                this._movementType = "small-drop";
                this._movementCost = 3;
                break;
            case 0:
                this._movementType = "walk";
                this._movementCost = 1;
                break;
            case -1:
                this._movementType = "small-climb";
                this._movementCost = 5;
                break;
            case -2:
                this._movementType = "big-climb";
                this._movementCost = 10;
                break;
            default:
                // Abort movement if terrain is too steep
                this.stopMovement();
                this.setGoal("explore");   // Reset colonist goal if they reach an impassable obstacle.
                break;
        }
        // Start new move
        this._isMoving = true;
    }

    // Halts all movement and resets movement-related values
    stopMovement = () => {
        this._isMoving = false;
        this._movementType = "";
        this._movementCost = 0;
        this._movementProg = 0;
        this._animationTick = 0;
    }

    // Update colonist position (x AND y) when movement is completed
    updatePosition = () => {
        // Horizontal position changes regardless of movement type
        if (this._movementType) {
            this._facing === "right" ? this._x++ : this._x--;
            this._animationTick = 0;    // Reset animation sequence tick immediately after horizontal translation
        }
        // Only moves with a vertical component are considered here (no case for 'walk' since it's horizontal only)
        switch (this._movementType) {
            case "small-climb":
                this._y--;
                break;    
            case "big-climb":
                this._y -= 2;
                break;
            case "small-drop":
                this._y++;
                break;    
            case "big-drop":
                this._y += 2;
                break;
        }
    }

    // Ensures the colonist is always on the ground
    detectTerrainBeneath(column: number[]) {
        const surfaceY = (constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH) - column.length;
        if (this._y + 2 < surfaceY) {
            // Colonist is moved downwards if they're not standing on solid ground.
            // TODO: Find a way to include the floors of modules in the definition of 'solid ground.'
            this._y = surfaceY - 2;
        }
    }
}