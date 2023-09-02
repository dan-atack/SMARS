// The In-game view component, to form the different 'views' of the game's interface (distinct from the App's Screens)
import P5 from "p5";
import AudioController from "./audioController";
import Button from "./button";
import { constants } from "./constants";

export default class View {
    // View essential types:
    _audio: AudioController;
    _width: number;
    _height: number;
    _header: string;    // Title field for descendent classes
    currentView: boolean;
    changeView: (newView: string) => void;
    _buttons: Button[];

    constructor(audio: AudioController, changeView: (newView: string) => void) {
        this._audio = audio;
        this._width = constants.SCREEN_WIDTH;
        this._height = constants.SCREEN_HEIGHT;
        this._header = ""   // Display title for the view; can be set individually by inheritor classes
        this.currentView = false;
        this.changeView = changeView;
        this._buttons = [];
        const returnToGame = new Button(
            "Return to Game",
            this._width / 2 - 128,
            560,
            this.handleReturnToGame,
            256,
            128,
            constants.GREEN_TERMINAL,
            constants.GREEN_DARK,
            32
        );
        this._buttons.push(returnToGame);   // Button zero is 'return to game' for all view screens
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        })
    }

    handleReturnToGame = () => {
        this._audio.quickPlay("ting01");
        this.changeView("engine");
    }

    // Don't put too much in here as most of the descendent classes will override this:
    render = (p5: P5) => {
        p5.background(constants.APP_BACKGROUND);
        this._buttons.forEach((button) => {
            button.render(p5);
        })
    }

}