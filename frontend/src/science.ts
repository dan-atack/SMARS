// In-game view for displaying the tech tree
import P5 from "p5";
import AudioController from "./audioController";
import View from "./view";
import Button from "./button";
import { constants } from "./constants";

export default class Science extends View {
    // Tech Tree Types:

    constructor(audio: AudioController, changeView: (newView: string) => void) {
        super(audio, changeView);
    }

    setup = () => {
        this.currentView = true;
    }

    render = (p5: P5) => {
        p5.background(constants.APP_BACKGROUND);
        p5.text("Colony Science Report", constants.SCREEN_WIDTH / 2, 128);
        p5.textAlign(p5.LEFT);
        p5.textSize(24);
        p5.fill(constants.EGGSHELL);
        p5.text("Here at the SMARS Corporation, our mission is to maximize profits for our shareholders", 64, 250);
        p5.text("by avoiding unnecessary expenditures, such as research and development.", 64, 280);
        p5.text("We encourage all our employees to trust that the current state of the science is complete,", 64, 340);
        p5.text("settled, and accurate in every way (subject to change without notice).", 64, 370);
        p5.text("The executive team thanks you for your understanding.", 64, 430);
        this._buttons.forEach((button) =>{
            button.render(p5);
        })
    }

}