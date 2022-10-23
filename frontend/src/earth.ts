// In-game view for displaying the tech tree
import P5 from "p5";
import View from "./view";
import Button from "./button";
import { constants } from "./constants";

export default class Earth extends View {
    // Earth Relations page Types:
    earthDate: Date;
    dateRemainder: number;

    constructor(p5: P5, changeView: (newView: string) => void) {
        super(p5, changeView);
        this.earthDate = new Date("January 1, 2030");       // Game starts on new year's day, 2030
        this.dateRemainder = 0;                             // Keep track of the remainder when adding days
    }

    setup = () => {
        this.currentView = true;
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5.text("Earth Diplomacy page", constants.SCREEN_WIDTH / 2, 128);
    }

    setEarthDate = (addDays: number) => {
        this.dateRemainder += addDays % 1;      // Add the remainder first
        if (this.dateRemainder >= 1) {
            this.earthDate.setDate(this.earthDate.getDate() + addDays + this.dateRemainder);
            this.dateRemainder = this.dateRemainder % 1;    // If remainder is bigger than one, add one then get the remainder's remainder
        } else {
            this.earthDate.setDate(this.earthDate.getDate() + addDays);
        }
    }

    render = () => {
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text("Earth diplomacy page rendered", constants.SCREEN_WIDTH / 2, 384);
        p5.text(`Earth Date: ${this.earthDate.toISOString().slice(0, 10)}`, 400, 150);
        p5.text(`Change: ${this.dateRemainder}`, 500, 180);
        this._buttons.forEach((button) => {
            button.render(p5);
        })
    }

}