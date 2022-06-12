// The Lander is a sprite that is used for the landing sequence animation at the start of the game
import P5 from "p5";
import { constants } from "./constants";

export default class Lander {
    // Lander types:
    _p5: P5;
    _x: number;             // Lander's lateral position, in pixels
    _y: number;             // Lander's altitude, in pixels
    _width: number;
    _height: number;
    _start: number;         // Initial altitude (0)
    _destination: number;   // Final altitude
    _distance: number;      // Distance between start and destination
    _duration: number;      // How many frames to animate
    _elapsed: number;       // How many frames have been shown

    constructor(p5: P5, x: number, y: number, start: number, destination: number, duration: number) {
        this._p5 = p5;
        this._x = x;                                    // All values (x, y, w, h) are in terms of PIXELS
        this._y = y;
        this._width = 8 * constants.BLOCK_WIDTH;
        this._height = 6 * constants.BLOCK_WIDTH;       // Rough guesstimate... these values are only temporary in any case
        this._start = start;
        this._destination = destination;
        this._distance = this._destination - this._start;
        this._duration = duration;
        this._elapsed = 0;  // Count up to the duration, instead of decrementing it
    }

    advanceAnimation = () => {
        if (this._elapsed <= this._duration) {
            this._y = this._start + (this._elapsed * this._distance / this._duration);    // Update height parameter (plus equals downwards)
            this._elapsed++;
        }
    }

    render = (xOffset: number) => {
        const p5 = this._p5;
        const x = this._x - xOffset;
        p5.ellipse(x, this._y, this._width);
        p5.fill(constants.ORANGE_JUMPSUIT);
        p5.strokeWeight(0);
        p5.ellipse(x, this._y + this._width / 2, this._width / 2);
        this.advanceAnimation();
    }

}