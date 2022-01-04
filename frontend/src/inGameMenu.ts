// The in-game menu, accessed during a game:
import P5 from "p5";
import Screen from "./screen";
import Button from "./button";
import { constants } from "./constants";

export default class InGameMenu extends Screen {
    // In-game menu types:
    _buttons: Array<Button>;
    _color: string;
    _username: string;
    _buttonWidth: number;
    _buttonHeight: number;
    _buttonX: number;
    _buttonText: string;
    _buttonBG: string;
    switchScreen: (switchTo: string) => void;

    constructor(p5: P5, switchScreen: (switchTo: string) => void) {
        super(p5);
        this._buttons = [];
        this._color = constants.APP_BACKGROUND;
        this._username = "";    // This will be set after the initial construction of this class, once login is completed.
        // Standardize button dimensions and positioning:
        this._buttonWidth = 384;
        this._buttonHeight = 112;
        this._buttonX = 288;
        this._buttonText = constants.GREEN_TERMINAL;
        this._buttonBG = constants.GREEN_DARK;
        this.switchScreen = switchScreen;
    }

    setup = () => {
        this.currentScreen = true;
        const saveGame = new Button(this._p5, "Save Game", this._buttonX, 176, this.handleSave, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        const returnToGame = new Button(this._p5, "Return to Game", this._buttonX, 304, this.handleReturnToGame, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        this._buttons = [saveGame, returnToGame];
    }

    setUsername = (username: string) => {
        this._username = username;
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        })
    }

    handleSave = () => {
        this.currentScreen = false;
        this.switchScreen("save");
    }

    handleReturnToGame = () => {
        this.currentScreen = false;
        this.switchScreen("game");
    }

    render = () => {
        const p5 = this._p5;
        p5.background(this._color);
        p5.textSize(48);
        p5.fill(constants.EGGSHELL);
        p5.textStyle(p5.BOLD);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.text(`Welcome to SMARS, ${this._username}`, 480, 80);
        this._buttons.forEach((button) => {
            button.render();
        })
    }

    handleClose = () => {
        this.currentScreen = false;
    }

}