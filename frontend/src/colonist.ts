// The Colonist class represents the individual Smartian colonist. That's... something about a... giant leap... damn!
import P5 from "p5";
import ColonistData, { ColonistAction } from "./colonistData";
import { constants } from "./constants";
import { bodyAnimations, headAnimations, handAnimations, footAnimations } from "./animationFunctions";
import { Coords } from "./connectorData";

export type ColonistNeeds = {
    water: number,
    food: number,
    rest: number,
};

export type ColonistSaveData = {
    x: number,
    y: number,
    needs: ColonistNeeds,
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
    _p5: P5;
    _data: ColonistData;    // Data processing core, distinct from rendering-functions

    constructor(p5: P5, x: number, y: number, saveData?: ColonistSaveData) {
        this._p5 = p5;
        this._data = saveData ? new ColonistData(x, y, saveData) : new ColonistData(x, y);
    }

    // FPM = game speed in frames per game minute (greater = slower) and sign = +1 for facing right, and -1 for facing left
    drawHead = (fpm: number, sign: number) => {
        const { xAnimation, yAnimation } = headAnimations(this._data._movementType, fpm, this._data._animationTick, this._data._movementCost, sign);
        let xOffsets: number[] = [];
        // Sign of 1 = colonist faces right
        if (sign === 1) {
            xOffsets = [0.6 + xAnimation, 0.7 + xAnimation];
        } else {
            xOffsets = [0.4 + xAnimation, 0.3 + xAnimation];
        }
        // Helmet
        this._p5.fill(constants.EGGSHELL);
        this._p5.strokeWeight(2);
        const x = (this._data._x + xOffsets[0]) * constants.BLOCK_WIDTH - this._data._xOffset;
        const y = (this._data._y + 0.6 + yAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
        const w = 0.8 * constants.BLOCK_WIDTH;
        this._p5.ellipse(x, y, w);
        // Visor
        const vX = (this._data._x + xOffsets[1]) * constants.BLOCK_WIDTH - this._data._xOffset;
        const vY = (this._data._y + 0.6 + yAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
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
        // Use body animation helper function to get x and y animation values IF game speed is not set to blazing
        const { xAnimation, yAnimation } = bodyAnimations(this._data._movementType, fpm, this._data._animationTick, this._data._movementCost, sign);
        const x = (this._data._x + 0.1 + xAnimation) * constants.BLOCK_WIDTH - this._data._xOffset;
        const y = (this._data._y + 0.9 + yAnimation) * constants.BLOCK_WIDTH;
        const w = 0.8 * constants.BLOCK_WIDTH;
        const h = 0.9 * constants.BLOCK_WIDTH;
        this._p5.rect(x, y, w, h);
    }

    drawHands = (fpm: number, sign: number) => {
        this._p5.fill(constants.GRAY_METEOR);
        const { xlAnimation, xrAnimation, ylAnimation, yrAnimation } = handAnimations(this._data._movementType, fpm, this._data._animationTick, this._data._movementCost, sign);
        // Left hand
        const xL = (this._data._x + 0.15 + xlAnimation) * constants.BLOCK_WIDTH - this._data._xOffset;
        const yL = (this._data._y + 1.3 + ylAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
        const w = 0.3 * constants.BLOCK_WIDTH;  // Both hands are the same size
        // Right hand
        const xR = (this._data._x + 0.8 + xrAnimation) * constants.BLOCK_WIDTH - this._data._xOffset;
        const yR = (this._data._y + 1.3 + yrAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
        this._p5.ellipse(xL, yL, w);
        this._p5.ellipse(xR, yR, w);
    }

    drawFeet = (fpm: number, sign: number) => {
        this._p5.fill(constants.RED_ERROR);
        const { xlAnimation, xrAnimation, ylAnimation, yrAnimation } = footAnimations(this._data._movementType, fpm, this._data._animationTick, this._data._movementCost, sign);
        // Left boot
        const xL = (this._data._x + 0.15 + xlAnimation) * constants.BLOCK_WIDTH - this._data._xOffset;
        const yL = (this._data._y + 1.85 + ylAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
        const w = 0.3 * constants.BLOCK_WIDTH;  // Both hands are the same size
        // Right boot
        const xR = (this._data._x + 0.85 + xrAnimation) * constants.BLOCK_WIDTH - this._data._xOffset;
        const yR = (this._data._y + 1.85 + yrAnimation) * constants.BLOCK_WIDTH - this._data._yOffset;
        this._p5.ellipse(xL, yL, w);
        this._p5.ellipse(xR, yR, w);
    }

    // Gets passed offset data and fpm (game speed) AND gameOn (whether game is paused or not) from the population class
    render = (xOffset: number, fpm: number, gameOn: boolean) => {    // TODO: Add the Y offsets... Free SMARS!
        this._data._xOffset = xOffset;
        // Draw body parts individually
        const animationSign = this._data._facing === "right" ? 1 : -1;
        this.drawBody(fpm, animationSign);    // Body goes first, to keep legs and arms and head in the foreground
        this.drawHead(fpm, animationSign);
        this.drawHands(fpm, animationSign);
        this.drawFeet(fpm, animationSign);
        if (this._data._isMoving && gameOn) this._data._animationTick++;  // Advance animation if there is movement AND the game is unpaused
    }

}