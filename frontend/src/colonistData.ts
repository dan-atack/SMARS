// The ColonistData class handles all of the data processing for the colonist class, without any of the rendering tasks
import { ColonistSaveData, ColonistNeeds } from "./colonist";
import { Coords } from "./connectorData";
import { constants } from "./constants";
import Infrastructure from "./infrastructure";  // Infra data info gets passed by population updater function
import { Elevator } from "./infrastructureData";
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
    _currentAction: ColonistAction | null; // The individual action that is currently being undertaken (if any)
    _actionTimeElapsed: number;     // The amount of time, in minutes, that has elapsed performing the current action
    _isMoving: boolean;             // Is the colonist currently trying to get somewhere?
    _movementType: string           // E.g. walk, climb-up, climb-down, etc. (used to control animations)
    _movementCost: number;          // The cost, in units of time (and perhaps later, 'exertion') for the current movement
    _movementProg: number;          // The amount of time and/or exertion expended towards the current movement cost
    _movementDest: Coords;          // The coordinates of the current destination for the colonist's movement
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
        this._actionStack = saveData?.actionStack ? saveData.actionStack : [];   // Load saved action stack or default to empty
        this._currentAction = null;
        this._actionTimeElapsed = saveData ? saveData.actionTimeElapsed : 0;    // Load saved value or default to zero
        this._isMoving = saveData ? saveData.isMoving : false;      // Load saved status or colonists is at rest by default
        this._movementType = saveData ? saveData.movementType :  "" // Load name of movement type or default to no movement
        this._movementCost = saveData ? saveData.movementCost : 0;  // Load value or default to zero
        this._movementProg = saveData ? saveData.movementProg : 0;  // Load value or default to zero
        this._movementDest = saveData ? saveData.movementDest : { x: this._x + 1, y: this._y }; // Load destination or go right
        this._facing = saveData ? saveData.facing : "right";        // Let's not make this a political issue, Terry.
        this._animationTick = 0;                                    // By default, no animation is playing
    }

    // Handles hourly updates to the colonist's needs and priorities (goals)
    handleHourlyUpdates = (infra: Infrastructure, map: Map) => {
        this.updateNeeds();
        this.updateGoal(infra, map);
    }

    // AdjacentColumns is a subset of the map; just the column the colonist is on, plus one to the immediate right/left
    handleMinutelyUpdates = (adjacentColumns: number[][], infra: Infrastructure, map: Map) => {
        this.checkActionStatus(infra);   // Update actions before goals
        this.checkGoalStatus(infra, map);
        this.handleMovement(map, adjacentColumns);
    }

    // NEEDS AND GOAL-ORIENTED METHODS

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
                    this.resolveGoal(); // Clear out the old goal information first
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
        if (infra && map) {
            this.determineActionsForGoal(infra, map);
        } else if (this._currentGoal !== "") {
            console.log(`Error: Infra/Map data missing for non-empty colonist goal: ${this._currentGoal}`);
        }
    }

    // Determines if a colonist has reached their destination, and if so, what to do next
    checkGoalStatus = (infra: Infrastructure, map: Map) => {
        // New way: Check if the colonist has no actions remaining - if so, they have resolved their current goal
        if (this._actionStack.length === 0 && this._currentAction === null) {
            this.resolveGoal();
            this.updateGoal(infra, map);
        }
    }

    // Clears the current action (if any) and starts progress towards a newly selected goal
    startGoalProgress = (infra: Infrastructure) => {
        console.log(`Starting progress towards goal: ${this._currentGoal}`);
        this.resolveAction();   // Ensure no previous actions are still in progress
        this.startAction(infra);
    }

    // Resets all goal-oriented values
    resolveGoal = () => {
        console.log(`Goal resolved: ${this._currentGoal}`);
        this.setGoal("");
        this.resolveAction();
        this.clearActions();    // Ensure no actions remain if the goal is declared resolved
    }

    // ACTION-ORIENTED METHODS
    // (Actions are individual tasks, such as 'move to x', or 'consume a resource' which collectively form a single GOAL)

    // Top Level Action Creation Method: determines the individual actions to be performed to achieve the current goal
    determineActionsForGoal = (infra: Infrastructure, map: Map) => {
        this.clearActions();    // Ensure the action stack is empty before adding to it
        const currentPosition = { x: this._x, y: this._y + 1 }; // Add 1 to colonist Y position to get 'foot level' value
        switch(this._currentGoal) {
            case "explore":
                // Assign the colonist to walk to a nearby position
                const dir = Math.random() > 0.5;
                const dist = Math.ceil(Math.random() * 10);
                let dest = dir ? dist : -dist;
                dest = Math.max(this._x + dest, 0);    // Ensure the colonist doesn't wander off the edge
                if (dest > map._data._columns.length - 1) {
                    dest = map._data._columns.length - 1;
                }
                this.addAction("move", { x: dest, y: 0 });  // Y coordinate doesn't matter for move action
                this.startAction(infra);
                break;
            case "get-water":
                console.log("So thirsty...");
                const waterSources = infra.findModulesWithResource(["water", 0 /*this._needs.water */]);
                const waterModuleId = infra.findModuleNearestToLocation(waterSources, currentPosition);
                const waterLocation = infra.findModuleLocationFromID(waterModuleId);
                // Once module is found, add a 'drink' action to the stack (the last step is added first)
                this.addAction("drink", waterLocation, this._needs.water, waterModuleId);
                // Next, since we're working backwards from the final action, tell the Colonist to move to the resource location
                this.addAction("move", waterLocation);      // Only 2 arguments needed for move actions
                const waterFloor = infra._data.getFloorFromModuleId(waterModuleId);
                if (waterFloor !== null) {
                    // Does the floor have a ground zone?
                    waterFloor._groundFloorZones.forEach((zone) => {
                        if (zone.id === this._mapZoneId.toString()) {
                            console.log(`Water source on floor ${waterFloor._id} is walkable from current map zone.`);
                            this.startGoalProgress(infra);
                        } else {
                            console.log(`Water source on floor ${waterFloor._id} is not walkable from current map zone.`);
                            // Find elevators IDs connecting to target floor
                            
                        }
                    })
                    if (waterFloor._groundFloorZones.length === 0) {
                        console.log(`Water source on floor ${waterFloor._id} is not on a ground floor.`)
                        // Find elevators to target floor
                        const elevatorIDs = waterFloor._connectors;
                        console.log(`Elevators connecting to water source floor: ${elevatorIDs}`);
                        if (elevatorIDs.length > 0) {
                            // If there are any elevators/ladders, check if any of them has a ground zone
                            const groundedElevators: Elevator[] = [];
                            elevatorIDs.forEach((id) => {
                                const elev = infra._data.getElevatorFromId(id);
                                if (elev && elev.groundZoneId.length > 0) {
                                    groundedElevators.push(elev);
                                }
                            })
                            // If any do, find if any of them has the same ground zone as the colonist
                            const ladderOfChoice = groundedElevators.find(ladder => ladder.groundZoneId === this._mapZoneId);
                            if (ladderOfChoice) {
                                // If a ladder is found that has the same ground zone, tell the colonist to climb it!
                                // Climb action needs all 4 args; coordinates = ladder.x and the height at which to get off
                                // Subtract 1 from elevation value to ensure the Colonist's feet align with the floor
                                this.addAction("climb", { x: ladderOfChoice.x, y: waterFloor._elevation - 1}, 0, ladderOfChoice.id);
                                this.addAction("move", { x: ladderOfChoice.x, y: ladderOfChoice.bottom});
                                this.startGoalProgress(infra);
                            } else {
                                console.log(`No ladder matching zone ID ${this._mapZoneId} found.`);
                            }
                        }
                    }
                }
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
    checkActionStatus = (infra: Infrastructure) => {
        if (this._currentAction) {
            // 1 - Increase action elapsed time if the current action has a duration value
            if (this._currentAction.duration > 0) {
                this._actionTimeElapsed++;
            }
            // 2 - Check for action completion conditions depending on action type
            switch (this._currentAction.type) {
                case "climb":
                    if (this._x === this._currentAction.coords.x && this._y === this._currentAction.coords.y) {
                        this.resolveAction();
                        this.checkForNextAction(infra);
                    }
                    break;
                case "drink":
                    if (this._actionTimeElapsed >= this._currentAction.duration) {
                        this._needs.water -= this._currentAction.duration;  // Reduce water need by 1/unit of time spent drinking
                        this.resolveAction();
                        this.checkForNextAction(infra);
                    }
                    break;
                case "eat":
                    if (this._actionTimeElapsed >= this._currentAction.duration) {
                        this._needs.food -= this._currentAction.duration;   // Reduce food need by 1/unit of time spent eating
                        this.resolveAction();
                        this.checkForNextAction(infra);
                    }
                    break;
                case "move":
                    if (this._x === this._currentAction.coords.x) {
                        this.resolveAction();
                        this.checkForNextAction(infra);
                    }
                    break;
                // Housekeeping: Keep options in sync with startAction and startMovement methods and animationFunctions.ts
            }
        }
        
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
    }

    // Pops the last item off of the action stack and initiates it
    startAction = (infra: Infrastructure) => {
        const action = this._actionStack.pop();
        if (action !== undefined) {
            this._currentAction = action;
            switch(this._currentAction.type) {
                case "climb":
                    console.log(`Climbing ladder at ${this._currentAction.coords.x}`);
                    this._movementDest = this._currentAction.coords;
                    break;
                case "drink":
                    console.log(`Drinking at ${this._currentAction.buildingId}`);
                    this.consume("water", infra);
                    break;
                case "eat":
                    console.log(`Eating at ${this._currentAction.buildingId}`);
                    this.consume("food", infra);
                    break;
                case "move":
                    console.log(`Beginning movement to ${this._currentAction.coords.x}`);
                    this._movementDest = this._currentAction.coords;
                    break;
            }
        } else {
            console.log('Error: Unable to start action because the action stack is empty.')
        }
    }

    // Advances to the next action in the stack, if there is one
    checkForNextAction = (infra: Infrastructure) => {
        if (this._actionStack.length > 0) {
            this.startAction(infra);     // If there are more actions to be taken, start the next one
        }
    }

    // Completes the current action and resets all values related to the current action
    resolveAction = () => {
        this._currentAction = null;
        this._actionTimeElapsed = 0;
    }

    // Resets the action stack to an empty array
    clearActions = () => {
        this._actionStack = [];
    }

    // MOVEMENT/POSITIONING METHODS

    updateMapZone = (map: Map) => {
        this._mapZoneId = map._data.getZoneIdForCoordinates({ x: this._x, y: this._y + 1 });    // Plus one to Y for foot level
    }

    // Movement Top-Level controller method: Initiates/continues a move based on what type of action is being performed
    handleMovement = (map: Map, adjacentColumns: number[][]) => {
        // 0 - Check if non-movement (duration-based) action is taking place
        let otherAction = false;
        if (this._currentAction !== null) otherAction = this._currentAction.duration > this._actionTimeElapsed;
        // 1 - Check what colonist is standing on
        this.detectTerrainBeneath(map);
        // 2 - Conclude moves in progress
        if (this._isMoving) {
            this._movementProg ++;
            if (this._movementProg >= this._movementCost) {    // If current movement is complete
                this.updatePosition();
                this.stopMovement();
            }
        // 3 - If no move is currently in progress and colonist is not at destination or has other type of action, start new move
        } else if (this._x !== this._movementDest.x || this._y !== this._movementDest.y || otherAction) {
            this.startMovement(adjacentColumns);
        }
    }

    // Determines what type of move is needed next (walking, climbing, etc) and initiates it
    startMovement = (adjacentColumns: number[][]) => {
        // 1 - Determine movement type and cost
        if (this._currentAction) {
            switch (this._currentAction.type) {
                case "climb":
                    this._movementType = "climb-ladder";
                    this._movementCost = 5; // It takes 5 time units to climb one segment of ladder
                    break;
                case "drink":
                    this._movementType = "drink";
                    this._movementCost = this._currentAction.duration;  // Drink time depends on thirst level
                    break;
                case "eat":
                    this._movementType = "eat";
                    this._movementCost = this._currentAction.duration;  // Eating time depends on hunger level
                    break;
                case "move":
                    // A - Determine direction
                    // Colonists are passed an array of 2-3 columns: The one they're in, and the ones to the left and to the right
                    // By default, the middle (second) column is the colonist's current position
                    let currentColumn = 1;
                    // If the colonist is at the right-most edge, then they are standing on column zero
                    if (adjacentColumns.length === 2 && this._x === 0) currentColumn = 0;
                    const dir = this._x >= this._movementDest.x ? "left" : "right";
                    this._facing = dir;
                    // B - Determine movement type by comparing current height to height of target column
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
                            this.resolveGoal();
                            break;
                        }
                    break;
            }
        } else {
            console.log("Not moving due to: No value for current action.")
        }
        // 2 - Initiate movement
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
        // Horizontal position changes only if current action type is "move"
        if (this._movementType && this._currentAction && this._currentAction.type === "move") {
            this._facing === "right" ? this._x++ : this._x--;
            this._animationTick = 0;    // Reset animation sequence tick immediately after horizontal translation
        }
        // Only moves with a vertical component are considered here (no case for 'walk' since it's horizontal only, but climbing a ladder - which is not technically a 'move' movement - does change your Y value)
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
            case "climb-ladder":
                this._y--;
                break;
        }
    }

    // Ensures the colonist is always on the ground
    detectTerrainBeneath = (map: Map) => {
        this.updateMapZone(map);
        
        // const surfaceY = (constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH) - column.length;
        // if (this._y + 2 < surfaceY) {
        //     // Colonist is moved downwards if they're not standing on solid ground.
        //     // TODO: Find a way to include the floors of modules in the definition of 'solid ground.'
        //     this._y = surfaceY - 2;
        // }
    }

    // NON-MOVEMENT ACTIVITIES

    // Generic resource-consumption method (can be used for eating and drinking... and who knows what else, eh? ;)
    consume = (resourceName: string, infra: Infrastructure) => {
        if (this._currentAction) {
            const modCoords = this._currentAction.coords;
            // Ensure the colonist is standing in the right place
            if (this._x === modCoords.x && this._y === modCoords.y) {
                // Find the module using its ID
                const mod = infra.getModuleFromID(this._currentAction.buildingId);
                // Call its resource-reduction method
                if (mod) {
                    // Resource is immediately removed from the module; colonist 'gets' it when they complete the action
                    const consumed = mod._data.deductResource([resourceName, this._currentAction.duration]);  // Duration = qty taken
                    if (consumed < this._currentAction.duration) {
                        this._currentAction.duration = consumed;    // Since the module's deductResources method returns a number representing the amount of resource dispensed, we can see if it contained less than the required amount and reduce the action duration (and eventual amount of need relieved) if so
                    }
                } else {
                    console.log(`Error: Module ${this._currentAction.buildingId} not found.`);
                    // TODO: Redirect/recalculate action stack if this happens?
                }
            } else {
                console.log(`Error: Consume action failed due to: Colonist position (${this._x}, ${this._y}) does not match module location ${modCoords.x}, ${modCoords.y}.`);
                // TODO: Redirect/recalculate action stack if this happens?
            }
        }
    }

}