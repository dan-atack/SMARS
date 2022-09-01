// The ColonistData class handles all of the data processing for the colonist class, without any of the rendering tasks
import { ColonistSaveData, ColonistNeeds } from "./colonist";
import { Coords } from "./connectorData";
import { constants } from "./constants";
import Infrastructure from "./infrastructure";  // Infra data info gets passed by population updater function
import Map from "./map";

export type ColonistAction = {
    type: string,       // Name of the type of action ('move', 'climb', 'eat' and 'drink' initially)
    coords: Coords,     // Exact location the colonist needs to be at/move towards
    duration: number,   // How long the action takes to perform (0 means the action happens immediately)
    buildingId: number, // ID of the module/connector for 'climb' and 'consume' actions, e.g.
}

export default class ColonistData {
    // Colonist data types
    _x: number;         // Colonists' x and y positions will be in terms of grid locations
    _y: number;
    _mapZoneId: string; // To keep track of which map zone the colonist is standing on
    _width: number;     // Colonists' width is in terms of grid spaces...
    _height: number;    // Colonists' height is in terms of grid spaces...
    _xOffset: number;   // ...The offset value, on the other hand, will be in terms of pixels, to allow for smoother scrolling
    _yOffset: number;
    _needs: ColonistNeeds;          // Keep track of the colonist's needs to help them choose what to do with their lives
    _needThresholds: ColonistNeeds; // Separately keep track of the various thresholds for each type of need
    _currentGoal: string;           // String name of the Colonist's current goal (e.g. "get food", "get rest", "explore", etc.)
    _actionStack: ColonistAction[]; // Actions, from last to first, that the colonist will perform to achieve their current goal
    _actionTimeElapsed: number;     // The amount of time, in minutes, that has elapsed performing the current action
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
        this._mapZoneId = "";
        this._width = 1;
        this._height = 2;
        this._xOffset = 0;
        this._yOffset = 0;
        this._needs = saveData ? saveData.needs : { // Load existing needs, or set to zero for new colonists
            water: 0,
            food: 0,
            rest: 0
        };
        this._needThresholds = {    // The higher the threshold, the longer a colonist can go without; 1 unit = 1 hour
            water: 4,
            food: 6,
            rest: 8
        };
        this._currentGoal = saveData ? saveData.goal : "explore"    // Load saved goal, or go exploring (for new colonists).
        this._actionStack = saveData?.actionStack ? saveData.actionStack : [];   // Load saved action stack, or default to empty stack
        this._actionTimeElapsed = saveData ? saveData.actionTimeElapsed : 0;    // Load saved value or default to zero
        this._isMoving = saveData ? saveData.isMoving : false;      // Load saved status or colonists is at rest by default
        this._movementType = saveData ? saveData.movementType :  "" // Load name of movement type or default to no movement
        this._movementCost = saveData ? saveData.movementCost : 0;  // Load value or default to zero
        this._movementProg = saveData ? saveData.movementProg : 0;  // Load value or default to zero
        this._movementDest = saveData ? saveData.movementDest : this._x + 1; // Load destination or go one to the right
        this._facing = saveData ? saveData.facing : "right";        // Let's not make this a political issue, Terry.
        this._animationTick = 0;                                    // By default, no animation is playing
    }

    // TODO: TOP-LEVEL UPDATER METHODS:

    handleHourlyUpdates = (infra: Infrastructure, map: Map) => {
        // TODO: Relocate every hourly update call here
        this.updateNeedsAndGoals(infra, map);
    }

    // AdjacentColumns is a subset of the map; just the column the colonist is on, plus one to the immediate right/left
    handleMinutelyUpdates = (adjacentColumns: number[][], infra: Infrastructure, map: Map) => {
        // TODO: Relocate every update call that happens each minute here
        this.updateMapZone(map);
        this.checkGoalStatus(adjacentColumns, infra, map)
    }

    // NEEDS AND GOAL-ORIENTED METHODS

    // Handles hourly updates to the colonist's needs and priorities (goals)
    updateNeedsAndGoals = (infra: Infrastructure, map: Map) => {
        this.updateNeeds();
        this.updateGoal(infra, map);
    }

    // This may take arguments some day, like how much the Colonist has exerted himself since the last update
    updateNeeds = () => {
        // TODO: Add complexity to the rates of change
        this._needs.food += 1;
        this._needs.water += 1;
        this._needs.rest += 1;
    }

    // Checks whether any needs have exceeded their threshold and assigns a new goal if so; otherwise sets goal to 'explore'
    updateGoal = (infra: Infrastructure, map: Map) => {
        // 1 - Determine needs-based (first priority) goals
        // If the colonist has no current goal, or is set to exploring, check if any needs have reached their thresholds
        // TODO: Revamp this logic to check for needs in a separate sub-method, and to include other tasks that can be overridden
        if (this._currentGoal === "explore" || this._currentGoal === "") {
            Object.keys(this._needs).forEach((need) => {
                // @ts-ignore
                if (this._needs[need] >= this._needThresholds[need]) {
                    this.setGoal(`get-${need}`, infra, map);
                }
            })
        };
        // 2- Determine job-related (second priority) goal if no needs-based goal has been set
        // If no goal has been set, tell them to go exploring; otherwise use the goal determined above
        // TODO: When colonists can have jobs, revamp this logic to check for non-exploration jobs before defaulting to explore
        if (this._currentGoal === "") {
            this.setGoal("explore", infra, map);
        };
    }

    // Takes a string naming the current goal, and uses that to set the destination (and sets that string as the current goal)
    // Also takes optional parameter when setting the "explore" goal, to ensure the colonist isn't sent off the edge of the world
    setGoal = (goal: string, infra?: Infrastructure, map?: Map) => {
        this._currentGoal = goal;
        if (this._currentGoal === "explore") {
            // Assign the colonist to walk to a nearby position
            const dir = Math.random() > 0.5;
            const dist = Math.ceil(Math.random() * 10);
            const dest = dir ? dist : -dist;
            this._movementDest = Math.max(this._x + dest, 0);    // Ensure the colonist doesn't wander off the edge
            if (map && this._movementDest > map._data._columns.length - 1) {
                this._movementDest = map._data._columns.length - 1;
            }
        } else if (infra && map) {
            this.determineActionsForGoal(infra, map)
        } else if (this._currentGoal !== "") {
            console.log(`Error: No infra data provided for non-exploration colonist goal: ${this._currentGoal}`);
        }
    }

    // Determines if a colonist has reached their destination, and if so, what to do next
    checkGoalStatus = (adjacentColumns: number[][], infra: Infrastructure, map: Map) => {
        // Check if colonist is at their destination and update their goal if so...
        if (this._x === this._movementDest) {
            // If the goal was to explore, check if any needs have become urgent enough to make them the new goal
            if (this._currentGoal === "explore") {
                this.resolveGoal();
                this.updateGoal(infra, map);
            } else {
                // console.log(`Arrived at destination for goal ${this._currentGoal}. Interact with building now?`);
                // TODO: Resolve goal for non-exploration cases!
            }
        } else {
            // ...Otherwise, initiate movement sequence
            this.handleMovement(adjacentColumns);
        }
    }

    // Resets all goal-oriented values
    resolveGoal = () => {
        this.setGoal("");
        this._movementDest = this._x;
    }

    // ACTION-ORIENTED METHODS
    // (Actions are individual tasks, such as 'move to x', or 'consume a resource' which collectively form a single GOAL)

    // Top Level Action Creation Method: determines the individual actions to be performed to achieve the current goal
    determineActionsForGoal = (infra: Infrastructure, map: Map) => {
        // Add 1 to colonist Y position to reflect the altitude of their feet, not their head
        const currentPosition = { x: this._x, y: this._y + 1 };
        switch(this._currentGoal) {
            case "get-water":
                console.log("So thirsty...");
                const waterSources = infra.findModulesWithResource(["water", this._needs.water]);
                const waterModuleId = infra.findModuleNearestToLocation(waterSources, currentPosition);
                const waterLocation = infra.findModuleLocationFromID(waterModuleId);
                // Once module is found, add a 'drink' action to the stack (the last step is added first)
                this.addAction("drink", waterLocation, this._needs.water, waterModuleId);
                // Next, since we're working backwards from the final action, tell the Colonist to move to the resource location
                this.addAction("move", waterLocation);      // Only 2 arguments needed for move actions
                const waterFloor = infra._data.getFloorFromModuleId(waterModuleId);
                console.log(`Water source found in module ${waterModuleId} on floor ${waterFloor?._id}`);
                break;
            case "get-food":    // Parallels the get-water case almost closely enough to be the same... but not quite!
                console.log("Merry! I'm hungry!");
                const foodSources = infra.findModulesWithResource(["food", this._needs.food]);
                const foodModuleId = infra.findModuleNearestToLocation(foodSources, currentPosition);
                const foodLocation = infra.findModuleLocationFromID(foodModuleId);
                this.addAction("eat", foodLocation, this._needs.food, foodModuleId);
                this.addAction("move", foodLocation);
                const foodFloor = infra._data.getFloorFromModuleId(foodModuleId);
                console.log(`Food source found in module ${foodModuleId} on floor ${foodFloor?._id}`);
                break;
        }
    }

    // Called every minute by the master updater; checks and updates progress towards the completion of the current action
    updateActionStatus = () => {

    }

    // Adds a new action to the end of the action stack
    addAction = (type: string, location: Coords, duration?: number, buildingId?: number) => {
        const action: ColonistAction = {
            type: type,
            coords: location,
            duration: duration ? duration : 0,
            buildingId: buildingId ? buildingId : 0
        }
        this._actionStack.push(action);     // Add the action to the end of the action stack, so last added is first executed
        console.log(this._actionStack);
    }

    // Pops the last item off of the action stack and initiates it
    startAction = () => {

    }

    // Completes the current action and, if there are more in the stack, begins the next one
    resolveAction = () => {

    }

    // Resets the action stack to an empty array
    clearActions = () => {
        this._actionStack = [];
    }

    // MOVEMENT AND POSITIONING METHODS

    updateMapZone = (map: Map) => {
        this._mapZoneId = map._data.getZoneIdForCoordinates({ x: this._x, y: this._y + 1 });    // Plus one to Y for foot level
    }

    // Movement controller method: Takes a small terrain sample and 'fpm' which is short for 'frames per minute'
    handleMovement = (adjacentColumns: number[][]) => {
        // Colonists are passed an array of 2-3 columns: The one they're in, and the ones to the left and to the right
        // By default, the middle (second) column is the colonist's current position
        let currentColumn = 1;
        // If the colonist is at the right-most edge, then they are standing on column zero
        if (adjacentColumns.length === 2 && this._x === 0) currentColumn = 0;
        // 1 - Check what colonist is standing on
        this.detectTerrainBeneath(adjacentColumns[currentColumn]);
        // 2 - Conclude moves in progress
        if (this._isMoving) {
            this._movementProg ++;
            if (this._movementProg >= this._movementCost) {    // If current movement is complete
                this.updatePosition();
                this.stopMovement();
            }
        // 3 - If no movement is currently taking place and the colonist is not at their destination, start a new move
        } else if (this._x !== this._movementDest) {
            this.startMovement(adjacentColumns, currentColumn);
        }
    }

    // Determines what type of move is needed next (walking, climbing, etc) and initiates it
    startMovement = (adjacentColumns: number[][], currentColumn: number) => {
        // Determine direction
        const dir = this._x > this._movementDest ? "left" : "right";
        this._facing = dir;
        // Determine movement type by comparing current height to height of target column
        const currentHeight = adjacentColumns[currentColumn].length;
        const destHeight = dir === "right" ? adjacentColumns[currentColumn + 1].length : adjacentColumns[currentColumn - 1].length;
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