// The Drop Pod is a sprite used for the animation that plays when new colonists join the colony from Earth
import P5 from "p5";
import Lander from "./lander";
import { constants } from "./constants";

export default class DropPod extends Lander {
    // Drop Pod specific types
    _parachuteY: number;        // Separate coordinate system for controlling parachute descent

    constructor(x: number, y: number, destination: number, duration: number) {
        super(x, y, destination, duration);
        this._width = 2 * constants.BLOCK_WIDTH;        // Drop pods have more modest dimensions than the big lander
        this._height = 2.5 * constants.BLOCK_WIDTH;
        this._distance = this._destination - this._start - this._height;
        this._parachuteY = this._y - this._height * 3;
    }

    // Separate animation script for the parachutes to keep falling after the main capsule has touched down
    drawParachute = (p5: P5, x: number) => {
        // Whole assembly is in freefall
        if (this._elapsed <= this._duration) {
            this._parachuteY = this._y - this._height * 3;
        } else {
        // Parachute continues to descend after main capsule touches down
            this._parachuteY = (this._start + (this._elapsed * this._distance / this._duration)) - this._height * 3;
        }
        const w = this._width;
        const h = this._height;
        // Chute
        p5.stroke(constants.ORANGE_JUMPSUIT);
        p5.strokeWeight(4);
        p5.fill(constants.EGGSHELL);
        p5.arc(x + w / 2, this._parachuteY, w * 3, h * 3, 3.14, 0, p5.OPEN);
        // Chords
        p5.strokeWeight(1);
        p5.line(x + 8, this._y, x - 40, this._parachuteY);
        p5.line(x + 8, this._y, x, this._parachuteY);
        p5.line(x + w - 8, this._y, x + 40, this._parachuteY);
        p5.line(x + w - 8, this._y, x + w + 40, this._parachuteY);
    }

    // The advantage (hopefully) of using an inheritance of the Lander class is that we just need to make a render function and the rest takes care of itself. Just remember to call the advanceAnimation method at the END of the render block.
    render = (p5: P5, xOffset: number) => {
        const x = this._x - xOffset;      // For convenience
        const y = this._y;
        const w = this._width;
        const h = this._height;
        // Render parachute separately so it can continue to descend after main capsule touches down
        this.drawParachute(p5, x);
        // Render landing pod
        p5.stroke(constants.ALMOST_BLACK);
        p5.strokeWeight(2);
        p5.fill(constants.GRAY_MEDIUM);
        p5.quad(x + 5, y, x + w - 5, y, x + w, y + h, x, y + h);
        p5.fill(constants.BLUE_BG);
        p5.ellipse(x + w / 2, y + h / 2, w / 2);
        this.advanceAnimation();
    }
}