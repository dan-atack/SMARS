// The top-level ancestor component, to form the different 'views' of the game's interface.
import P5 from "p5";
import AudioController from "./audioController";
import { constants } from "./constants";

export default class Screen {
    // Define types here; underscores represent a 'private' value i.e. one that should not be changed from outside:
    _p5: P5;
    _audio: AudioController;
    _width: number;
    _height: number;
    currentScreen: boolean;

    constructor(p5: P5, audio: AudioController) {
        this._p5 = p5;
        this._audio = audio;
        this._width = constants.SCREEN_WIDTH;
        this._height = constants.SCREEN_HEIGHT;
        this.currentScreen = false;
    }

    // App level sketch will not handle any aspect of the game's interface directly; even the background should be rendered here:
    render = () => {
        this._audio.handleUpdates();
        const p5 = this._p5;    // For convenience
        p5.background(constants.APP_BACKGROUND);

    }

    handleClick = () => {
        console.log('Screen clicked.');     // Overridden by instantiations
    }

}