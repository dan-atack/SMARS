// The Colonist class represents the individual Smartian colonist. That's... something about a... giant leap... damn!
import P5 from "p5";
import ColonistData, { ColonistAction } from "./colonistData";
import { constants } from "./constants";
import { bodyAnimations, headAnimations, handAnimations, footAnimations } from "./animationFunctions";
import { Coords } from "./connector";

// Colonist Data templates (NOTE when updating these, make sure to mirror the update in the backend's saveFunctions.ts file)

export type ColonistNeeds = {
    water: number,
    food: number,
    rest: number,
};

export type ColonistRole = [string, number];

export type ColonistSaveData = {
    id: number,
    name: string,
    x: number,
    y: number,
    role: ColonistRole,
    needs: ColonistNeeds,
    morale: number,
    goal: string,
    currentAction: ColonistAction | null,
    actionStack: ColonistAction[],
    actionTimeElapsed: number,
    isMoving: boolean,
    movementType: string,
    movementCost: number,
    movementProg: number,
    movementDest: Coords,
    facing: string
};

export default class Colonist {
    // Colonist types:
    _data: ColonistData;            // Data processing core, distinct from rendering-functions
    // For tool animations (tools can have basic reciprocating motion animations)
    _toolMaxPosition: number;       // Maximum frame number (and extension distance) for tool animation
    _toolPosition: number;          // Current frame (and extension distance) in the tool animation
    _toolOutward: boolean;          // Which direction the tool is moving (inward or outward)
    _highlighted: boolean;          // Tells the renderer to draw a bright 'highlight' around the colonist if they are selected

    constructor(id: number, name: string, x: number, y: number, saveData?: ColonistSaveData) {
        this._data = saveData ? new ColonistData(id, name, x, y, saveData) : new ColonistData(id, name, x, y);
        this._toolMaxPosition = 0;      // Let individual animations set these values
        this._toolPosition = 0;
        this._toolOutward = false;
        this._highlighted = false;      // By default, colonists are not highlighted
        
    }

    // Controls whether or not this colonist is highlighted
    setHighlighted = (highlighted: boolean) => {
        this._highlighted = highlighted;
    }

    // FPM = game speed in frames per game minute (greater = slower) and sign = +1 for facing right, and -1 for facing left
    drawHead = (p5: P5, fpm: number, sign: number) => {
        const { xAnimation, yAnimation } = headAnimations(this._data._movementType, fpm, this._data._animationTick, this._data._movementCost, sign);
        let xOffsets: number[] = [];
        // Sign of 1 = colonist faces right
        if (sign === 1) {
            xOffsets = [0.6 + xAnimation, 0.7 + xAnimation];
        } else {
            xOffsets = [0.4 + xAnimation, 0.3 + xAnimation];
        }
        // Helmet
        p5.fill(constants.EGGSHELL);
        p5.strokeWeight(2);
        const x = (this._data._x + xOffsets[0]) * constants.BLOCK_WIDTH - this._data._xOffset;
        const y = (this._data._y + 0.6 + yAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
        const w = 0.8 * constants.BLOCK_WIDTH;
        p5.ellipse(x, y, w);
        // Visor
        const vX = (this._data._x + xOffsets[1]) * constants.BLOCK_WIDTH - this._data._xOffset;
        const vY = (this._data._y + 0.6 + yAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
        const vW = 0.6 * constants.BLOCK_WIDTH;
        p5.ellipse(vX, vY, vW);
        p5.stroke(constants.EGGSHELL);
        p5.strokeWeight(1);
        p5.fill(constants.ALMOST_BLACK);
        p5.ellipse(vX, vY, vW);
    }

    drawBody = (p5: P5, fpm: number, sign: number) => {
        p5.stroke(constants.ALMOST_BLACK);
        p5.strokeWeight(2);
        p5.fill(constants.ORANGE_JUMPSUIT);
        // Use body animation helper function to get x and y animation values IF game speed is not set to blazing
        const { xAnimation, yAnimation } = bodyAnimations(this._data._movementType, fpm, this._data._animationTick, this._data._movementCost, sign);
        const x = (this._data._x + 0.1 + xAnimation) * constants.BLOCK_WIDTH - this._data._xOffset;
        const y = (this._data._y + 0.9 + yAnimation) * constants.BLOCK_WIDTH;
        const w = 0.8 * constants.BLOCK_WIDTH;
        const h = 0.9 * constants.BLOCK_WIDTH;
        p5.rect(x, y, w, h);
    }

    drawHands = (p5: P5, fpm: number, sign: number) => {
        p5.fill(constants.GRAY_METEOR);
        const { xlAnimation, xrAnimation, ylAnimation, yrAnimation } = handAnimations(this._data._movementType, fpm, this._data._animationTick, this._data._movementCost, sign);
        // Left hand
        const xL = (this._data._x + 0.15 + xlAnimation) * constants.BLOCK_WIDTH - this._data._xOffset;
        const yL = (this._data._y + 1.3 + ylAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
        const w = 0.3 * constants.BLOCK_WIDTH;  // Both hands are the same size
        // Right hand
        const xR = (this._data._x + 0.8 + xrAnimation) * constants.BLOCK_WIDTH - this._data._xOffset;
        const yR = (this._data._y + 1.3 + yrAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
        p5.ellipse(xL, yL, w);
        p5.ellipse(xR, yR, w);
    }

    drawFeet = (p5: P5, fpm: number, sign: number) => {
        p5.fill(constants.RED_ERROR);
        const { xlAnimation, xrAnimation, ylAnimation, yrAnimation } = footAnimations(this._data._movementType, fpm, this._data._animationTick, this._data._movementCost, sign);
        // Left boot
        const xL = (this._data._x + 0.15 + xlAnimation) * constants.BLOCK_WIDTH - this._data._xOffset;
        const yL = (this._data._y + 1.85 + ylAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
        const w = 0.3 * constants.BLOCK_WIDTH;  // Both hands are the same size
        // Right boot
        const xR = (this._data._x + 0.85 + xrAnimation) * constants.BLOCK_WIDTH - this._data._xOffset;
        const yR = (this._data._y + 1.85 + yrAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
        p5.ellipse(xL, yL, w);
        p5.ellipse(xR, yR, w);
    }

    // Prototype rendering method for Colonist tools - max ticks = internal counter for the tool's animation
    drawTool = (p5: P5, maxTicks: number) => {
        this._toolMaxPosition = maxTicks;  // Set tool extension value
        const x = (this._data._x * constants.BLOCK_WIDTH) - this._data._xOffset + constants.BLOCK_WIDTH / 2;
        const y = ((this._data._y + 2.5) * constants.BLOCK_WIDTH) + this._toolPosition / 4;  // for convenience
        const w = (this._data._width * constants.BLOCK_WIDTH) * 4 / 5;
        const tip = this._toolPosition;
        // Advance the drill head position
        // Outwards
        if (this._toolOutward && this._toolPosition < this._toolMaxPosition) {
            this._toolPosition++;
            if (this._toolPosition >= this._toolMaxPosition) {
                this._toolOutward = false;        // Reverse if fully extended
            }
        // Inwards
        } else {
            this._toolPosition--;
            if (this._toolPosition <= 0) {
                this._toolOutward = true;         // Reverse if fully retracted
            }
        }
        p5.strokeWeight(2);
        p5.stroke(constants.ALMOST_BLACK);
        p5.fill(constants.GRAY_METEOR);
        p5.rect(x - w, y - w * 1.6, w * 2, w / 5);
        p5.fill(constants.YELLOW_TEXT);
        p5.quad(x - w / 4, y - w / 2, x + w / 4, y - w / 2, x + w / 2, y - w * 3 / 2, x - w / 2, y - w * 3 / 2);
        p5.quad(x - w / 2, y - w * 3 / 2, x + w / 2, y - w * 3 / 2, x + w / 4, y - w * 2, x - w / 4, y - w * 2);
        // Drill head
        p5.fill(constants.GRAY_DRY_ICE);
        p5.rect(x - w / 10, y - w / 2, w / 5, tip);
    }

    // Gets passed offset data and fpm (game speed) AND gameOn (whether game is paused or not) from the population class
    render = (p5: P5, xOffset: number, fpm: number, gameOn: boolean) => {    // TODO: Add the Y offsets... Free SMARS!
        this._data._xOffset = xOffset;
        // Draw body parts individually
        const animationSign = this._data._facing === "right" ? 1 : -1;
        this.drawBody(p5, fpm, animationSign);    // Body goes first, to keep legs and arms and head in the foreground
        this.drawHead(p5, fpm, animationSign);
        this.drawFeet(p5, fpm, animationSign);
        if (this._data._currentAction?.type === "mine") this.drawTool(p5, 4);   // Draw a little jackhammer if colonist is mining
        this.drawHands(p5, fpm, animationSign);     // Draw hands last so they go over the tool, if there is one
        if (this._data._isMoving && gameOn) this._data._animationTick++;  // Advance animation if there is movement AND the game is unpaused
        if (this._highlighted) {
            p5.stroke(constants.GREEN_TERMINAL);
            p5.strokeWeight(4);
            p5.noFill();
            p5.rect(this._data._x * constants.BLOCK_WIDTH - this._data._xOffset - 4, this._data._y * constants.BLOCK_WIDTH - 4, this._data._width * constants.BLOCK_WIDTH + 8, this._data._height * constants.BLOCK_WIDTH + 8, 8, 8, 8, 8);
        }
    }

}