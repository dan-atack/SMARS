// The ColonistData class handles all of the data processing for the colonist class, without any of the rendering tasks
import { ColonistSaveData, ColonistNeeds, ColonistRole } from "./colonist";
import { createConsumeActionStack, createProductionActionStack, createRestActionStack, findElevatorToGround } from "./colonistActionLogic";
import { Coords } from "./connector";
import Industry from "./industry";
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
    _id: number;        // Colonists will have a unique ID just like everything else
    _name: string;      // To give the game a bit of humanity, each colonist will have a name (first names only at this point)
    _x: number;         // Colonists' x and y positions will be in terms of grid locations
    _y: number;
    _standingOnId: string | number; // To keep track of which map zone (ID = string) or floor (ID = number)
    _width: number;                 // Colonists' width is in terms of grid spaces...
    _height: number;                // Colonists' height is in terms of grid spaces...
    _xOffset: number;       // ...The offset value, on the other hand, will be in terms of pixels, to allow for smoother scrolling
    _yOffset: number;
    _role: [string, number];        // Roles will consist of a name (e.g. farmer) and module ID (e.g. 1001)
    _needs: ColonistNeeds;          // Keep track of the colonist's needs to help them choose what to do with their lives
    _needThresholds: ColonistNeeds; // Separately keep track of the various thresholds for each type of need
    _needsAvailable: ColonistNeeds; // Also, keep track of whether any needs are unavailable (0 = unavailable, 1 = available)
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

    constructor(id: number, name: string, x: number, y: number, saveData?: ColonistSaveData) {
        this._id = id;
        this._name = name;
        this._x = x;
        this._y = y;
        this._standingOnId = "";
        this._width = 1;
        this._height = 2;
        this._xOffset = 0;
        this._yOffset = 0;
        this._role = saveData?.role ? saveData.role : [ "explorer", 0];   // Default role for colonists is to be an explorer
        this._needs = saveData ? saveData.needs : {                 // Load existing needs, or set to zero for new colonists
            water: 0,
            food: 0,
            rest: 0
        };
        this._needThresholds = {    // The higher the threshold, the longer a colonist can go without; 1 unit = 1 hour
            water: 4,
            food: 6,
            rest: 16                // Colonists will need 8 hours' sleep each day, and will remain awake for twice that time
        };
        this._needsAvailable = {    // Set to 1 for available, 0 for unavailable; resets every hour
            water: 1,
            food: 1,
            rest: 1
        };
        this._currentGoal = saveData ? saveData.goal : "explore"    // Load saved goal, or go exploring (for new colonists).
        this._actionStack = saveData?.actionStack ? saveData.actionStack : [];   // Load saved action stack or default to empty
        this._currentAction = saveData?.currentAction ? saveData.currentAction : null;  // Load current action or default to null
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
    handleHourlyUpdates = (infra: Infrastructure, map: Map, industry: Industry) => {
        this.updateNeeds();
        this.resetNeedAvailabilities();
        this.updateGoal(infra, map, industry);
    }

    // AdjacentColumns is a subset of the map; just the column the colonist is on, plus one to the immediate right/left
    handleMinutelyUpdates = (adjacentColumns: number[][], infra: Infrastructure, map: Map, industry: Industry) => {
        this.checkActionStatus(infra, industry);              // First: Update actions before goals
        this.checkGoalStatus(infra, map, industry);           // Then update goals after actions
        this.handleMovement(map, infra, adjacentColumns);  // Finally, take care of movement last
    }

    // NEEDS, ROLE AND GOAL-ORIENTED METHODS

    // Increases colonist needs, but only up to the need threshold if they are asleep
    updateNeeds = () => {
        this._needs.food += 1;
        this._needs.water += 1;
        this._needs.rest += 1;
        if (this._currentAction?.type === "rest") { // Limit need increases for food and water while colonist is resting
            this._needs.food = Math.min(this._needs.food, this._needThresholds.food);
            this._needs.water = Math.min(this._needs.food, this._needThresholds.water);
        }
    }

    // Tells the colonist to assume that all needs can be checked for again
    resetNeedAvailabilities = () => {
        this._needsAvailable.food = 1;
        this._needsAvailable.water = 1;
        this._needsAvailable.rest = 1;
    }

    // Sets the Colonist's role (i.e. occupation) in the base
    setRole = (role: ColonistRole) => {
        this._role = role;
    }

    // Checks whether any needs have exceeded their threshold and assigns a new goal if so; otherwise sets goal to 'explore'
    updateGoal = (infra: Infrastructure, map: Map, industry: Industry) => {
        // 1 - Determine needs-based (first priority) goals
        // If the colonist has no current goal, or is set to exploring, check if any needs have reached their thresholds
        if (this._currentGoal === "explore" || this._currentGoal === "") {
            this.checkForNeeds(infra, map);
        };
        // 2 - Determine job-related (second priority) goal ONLY IF no needs-based goal has been set
        if (this._currentGoal === "explore" || this._currentGoal === "") {
            this.checkForJobs(infra, map, industry);
        }
        // 3 - If no goal has been set, tell them to go exploring; otherwise use the goal determined above
        if (this._currentGoal === "") {
            this.setGoal("explore", infra, map);
        };
    }

    // Sub-routine 1 for updateGoal method: Checks if any needs have reached their threshold
    checkForNeeds = (infra: Infrastructure, map: Map) => {
        let needSet = false;        // Only keep looping so long as no need has been set
        Object.keys(this._needs).forEach((need) => {
            // Check each need to see if it has A) crossed its threshold and B) is still believed to be available
            // @ts-ignore
            if (this._needs[need] >= this._needThresholds[need] && this._needsAvailable[need] && !(needSet)) {
                // When setting new goal, clear out the current action - UNLESS it's a 'climb' action, in which case wait
                if (this._currentAction?.type !== "climb") {
                    this.resolveAction();
                    needSet = true;     // Tell the forEach loop to stop looking once a need is set
                    this.setGoal(`get-${need}`, infra, map);
                } else {
                    console.log(`Colonist ${this._id} is climbing - delaying new action start.`);
                }
            }
        })
    }

    // Sub-routine 2 for updateGoal method: Checks for jobs for the Colonist's role
    checkForJobs = (infra: Infrastructure, map: Map, industry: Industry) => {
        const job = industry.getJob(this._role[0]);
        if (job) {  // Set the Job type as the new goal if a job is found; otherwise this will fall through to the default case
            this.addAction(job.type, job.coords, job.duration, job.buildingId); // Make the job the first item in the action stack
            this.setGoal(job.type, infra, map, job);     // Then determine how to get to the job site
        }
    }

    // Takes a string naming the current goal, as well as additional optional arguments for infra and map
    // ALSO takes an optional final argument for a production job, to pass to the action stack determinator
    setGoal = (goal: string, infra?: Infrastructure, map?: Map, job?: ColonistAction) => {
        this._currentGoal = goal;
        if (infra && map) {
            this.determineActionsForGoal(infra, map, job);  // If there is a job, pass it to action stack determinator
        } else if (this._currentGoal !== "") {
            console.log(`Error: Infra/Map data missing for non-empty colonist goal: ${this._currentGoal}`);
        }
    }

    // Determines if a colonist has reached their destination, and if so, what to do next
    checkGoalStatus = (infra: Infrastructure, map: Map, industry: Industry) => {
        // New way: Check if the colonist has no actions remaining - if so, they have resolved their current goal
        if (this._actionStack.length === 0 && this._currentAction === null) {
            this.resolveGoal();
            this.updateGoal(infra, map, industry);
        }
    }

    // Clears the current action (if any) and starts progress towards a newly selected goal
    startGoalProgress = (infra: Infrastructure) => {
        // console.log(`Colonist ${this._id} starting progress towards goal: ${this._currentGoal}.`);
        this.startAction(infra);
    }

    // Resets all goal-oriented values
    resolveGoal = () => {
        this.resolveAction();     // Clear current action first
        this.clearActions();    // Then clear out the rest of the action stack
        // console.log(`Colonist ${this._id} goal resolved: ${this._currentGoal}.`);
        this.setGoal("");
    }

    // ACTION-ORIENTED METHODS
    // (Actions are individual tasks, such as 'move to x', or 'consume a resource' which collectively form a single GOAL)

    // Top Level Action Creation Method: determines the individual actions to be performed to achieve the current goal
    determineActionsForGoal = (infra: Infrastructure, map: Map, job?: ColonistAction) => {
        this.clearActions();    // Ensure the action stack is empty before adding to it
        const currentPosition = { x: this._x, y: this._y + 1 }; // Add 1 to colonist Y position to get 'foot level' value
        switch(this._currentGoal) {
            case "explore":
                // First, randomly generate a position that is near (on the x axis that is) to the colonist's current location
                const dir = Math.random() > 0.5;
                const dist = Math.ceil(Math.random() * 10);
                let dest = dir ? dist : -dist;
                dest = Math.max(this._x + dest, 1);    // Ensure the colonist doesn't wander off the edge
                if (dest > map._columns.length - 1) {
                    dest = map._columns.length - 1;
                }
                // Then, add the movement action; if the colonist is on the ground, then this is the only action needed...
                this.addAction("move", { x: dest, y: 0 });  // Y coordinate doesn't matter for move action
                // Finally, if the colonist is NOT on the ground, they need to get back down before trying to move
                if (typeof this._standingOnId === "number") {
                    // Find the closest elevator that goes to the ground floor:
                    const elevator = findElevatorToGround(this._x, this._standingOnId, infra);
                    if (elevator) {
                        // If found, add order to climb nearest ladder down to the ground level (minus 1 for the feet)
                        this.addAction("climb", { x: elevator.x, y: elevator.bottom - 1 }, 0, elevator.id);
                        // If found, add order to move to nearest ladder (stack is created in reverse order)
                        this.addAction("move", { x: elevator.x, y: this._y });
                    } else {
                        console.log(`Colonist ${this._id} is trapped on floor ${this._standingOnId}!`);
                    }
                }
                break;
            case "get-water":
                this._actionStack = createConsumeActionStack(currentPosition, this._standingOnId, ["water", this._needs.water], infra);
                // If no action stack was returned, assume that water is temporarily unavailable
                if (this._actionStack.length === 0) {
                    // TODO: Add a warning here.... I'm thinking, set a new Colonist property and have the Engine read it via the Population class (which can update an hourly tally of Colonist warning messages)
                    this._needsAvailable.water = 0;
                }
                break;
            case "get-food":    // Parallels the get-water case almost closely enough to be the same... but not quite!
                this._actionStack = createConsumeActionStack(currentPosition, this._standingOnId, ["food", this._needs.food], infra);
                // If no action stack was returned, assume that food is temporarily unavailable
                if (this._actionStack.length === 0) this._needsAvailable.food = 0;
                break;
            case "get-rest":
                this._actionStack = createRestActionStack(currentPosition, this._standingOnId, infra);
                if (this._actionStack.length === 0) this._needsAvailable.rest = 0;
                break;
            case "farm":
            case "mine":    // Right now both farming and mining have the same action stack goal: find the way to the job site
                if (job) {
                    this._actionStack = createProductionActionStack(currentPosition, this._standingOnId, infra, job);
                } else {
                    console.log(`Error: No job data found for goal: ${this._currentGoal}`);
                }
                break;
        }
        this.startGoalProgress(infra);
    }

    // Called every minute by the master updater; checks and updates progress towards the completion of the current action
    checkActionStatus = (infra: Infrastructure, industry: Industry) => {
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
                        this.checkForNextAction(infra);     // Only check for next action after movement/climbing actions
                    }
                    break;
                case "drink":
                    if (this._actionTimeElapsed >= this._currentAction.duration) {
                        this._needs.water -= this._currentAction.duration;  // Reduce water need by 1/unit of time spent drinking
                        this.resolveAction();
                    }
                    break;
                case "eat":
                    if (this._actionTimeElapsed >= this._currentAction.duration) {
                        this._needs.food -= this._currentAction.duration;   // Reduce food need by 1/unit of time spent eating
                        this.resolveAction();
                    }
                    break;
                case "farm":
                    if (this._actionTimeElapsed >= this._currentAction.duration) {
                        infra.resolveModuleProduction(this._currentAction.buildingId, this._id); // complete production & punch out
                        industry.updateJobsForRole(infra, this._currentAction.type);    // renew farmer jobs
                        this.resolveAction();
                    }
                    break;
                case "move":
                    if (this._x === this._currentAction.coords.x) {
                        this.resolveAction();
                        this.checkForNextAction(infra);     // Only check for next action after movement/climbing actions
                    }
                    break;
                case "rest":
                    if (this._actionTimeElapsed >= this._currentAction.duration) {
                        this._needs.rest = 0;   // Always awake fully rested - must be nice!!
                        this.exitModule(infra); // Don't forget to officially exit the module when leaving
                        this.resolveAction();
                        this.checkForNextAction(infra);
                    }
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
                    this._movementDest = this._currentAction.coords;
                    break;
                case "drink":
                    this.consume("water", infra);
                    break;
                case "eat":
                    this.consume("food", infra);
                    break;
                case "farm":
                    this.enterModule(infra);    // Begin production by calling generic punch-in method
                    break;
                case "move":
                    this._movementDest = this._currentAction.coords;
                    break;
                case "rest":
                    this.enterModule(infra);    // Begin resting by entering the sleeping quarters
            }
        } else {
            console.log('Warning: Unable to start action because the action stack is empty.')
        }
    }

    // Advances to the next action in the stack, if there is one
    checkForNextAction = (infra: Infrastructure) => {
        if (this._actionStack.length > 0) {
            this.startAction(infra);     // If there are more actions to be taken, start the next one
        }
    }

    // Completes the current action and resets all values related to the current action including the current move
    resolveAction = () => {
        this._currentAction = null;
        this._actionTimeElapsed = 0;
        this.stopMovement();
    }

    // Resets the action stack to an empty array
    clearActions = () => {
        this._actionStack = [];
    }

    // MOVEMENT/POSITIONING METHODS

    updateMapZone = (map: Map) => {
        this._standingOnId = map.getZoneIdForCoordinates({ x: this._x, y: this._y + 1 });    // Plus one to Y for foot level
    }

    updateFloorZone = (infra: Infrastructure) => {
        const floor = infra._data.getFloorFromCoords({ x: this._x, y: this._y + 1 });    // Plus one to Y for foot level
        if (floor) {
            this._standingOnId = floor._id;
        } else {
            console.log(`Error: Colonist ${this._name} at (${this._x}, ${this._y}) is not standing on anything!`);
            // Drop the colonist down one level if they are not standing on anything ??
            this._y++;
        }
    }

    // Movement Top-Level controller method: Initiates/continues a move based on what type of action is being performed
    handleMovement = (map: Map, infra: Infrastructure, adjacentColumns: number[][]) => {
        // 0 - Check if non-movement (duration-based) action is taking place (defined as duration > 0)
        let otherAction = false;
        if (this._currentAction !== null) otherAction = this._currentAction.duration > 0;
        // 1 - Check what colonist is standing on
        this.detectTerrainBeneath(map, infra);
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
                    // Determine if climb action is upwards or downwards
                    if (this._movementDest.y > this._y) {
                        this._movementType = "climb-ladder-down";
                    } else {
                        this._movementType = "climb-ladder-up";
                    }
                    this._movementCost = 5; // It takes 5 time units to climb one segment of ladder in either direction
                    break;
                case "drink":       // All of these activities have an animation name and duration, and do not move the colonist
                case "eat":
                case "farm":
                case "rest":
                    this._movementType = this._currentAction.type;
                    this._movementCost = this._currentAction.duration;
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
                            this._movementCost = 6;
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
                            this._movementCost = 12;
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
            // If there is no current action but an attempt is made to initiate a move, reset the colonist's goal to unjam them
            console.log(`Colonist ${this._id} not moving due to: No value for current action. Auto-resolving current goal (${this._currentGoal}).`);
            this.resolveGoal();
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
            case "climb-ladder-up":
                this._y--;
                break;
            case "climb-ladder-down":
                this._y++;
                break;
        }
    }

    // Ensures the colonist is always on the ground, whether on the map terrain or a floor inside the base
    detectTerrainBeneath = (map: Map, infra: Infrastructure) => {
        this.updateMapZone(map);
        // If the colonist is not standing on a map zone, check what floor they are on (unless they are climbing a ladder)
        if (this._standingOnId === "" && this._currentAction?.type !== "climb") {
            this.updateFloorZone(infra);
        }
    }

    // OTHER (NON-MOVEMENT) ACTIVITIES

    // Generic resource-consumption method (can be used for eating and drinking... and who knows what else, eh? ;)
    consume = (resourceName: string, infra: Infrastructure) => {
        if (this._currentAction) {
            const modCoords = this._currentAction.coords;
            // Ensure the colonist is standing in the right place (which is their y position + 1 [for foot level])
            if (this._x === modCoords.x && this._y + 1 === modCoords.y) {
                // Find the module using its ID
                const mod = infra.getModuleFromID(this._currentAction.buildingId);
                // Call its resource-reduction method
                if (mod) {
                    // Resource is immediately removed from the module; colonist 'gets' it when they complete the action
                    const consumed = mod.deductResource([resourceName, this._currentAction.duration]);  // Duration = qty taken
                    if (consumed < this._currentAction.duration) {
                        this._currentAction.duration = consumed;    // Since the module's deductResources method returns a number representing the amount of resource dispensed, we can see if it contained less than the required amount and reduce the action duration (and eventual amount of need relieved) if so
                    }
                } else {
                    console.log(`Error: Module ${this._currentAction.buildingId} not found.`);
                    // Skip this action if the module is not found
                    this.resolveAction();
                }
            } else {
                console.log(`Error: Consume action for Colonist ${this._id} failed due to: Colonist position (${this._x}, ${this._y}) does not match module location ${modCoords.x}, ${modCoords.y}.`);
                // Skip this action if the colonist was sent to the wrong coordinates
                this.resolveAction();
            }
        }
    }

    // Simply finds a module and calls its 'punchIn' method ( usually as part of a produce or rest action )
    enterModule = (infra: Infrastructure) => {
        // Ensure that the current action exists, and that the colonist is in the right place
        if (this._currentAction && this._currentAction.coords.x === this._x && this._currentAction.coords.y === this._y + 1) {
            const mod = infra.getModuleFromID(this._currentAction.buildingId);
            if (mod) {
                const accessGranted = mod.punchIn(this._id);
                if (!accessGranted) {
                    this.resolveAction();   // If punchout is rejected (i.e. if module is full) end the action
                }
            } else {
                console.log(`Error: ${this._name} unable to enter Module ${this._currentAction.buildingId}. Reason: Module data not found.`);
            }
        } else {
            console.log(`Warning: Colonist ${this._id} is in wrong position to enter ${this._currentAction?.type} module.`);
            this.resolveAction();
        }
    }

    // Exits the current module after a rest action
    exitModule = (infra: Infrastructure) => {
        // Ensure that the current action exists
        if (this._currentAction) {
            const mod = infra.getModuleFromID(this._currentAction.buildingId);
            if (mod) {
                mod.punchOut(this._id);
            } else {
                console.log(`Error: ${this._name} unable to exit Module ${this._currentAction.buildingId}. Reason: Module data not found.`);
            }
        }
    }

}