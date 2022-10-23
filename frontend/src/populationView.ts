// In-game view for displaying the tech tree
import P5 from "p5";
import View from "./view";
import Button from "./button";
import { constants } from "./constants";

export default class PopulationView extends View {
    // Population Overview page Types:
    _population: number;                // Start with very basic info about the colony's population

    constructor(p5: P5, changeView: (newView: string) => void) {
        super(p5, changeView);
        this._population = 0;           // By default there is zero population (gets set by the setup routine)
    }

    setup = (population: number) => {
        this.currentView = true;
        this.setPopulation(population);
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5.text("Population page", constants.SCREEN_WIDTH / 2, 128);
    }

    setPopulation = (population: number) => {
        this._population = population;
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
        p5.text("Colony Population Overview", constants.SCREEN_WIDTH / 2, 128);
        p5.textAlign(p5.LEFT, p5.CENTER);
        p5.textSize(20);
        p5.text(`Number of Colonists: ${this._population}`, constants.SCREEN_WIDTH / 8, 256);
        p5.text("Colony health rating: Fair", constants.SCREEN_WIDTH / 8, 288);
        p5.text("Colony morale rating: Plucky", constants.SCREEN_WIDTH / 8, 320);
        this._buttons.forEach((button) =>{
            button.render(p5);
        })
    }

}