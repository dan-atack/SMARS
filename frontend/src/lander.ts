// The Lander is a sprite that is used for the landing sequence animation at the start of the game
import P5 from "p5";
import { constants } from "./constants";

export default class Lander {
    // Lander types:
    _p5: P5;
    _x: number;             // Lander's lateral position, which will always implicitly include horizontal offset
    _y: number;             // Lander's altitude, in classic inverted fashion
    _width: number;
    _height: number;
    _start: number;         // Initial altitude (0)
    _destination: number;   // Final altitude
    _duration: number;      // How many frames to animate
    _elapsed: number;       // How many frames have been shown

    constructor(p5: P5, x: number, y: number, start: number, destination: number, duration: number) {
        this._p5 = p5;
        this._x = x;
        this._y = y;
        this._width = 8 * constants.BLOCK_WIDTH;        // Should this be in terms of grid spaces? Maybe not...?
        this._height = 6 * constants.BLOCK_WIDTH;       // Rough guesstimate... these values are only temporary in any case
        this._start = start;
        this._destination = destination;
        this._duration = duration;
        this._elapsed = 0;  // Count up to the duration, instead of decrementing it
    }

    render = () => {
        const p5 = this._p5;
        p5.ellipse(this._x, this._y, this._width);
        p5.fill(constants.ORANGE_JUMPSUIT);
        p5.strokeWeight(0);
        p5.ellipse(this._x, this._y + this._width / 2, this._width / 2);
    }

}