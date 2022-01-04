// In-game view for displaying the tech tree
import P5 from "p5";
import View from "./view";
import Button from "./button";
import { constants } from "./constants";

export default class TechTree extends View {
    // Tech Tree Types:

    constructor(p5: P5, changeView: (newView: string) => void) {
        super(p5, changeView);
    }

    setup = () => {
        this.currentView = true;
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5.text("Science page", constants.SCREEN_WIDTH / 2, 128);
    }

    render = () => {
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5.text("Science page rendered", constants.SCREEN_WIDTH / 2, 384);
        this._buttons.forEach((button) =>{
            button.render();
        })
    }

}