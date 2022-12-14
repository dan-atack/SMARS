// In-game view for displaying the tech tree
import P5 from "p5";
import View from "./view";
import Button from "./button";
import { constants } from "./constants";

export default class IndustryView extends View {
    // Industry overview Types:

    constructor(changeView: (newView: string) => void) {
        super(changeView);
    }

    setup = () => {
        this.currentView = true;
    }

    render = (p5: P5) => {
        p5.background(constants.APP_BACKGROUND);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text("Colony Industry Report", constants.SCREEN_WIDTH / 2, 64);
        this._buttons.forEach((button) => {
            button.render(p5);
        })
    }

}