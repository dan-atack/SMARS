// The Colonist class represents the individual Smartian colonist. That's... something about a... giant leap... damn!
import P5 from "p5";
import { constants } from "./constants";

export type ColonistNeeds = {
    water: number,
    food: number,
    rest: number,
};

export default class Colonist {
    // Colonist types:
    _p5: P5;
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
    _movementProgress: number;      // The amount of time and/or exertion expended towards the current movement cost
    _movementDestination: number;   // The x value of the current destination for the colonist's movement
    _facing: string;                // Either "right" or "left"... until SMARS 3D is released, that is!
    _animationTick: number;         // Governs the progression of movement/activity animations

    constructor(p5: P5, x: number, y: number) {
        this._p5 = p5;
        this._x = x;
        this._y = y;
        this._width = 1;
        this._height = 2;
        this._xOffset = 0;
        this._yOffset = 0;
        this._needs = {             // Needs all start with zero intensity and increase gradually over time
            water: 0,
            food: 0,
            rest: 0
        };
        this._needThresholds = {    // The higher the threshold, the longer a colonist can go without
            water: 4,
            food: 6,
            rest: 8
        };
        this._currentGoal = ""          // By default, colonists have no goals in life.
        this._isMoving = false;         // Colonists are at rest by default
        this._movementType = ""         // An empty string is used when to particular animation is needed
        this._movementCost = 0;         // No movement means no movement costs
        this._movementProgress = 0;
        this._movementDestination = this._x + 1;    // By default, the colonist should move one step to the right if they can
        this._facing = "right";         // Let's not make this a political issue, Terry.
        this._animationTick = 0;        // By default, no animation is playing
    }

    // Handles hourly updates to the colonist's needs and priorities (goals)
    updateNeedsAndGoals = () => {
        // TODO: Only introduce need-based goal-setting when they are possible to fulfill
        // this.updateNeeds();
        this.updateGoal();
    }

    // This may take arguments some day, like how much the Colonist has exerted himself since the last update
    updateNeeds = () => {
        // TODO: Add complexity to the rates of change
        this._needs.food += 1;
        this._needs.water += 1;
        this._needs.rest += 1;
    }

    // Checks whether any needs have exceeded their threshold and assigns a new goal if so; otherwise sets goal to 'explore'
    updateGoal = () => {
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
            console.log("Going exploring.");
            this.setGoal("explore");
        };
    }

    // Takes a string naming the current goal, and uses that to set the destination (and sets that string as the current goal)
    setGoal = (goal: string) => {
        this._currentGoal = goal;
        switch(this._currentGoal) {
            case "explore":
                // Assign the colonist to walk to a nearby position
                const dir = Math.random() > 0.5;
                const dist = Math.ceil(Math.random() * 10);
                const dest = dir ? dist : -dist;
                this._movementDestination = Math.max(this._x + dest, 0);    // Ensure the colonist doesn't wander off the edge
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
        this._movementDestination = this._x;
    }

    // Determines if a colonist has reached their destination, and if so, what to do next
    checkGoalStatus = (terrain: number[][]) => {
        // Check if colonist is at their destination and update their goal if so...
        if (this._x === this._movementDestination) {
            console.log(`Reached destination for goal ${this._currentGoal}: ${this._x} = ${this._movementDestination}`);
            // If the goal was to explore, check if any needs have become urgent enough to make them the new goal
            if (this._currentGoal === "explore") {
                this.resolveGoal();
                this.updateGoal();
            } else {
                console.log(`Arrived at destination for goal ${this._currentGoal}. Interact with building now?`);
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
            this._movementProgress ++;
            if (this._movementProgress >= this._movementCost) {    // If current movement is complete
                this.updatePosition();
                this.stopMovement();
            }
        // 3 - If no movement is currently taking place and the colonist is not at their destination, start a new move
        } else if (this._x !== this._movementDestination) {
            this.startMovement(terrain, currentColumn);
        }
    }

    // Determines what type of move is needed next (walking, climbing, etc) and initiates it
    startMovement = (terrain: number[][], currentColumn: number) => {
        // Determine direction
        const dir = this._x > this._movementDestination ? "left" : "right";
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
                console.log("Insurmountable obstacle ahead. Aborting movement.");
                this.stopMovement();
                this.setGoal("explore");   // Reset colonist goal if they reach an impassable obstacle.
                break;
        }
        // Start new move
        this._isMoving = true;
        // TODO: Make sure this doesn't go ape if the colonist as at the map's edge
    }

    // Halts all movement and resets movement-related values
    stopMovement = () => {
        this._isMoving = false;
        this._movementType = "";
        this._movementCost = 0;
        this._movementProgress = 0;
    }

    // Update colonist position (x AND y) when movement is completed
    updatePosition = () => {
        // Horizontal position changes regardless of movement type
        if (this._movementType) {
            this._facing === "right" ? this._x++ : this._x--;
            this._animationTick = 0;    // Reset animation sequence tick immediately after horizontal translation
        } else {
            console.log("Position update called without movement type");
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

    // FPM = game speed in frames per game minute (greater = slower) and sign = +1 for facing right, and -1 for facing left
    drawHead = (fpm: number, sign: number) => {
        // Reposition helmet and visor depending on which direction the colonist is facing and the type of movement:
        let xAnimation: number = 0;
        let yAnimation: number = 0;
        switch (this._movementType) {
            case "walk":
                xAnimation = (1 / fpm) * this._animationTick * sign;
                break;
            case "small-climb":
                xAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                yAnimation = -((1 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "big-climb":
                xAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                yAnimation = -((2 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "small-drop":
                xAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                yAnimation = ((1 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "big-drop":
                xAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                yAnimation = ((2 / fpm) * this._animationTick) / this._movementCost;
                break;
        }
        let offsets: number[] = [];
        if (this._facing === "right") {
            offsets = [0.6 + xAnimation, 0.7 + xAnimation];
        } else {
            offsets = [0.4 + xAnimation, 0.3 + xAnimation];
        }
        // Helmet
        this._p5.fill(constants.EGGSHELL);
        this._p5.strokeWeight(2);
        const x = (this._x + offsets[0]) * constants.BLOCK_WIDTH - this._xOffset;
        const y = (this._y + 0.6 + yAnimation) * constants.BLOCK_WIDTH - this._yOffset;
        const w = 0.8 * constants.BLOCK_WIDTH;
        this._p5.ellipse(x, y, w);
        // Visor
        const vX = (this._x + offsets[1]) * constants.BLOCK_WIDTH - this._xOffset;
        const vY = (this._y + 0.6 + yAnimation) * constants.BLOCK_WIDTH - this._yOffset;
        const vW = 0.6 * constants.BLOCK_WIDTH;
        this._p5.ellipse(vX, vY, vW);
        this._p5.stroke(constants.EGGSHELL);
        this._p5.strokeWeight(1);
        this._p5.fill(constants.ALMOST_BLACK);
        this._p5.ellipse(vX, vY, vW);
    }

    drawBody = (fpm: number, sign: number) => {
        this._p5.stroke(constants.ALMOST_BLACK);
        this._p5.strokeWeight(2);
        this._p5.fill(constants.ORANGE_JUMPSUIT);
        let xAnimation: number = 0;
        let yAnimation: number = 0;
        switch (this._movementType) {
            case "walk":
                xAnimation = (1 / fpm) * this._animationTick * sign;
                break;
            case "small-climb":
                xAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                yAnimation = -((1 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "big-climb":
                xAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                yAnimation = -((2 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "small-drop":
                xAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                yAnimation = ((1 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "big-drop":
                xAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                yAnimation = ((2 / fpm) * this._animationTick) / this._movementCost;
                break;
        }
        const x = (this._x + 0.1 + xAnimation) * constants.BLOCK_WIDTH - this._xOffset;
        const y = (this._y + 0.9 + yAnimation) * constants.BLOCK_WIDTH;
        const w = 0.8 * constants.BLOCK_WIDTH;
        const h = 0.9 * constants.BLOCK_WIDTH;
        this._p5.rect(x, y, w, h);
    }

    drawHands = (fpm: number, sign: number) => {
        this._p5.fill(constants.GRAY_METEOR);
        // Determine both hands' animated positions first:
        let xlAnimation: number = 0;
        let xrAnimation: number = 0;
        let ylAnimation: number = 0;
        let yrAnimation: number = 0;
        switch (this._movementType) {
            case "walk":
                // Right moves first and stops halfway through the movement animation
                // TODO: Correct xlAnimation to add graceful 'swing back' animation for arm movement
                xlAnimation = (2.5 / fpm) * Math.min(fpm / 2, this._animationTick) * sign;
                // Left moves immediately afterwards and stops at the end of the animation
                xrAnimation = (2 / fpm) * Math.max(0, this._animationTick - fpm / 2) * sign;
                break;
            case "small-climb":
                xlAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                xrAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                ylAnimation = -((1 / fpm) * this._animationTick) / this._movementCost;
                yrAnimation = -((1 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "big-climb":
                xlAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                xrAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                ylAnimation = -((2 / fpm) * this._animationTick) / this._movementCost;
                yrAnimation = -((2 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "small-drop":
                xlAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                xrAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                ylAnimation = ((1 / fpm) * this._animationTick) / this._movementCost;
                yrAnimation = ((1 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "big-drop":
                xlAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                xrAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                ylAnimation = ((2 / fpm) * this._animationTick) / this._movementCost;
                yrAnimation = ((2 / fpm) * this._animationTick) / this._movementCost;
                break;
        }
        // Invert which hand gets which instructions if the colonist is moving to the left:
        if (this._facing === "left") {
            const s = xrAnimation;
            xrAnimation = xlAnimation;
            xlAnimation = s;
        }
        // Left
        const xL = (this._x + 0.15 + xlAnimation) * constants.BLOCK_WIDTH - this._xOffset;
        const yL = (this._y + 1.3 + ylAnimation) * constants.BLOCK_WIDTH - this._yOffset;
        const w = 0.3 * constants.BLOCK_WIDTH;  // Both hands are the same size
        // Right hand
        const xR = (this._x + 0.8 + xrAnimation) * constants.BLOCK_WIDTH - this._xOffset;
        const yR = (this._y + 1.3 + yrAnimation) * constants.BLOCK_WIDTH - this._yOffset;
        this._p5.ellipse(xL, yL, w);
        this._p5.ellipse(xR, yR, w);
    }

    drawFeet = (fpm: number, sign: number) => {
        this._p5.fill(constants.GRAY_IRON_ORE);
        let xlAnimation: number = 0;
        let xrAnimation: number = 0;
        let ylAnimation: number = 0;
        let yrAnimation: number = 0;
        switch (this._movementType) {
            case "walk":
                // Right moves first and stops halfway through the movement animation
                xlAnimation = (2 / fpm) * Math.min(fpm / 2, this._animationTick) * sign;
                // Left moves immediately afterwards and stops at the end of the animation
                xrAnimation = (2 / fpm) * Math.max(0, this._animationTick - fpm / 2) * sign;
                break;
            case "small-climb":
                xlAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                xrAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                ylAnimation = -((1 / fpm) * this._animationTick) / this._movementCost;
                yrAnimation = -((1 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "big-climb":
                xlAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                xrAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                ylAnimation = -((2 / fpm) * this._animationTick) / this._movementCost;
                yrAnimation = -((2 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "small-drop":
                xlAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                xrAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                ylAnimation = ((1 / fpm) * this._animationTick) / this._movementCost;
                yrAnimation = ((1 / fpm) * this._animationTick) / this._movementCost;
                break;
            case "big-drop":
                xlAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                xrAnimation = ((1 / fpm) * this._animationTick * sign) / this._movementCost;
                ylAnimation = ((2 / fpm) * this._animationTick) / this._movementCost;
                yrAnimation = ((2 / fpm) * this._animationTick) / this._movementCost;
                break;
        }
        if (this._facing === "left") {
            const s = xrAnimation;
            xrAnimation = xlAnimation;
            xlAnimation = s;
        }
        // Left boot
        const xL = (this._x + 0.15 + xlAnimation) * constants.BLOCK_WIDTH - this._xOffset;
        const yL = (this._y + 1.85 + ylAnimation) * constants.BLOCK_WIDTH - this._yOffset;
        const w = 0.3 * constants.BLOCK_WIDTH;  // Both hands are the same size
        // Right boot
        const xR = (this._x + 0.85 + xrAnimation) * constants.BLOCK_WIDTH - this._xOffset;
        const yR = (this._y + 1.85 + yrAnimation) * constants.BLOCK_WIDTH - this._yOffset;
        this._p5.ellipse(xL, yL, w);
        this._p5.ellipse(xR, yR, w);
    }

    // Gets passed offset data and fpm (game speed) AND gameOn (whether game is paused or not) from the population class
    render = (xOffset: number, fpm: number, gameOn: boolean) => {    // TODO: Add the Y offsets... Free SMARS!
        this._xOffset = xOffset;
        // Draw body parts individually
        const animationSign = this._facing === "right" ? 1 : -1;
        this.drawBody(fpm, animationSign);    // Body goes first, to keep legs and arms and head in the foreground
        this.drawHead(fpm, animationSign);
        this.drawHands(fpm, animationSign);
        this.drawFeet(fpm, animationSign);
        if (this._isMoving && gameOn) this._animationTick++;  // Advance animation if there is movement AND the game is unpaused
    }

}