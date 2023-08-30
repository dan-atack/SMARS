// The in-game menu, accessed during a game:
import P5 from "p5";
import AudioController from "./audioController";
import Screen from "./screen";
import Button from "./button";
import { constants } from "./constants";

export default class InGameMenu extends Screen {
    // In-game menu types:
    _buttons: Array<Button>;
    _color: string;
    _username: string;
    _center: number;
    _buttonWidth: number;
    _buttonHeight: number;
    _buttonX: number;
    _buttonY: number;
    _buttonPadding: number;
    _buttonText: string;
    _buttonBG: string;
    switchScreen: (switchTo: string) => void;

    constructor(p5: P5, audio: AudioController, switchScreen: (switchTo: string) => void) {
        super(p5, audio);
        this._buttons = [];
        this._color = constants.APP_BACKGROUND;
        this._username = "";    // This will be set after the initial construction of this class, once login is completed.
        // Standardize button dimensions and positioning:
        this._center = constants.SCREEN_WIDTH / 2;
        this._buttonWidth = 384;
        this._buttonHeight = 112;
        this._buttonX = this._center - this._buttonWidth / 2;
        this._buttonY = 232;
        this._buttonPadding = 12;
        this._buttonText = constants.GREEN_TERMINAL;
        this._buttonBG = constants.GREEN_DARK;
        this.switchScreen = switchScreen;
    }

    setup = () => {
        this.currentScreen = true;
        const saveGame = new Button("Save Game", this._buttonX, this._buttonY, this.handleSave, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        const quitToMainMenu = new Button("Quit to Main Menu", this._buttonX, this._buttonY + (this._buttonHeight + this._buttonPadding) * 2, this.handleQuitToMainMenu, this._buttonWidth, this._buttonHeight, constants.RED_ERROR, constants.RED_BG);
        const returnToGame = new Button("Return to Game", this._buttonX, this._buttonY + this._buttonHeight + this._buttonPadding, this.handleReturnToGame, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        this._buttons = [saveGame, quitToMainMenu, returnToGame];
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

    handleQuitToMainMenu = () => {
        this.handleClose();
        this.switchScreen("menu");
    }

    handleReturnToGame = () => {
        this.handleClose();
        this.switchScreen("game");
    }

    render = () => {
        this._audio.handleUpdates();
        const p5 = this._p5;
        p5.background(this._color);
        p5.textSize(48);
        p5.fill(constants.EGGSHELL);
        p5.textStyle(p5.BOLD);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.text("Just what do you think", this._center, 80);
        p5.text(`you're doing, ${this._username}?`, this._center, 136);
        this._buttons.forEach((button) => {
            button.render(p5);
        })
    }

    handleClose = () => {
        this.currentScreen = false;
        this._p5.clear();
    }

}