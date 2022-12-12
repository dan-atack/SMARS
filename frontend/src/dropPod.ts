// The Drop Pod is a sprite used for the animation that plays when new colonists join the colony from Earth
import P5 from "p5";
import Lander from "./lander";
import { constants } from "./constants";

export default class DropPod extends Lander {
    constructor(x: number, y: number, destination: number, duration: number) {
        super(x, y, destination, duration);
        this._width = 2 * constants.BLOCK_WIDTH;        // Drop pods have more modest dimensions than the big lander
        this._height = 2.5 * constants.BLOCK_WIDTH;
        this._distance = this._destination - this._start - this._height;   // Start and distance may need alterations because of parachutes
    }

    // The advantage (hopefully) of using an inheritance of the Lander class is that we just need to make a render function and the rest takes care of itself. Just remember to call the advanceAnimation method at the END of the render block.
    render = (p5: P5, xOffset: number) => {
        const x = this._x - xOffset;      // For convenience
        const y = this._y;
        const w = this._width;
        const h = this._height;
        // Parachute
        p5.stroke(constants.ORANGE_JUMPSUIT);
        p5.strokeWeight(4);
        p5.fill(constants.EGGSHELL);
        p5.arc(x + w / 2, y - h * 3, w * 3, h * 3, 3.14, 0, p5.OPEN);
        // Chords
        p5.strokeWeight(1);
        p5.line(x + 8, y, x - 40, y - h * 3);
        p5.line(x + 8, y, x, y - h * 3);
        p5.line(x + w - 8, y, x + 40, y - h * 3);
        p5.line(x + w - 8, y, x + w + 40, y - h * 3);
        // Pod
        p5.stroke(constants.ALMOST_BLACK);
        p5.strokeWeight(2);
        p5.fill(constants.GRAY_MEDIUM);
        p5.quad(x + 5, y, x + w - 5, y, x + w, y + h, x, y + h);
        p5.fill(constants.BLUE_BG);
        p5.ellipse(x + w / 2, y + h / 2, w / 2);
        this.advanceAnimation();
    }
}