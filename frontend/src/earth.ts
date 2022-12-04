// In-game view for displaying the tech tree
import P5 from "p5";
import View from "./view";
import Button from "./button";
import { constants } from "./constants";

export default class Earth extends View {
    // Earth Relations page Types:
    earthDate: Date;
    dateRemainder: number;

    constructor(changeView: (newView: string) => void) {
        super(changeView);
        this.earthDate = new Date("January 1, 2030");       // Game starts on new year's day, 2030
        this.dateRemainder = 0;                             // Keep track of the remainder when adding days
    }

    setup = () => {
        this.currentView = true;
    }

    // Optionally load the Earth date from a saved game, if it's there
    loadSavedDate = (earthDate?: { date: Date, remainder: number }) => {
        console.log(earthDate);
        if (earthDate) {
            const date = new Date(earthDate.date);
            this.earthDate = date;
            this.dateRemainder = earthDate.remainder;
        } else {
            console.log("Legacy save loaded. No Earth date data available.");
        }
    }

    // Adds 7.15 days to the Earth date for every game hour that passes
    setEarthDate = (addDays: number) => {
        // Date remainder value must be divided by 100 since we only use integers (ie 7.15 is passed to this function as 715)
        this.dateRemainder += addDays % 100;      // Add the remainder first
        if (this.dateRemainder >= 100) {
            this.earthDate.setDate(this.earthDate.getDate() + addDays / 100 + 1);
            this.dateRemainder = this.dateRemainder % 100;    // If remainder is bigger than 100, add one then get the remainder's remainder
        } else {
            this.earthDate.setDate(this.earthDate.getDate() + addDays / 100 );
        }
    }

    render = (p5: P5) => {
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