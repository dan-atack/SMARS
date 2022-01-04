// The in-game sidebar (control panel) is a sub-component of the Engine view
import P5 from "p5";
import Button from "./button";
import { constants } from "./constants";

export default class Sidebar {
    // Sidebar types:
    _p5: P5;
    _width: number;
    _height: number;
    _viewButtonWidth: number;
    _viewButtonHeight: number;
    _position: number;
    _buttons: Button[];
    switchScreen: (switchTo: string) => void;   // App-level SCREEN switcher (passed down via drill from the app)
    changeView: (newView: string) => void;      // Game-level VIEW switcher (passed down from the game module)

    constructor(p5:P5, switchScreen: (switchTo: string) => void, changeView: (newView: string) => void) {
        this._p5 = p5;
        this._width = constants.SCREEN_WIDTH / 4 // One quarter of the screen is given to the sidebar
        this._height = constants.SCREEN_HEIGHT
        this._position = constants.SCREEN_WIDTH - this._width;
        this._viewButtonWidth = this._width / 2;
        this._viewButtonHeight = this._width / 4;
        this._buttons = [];
        this.switchScreen = switchScreen;
        this.changeView = changeView;
    }

    setup = () => {
        // Create view-changing buttons:
        const earth = new Button(this._p5, "Earth", this._position, 150, this.handleEarth, this._viewButtonWidth, this._viewButtonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK, 24);
        const industry = new Button(this._p5, "Industry", this._position + this._viewButtonWidth, 150, this.handleIndustry, this._viewButtonWidth, this._viewButtonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK, 24);
        const tech = new Button(this._p5, "Technology", this._position, 150 + this._viewButtonHeight, this.handleTech, this._viewButtonWidth, this._viewButtonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK, 20);
        const population = new Button(this._p5, "Population", this._position + this._viewButtonWidth, 150 + this._viewButtonHeight, this.handlePopulation, this._viewButtonWidth, this._viewButtonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK, 22);
        this._buttons = [earth, industry, tech, population];
    }

    // General-purpose click dispatcher
    handleClicks = (mouseX: number, mouseY: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        })
    }

    // Handlers for changing views:
    handleEarth = () => {
        this.changeView("earth");
    }

    handleIndustry = () => {
        this.changeView("industry");
    }

    handleTech = () => {
        this.changeView("tech");
    }

    handlePopulation = () => {
        this.changeView("population");
    }

    render = () => {
        const p5 = this._p5;
        p5.fill(constants.SIDEBAR_BG);
        p5.rect(this._position, 0, this._width, this._height);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text("sidebar", this._position + this._width / 2, 80);
        this._buttons.forEach((button) => {
            button.render();
        })
    }

}