// The Lander is a sprite that is used for the landing sequence animation at the start of the game
import P5 from "p5";
import { constants } from "./constants";

export default class Lander {
    // Lander types:
    _p5: P5;
    _x: number;             // The MIDDLE of the lander's lateral position, in pixels
    _y: number;             // Lander's altitude, in pixels (0 being the top of the screen)
    _width: number;
    _height: number;
    _start: number;         // Initial altitude (0)
    _destination: number;   // Final altitude
    _distance: number;      // Distance between start and destination
    _duration: number;      // How many frames to animate for just the landing (clouds will linger longer)
    _elapsed: number;       // How many frames have been shown

    constructor(p5: P5, x: number, y: number, start: number, destination: number, duration: number) {
        this._p5 = p5;
        this._x = x;                                    // All values (x, y, w, h) are in terms of PIXELS
        this._y = y;
        this._width = 8 * constants.BLOCK_WIDTH;
        this._height = 6 * constants.BLOCK_WIDTH;       // Rough guesstimate... these values are only temporary in any case
        this._start = start;
        this._destination = destination;
        this._distance = this._destination - this._start - this._height * 1.6;
        this._duration = duration;  
        this._elapsed = 0;  // Count up to the duration, instead of decrementing it
    }

    advanceAnimation = () => {
        // Only move the lander if the full duration of the landing sequence hasn't finished yet:
        if (this._elapsed <= this._duration) {
            // TODO: Exponential deceleration (starting fast, then slowing as the surface approaches)
            this._y = this._start + (this._elapsed * this._distance / this._duration);    // Update height parameter (plus equals downwards)
        }
        this._elapsed++;    // Advance elapsed frames count even if duration is exceeded (to advance dust cloud settlement)
    }

    drawClouds = (x: number) => {
        const p5 = this._p5;
        const y = this._destination;
        const drift = this._elapsed / 2 - 100;                          // Controls horizontal push for outer clouds
        const settle = Math.max(0, this._elapsed - this._duration);     // Controls dust cloud descent after touchdown
        console.log(settle);
        p5.strokeWeight(0);
        p5.fill(constants.BROWN_SAND);
        p5.ellipse(x + this._width / 2 + drift, y + settle, this._elapsed / 2);
        p5.ellipse(x - this._width / 2 - drift, y + settle, this._elapsed / 2);
        p5.ellipse(x, y + settle / 2, this._elapsed / 4);
        // Add more clouds for the final quarter of the animation
        if (this._elapsed > this._duration * 3 / 5) {
            p5.ellipse(x + this._width / 3, y + settle / 2, this._elapsed / 3.2);
            p5.ellipse(x - this._width / 3, y + settle / 2, this._elapsed / 3.2);
        }
    }

    render = (xOffset: number) => {
        const p5 = this._p5;
        const x = this._x - xOffset;      // For convenience
        const y = this._y;
        const w = this._width;
        const h = this._height;
        // Craft: Y = 0
        p5.stroke(constants.GRAY_LIGHT);
        p5.fill(constants.GRAY_DRY_ICE);
        p5.strokeWeight(4);
        p5.triangle(x, y, x + w / 2, y + h / 2, x - w / 2, y + h / 2);
        p5.fill(constants.GRAY_LIGHT);
        p5.stroke(constants.GRAY_DRY_ICE);
        p5.ellipse(x, y + h * 1.5, w, h / 3);
        p5.rect(x - w / 2, y + h / 2, w, h);
        p5.stroke(constants.BLUEGREEN_DARK);
        p5.arc(x, y + h * 1.8, w / 2, h / 3, 3.14, 0);
        p5.fill(constants.BLUE_BG);
        p5.quad(x + w / 4, y + h * 0.75, x - w / 4, y + h * 0.75, x - w / 4.5, y + h, x + w / 4.5, y + h);
        p5.fill(constants.GRAY_METEOR);
        p5.quad(x + w / 4.5, y + h * 1.25, x - w / 4.5, y + h * 1.25, x - w / 4, y + h * 1.5, x + w / 4, y + h * 1.5);
        // Landing legs
        p5.fill(constants.YELLOW_BG);
        p5.quad(x + w / 2.5, y + h * 1.5, x + w / 2.25, y + h * 1.5, x + w / 2, y + h * 1.85, x + w / 2.25, y + h * 1.85);
        p5.quad(x - w / 2.5, y + h * 1.5, x - w / 2.25, y + h * 1.5, x - w / 2, y + h * 1.85, x - w / 2.25, y + h * 1.85);
        p5.quad(x + w / 3.5, y + h * 1.5, x + w / 3, y + h * 1.5, x + w / 2.5, y + h * 1.85, x + w / 3, y + h * 1.85);
        p5.quad(x - w / 3.5, y + h * 1.5, x - w / 3, y + h * 1.5, x - w / 2.5, y + h * 1.85, x - w / 3, y + h * 1.85);
        // Flame: Y = Height * 2
        p5.fill(constants.YELLOW_TEXT);
        p5.stroke(constants.ORANGE_JUMPSUIT);
        p5.triangle(x, y + h * 2.5, x - w / 4, y + h * 2, x + w / 4, y + h * 2);
        p5.ellipse(x, y + h * 2, w / 2, h / 3);
        p5.stroke(constants.EGGSHELL);
        p5.triangle(x, y + h * 2.4, x - w / 4.5, y + h * 2, x + w / 4.5, y + h * 2);
        p5.stroke(constants.YELLOW_TEXT);
        p5.ellipse(x, y + h * 2, w / 2.8, h / 3)
        this.advanceAnimation();
        // Draw dust clouds if descend is vehicle is halfway to the surface
        if (this._elapsed >= this._duration / 2) {
            this.drawClouds(x);
        }
    }

}