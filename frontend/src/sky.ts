// The Sky class helps the Engine render the atmosphere and weather in the game
import P5 from "p5";
import { constants } from "./constants";

export default class Sky {
    // Sky data types:
    _skyColourPrimary: string; // The hex code for the sky's primary colour, which will be altered depending on the time of day
    _skyColourSecondary: string;    // The hex code for the sky's secondary colour, which determines level of darkness
    _starDensity: number                // Value, ideally from 1 to 64, of stars in the night sky
    _starPositions: [number, number, number][]        // The x, y, and size value for each star

    constructor() {
        this._skyColourPrimary = constants.ALMOST_BLACK;            // Sky is pitch black at midnight
        this._skyColourSecondary = constants.GREEN_DARKEST;         // Secondary colour is also quite dark
        this._starDensity = 32;                         // Number of stars to add to the night sky
        this._starPositions = [];
        // Randomly generate new star positions
        for (let i = 0; i < this._starDensity; i ++) {
            const x = Math.floor(Math.random() * constants.WORLD_VIEW_WIDTH);
            const y = Math.floor(Math.random() * (constants.SCREEN_HEIGHT - 200))
            const size = Math.ceil(Math.random() * 4);  // Possible sizes are 1 - 4 diameter
            const data: [number, number, number] = [x, y, size];
            this._starPositions.push(data);
        }
    }

    // Translates colour hexes into numbers for the purpose of brightening/dimming the primary/secondary sky colour
    updateHexCode = (brightening: boolean) => {
        const code = this._skyColourSecondary;
        const digits: string[] = code.split("").filter((char) => char !== "#");
        let converted = "#";
        digits.forEach((digit) => {
            let val = parseInt(digit, 16);
            if (brightening) {
                val = Math.min(val + 1, 15);
            } else {
                val = Math.max(val - 1, 0);
            }
            const hex = val.toString(16);
            converted += hex;
        })
        return converted;
    }

    setSkyColour = (colour: string, primary: boolean) => {
        if (primary) {
            this._skyColourPrimary = colour;
        } else {
            this._skyColourSecondary = colour;
        }
    }

    // Takes the AM/PM cycle and current hour and sets the sky's colour based on that
    updateSkyColour = (day: boolean, cycle: string) => {
        if (day) {
            this._skyColourPrimary = constants.YELLOW_SKY;
            if (cycle === "AM") {
                // Brighten the sky if it is daytime before noon
                this._skyColourSecondary = this.updateHexCode(true);
            } else {
                this._skyColourSecondary = this.updateHexCode(false);
            }   
        } else {
            this._skyColourPrimary = constants.ALMOST_BLACK;
            if (cycle === "AM") {
                this._skyColourSecondary = this.updateHexCode(true);
            } else {
                this._skyColourSecondary = this.updateHexCode(false);
            }
            this.updateHexCode(false);
        }
    }

    renderSky = (p5: P5) => {
        // For convenience
        const y = 0;
        const h = constants.SCREEN_HEIGHT;
        const c1 = p5.color(this._skyColourPrimary);
        const c2 = p5.color(this._skyColourSecondary);
        for (let i = y; i <= y + h; i++) {
            let inter = p5.map(i, y, y + h, 0, 1);
            let c = p5.lerpColor(c2, c1, inter);
            p5.stroke(c);
            p5.line(0, i, constants.SCREEN_WIDTH, i);
          }
    }

    renderStars = (p5: P5) => {
        p5.fill(constants.EGGSHELL);
        p5.strokeWeight(0);
        this._starPositions.forEach((star) => {
            p5.ellipse(star[0], star[1], star[2]);
        })
    }

    render = (p5: P5, day: boolean) => {
        this.renderSky(p5);
        if (!(day)) {
            this.renderStars(p5);
        }
        // p5.text(`Primary: ${this._skyColourPrimary}`, 100, 300);
        // p5.text(`Secondary: ${this._skyColourSecondary}`, 100, 330);
    }
}