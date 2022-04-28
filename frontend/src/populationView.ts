// In-game view for displaying the tech tree
import P5 from "p5";
import View from "./view";
import Button from "./button";
import { constants } from "./constants";

export default class PopulationView extends View {
    // Population Overview page Types:

    constructor(p5: P5, changeView: (newView: string) => void) {
        super(p5, changeView);
    }

    setup = () => {
        this.currentView = true;
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5.text("Population page", constants.SCREEN_WIDTH / 2, 128);
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        })
    }

    // Button handler calls view change function with argument:
    handleReturnToGame = () => {
        this.changeView("engine");
    }

    render = () => {
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5.text("Population page rendered", constants.SCREEN_WIDTH / 2, 384);
        this._buttons.forEach((button) =>{
            button.render();
        })
    }

}