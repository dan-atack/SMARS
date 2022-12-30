// The Sky class helps the Engine render the atmosphere and weather in the game
import P5 from "p5";
import { constants } from "./constants";

export default class Sky {
    // Sky data types:
    _skyColour: string;                 // The hex code for the sky's colour, which will be altered depending on the time of day
    _starDensity: number                // Value, ideally from 1 to 64, of stars in the night sky
    _starPositions: [number, number, number][]        // The x, y, and size value for each star

    constructor() {
        this._skyColour = constants.ALMOST_BLACK;       // Sky is pitch black at midnight
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

    // Takes the AM/PM cycle and current hour and sets the sky's colour based on that
    setSkyColour = (day: boolean, cycle: string, hour: number) => {
        if (day) {
            this._skyColour = constants.YELLOW_SKY;
        } else {
            this._skyColour = constants.ALMOST_BLACK;
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
        p5.background(this._skyColour);
        if (day) {
            // Render a gradient here??
        } else {
            this.renderStars(p5);
        }
        p5.text(`Daytime: ${day}`, 100, 300);
    }
}