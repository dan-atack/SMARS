// The in-game menu, accessed during a game:
import P5 from "p5";
import AudioController from "./audioController";
import Screen from "./screen";
import Button from "./button";
import { constants } from "./constants";

export default class InGameMenu extends Screen {
    // In-game menu types:
    _buttons: Button[];
    _confirmButtons: Button[];     // Keep track of the 'confirm quit' / 'cancel quit' buttons separately from the others
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
    _confirmExit: boolean;                      // Toggles display of the 'Are you sure?' dialogue if the player clicks the 'quit to main menu' button
    switchScreen: (switchTo: string) => void;

    constructor(p5: P5, audio: AudioController, switchScreen: (switchTo: string) => void) {
        super(p5, audio);
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
        this._buttons = [];     // Regular buttons are created by the 'setup' method... for reasons.
        this._confirmButtons = [
            new Button("Confirm!\nOpen the pod bay doors!", this._buttonX, this._buttonY, this.handleConfirmQuit, this._buttonWidth, this._buttonHeight, constants.RED_ERROR, constants.RED_BG, 32), new Button("No, no, no! I was just\ntesting the button...", this._buttonX, this._buttonY + (this._buttonHeight + this._buttonPadding), this.handleCancelQuit, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK, 22)
        ];       // Confirm buttons, which are not shown initially, is created by the constructor, however. Highly Logical.
        this._confirmExit = false;                  // Wait for the player to click the button before confirming
        this.switchScreen = switchScreen;
    }

    setup = () => {
        this.currentScreen = true;
        this._confirmExit = false;  // Always reset exit confirm status when setting up the in-game menu
        const saveGame = new Button("Save Game", this._buttonX, this._buttonY, this.handleSave, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        const quitToMainMenu = new Button("Quit to Main Menu", this._buttonX, this._buttonY + (this._buttonHeight + this._buttonPadding) * 2, this.handleQuitToMainMenu, this._buttonWidth, this._buttonHeight, constants.RED_ERROR, constants.RED_BG);
        const returnToGame = new Button("Return to Game", this._buttonX, this._buttonY + this._buttonHeight + this._buttonPadding, this.handleReturnToGame, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        this._buttons = [saveGame, quitToMainMenu, returnToGame];
    }

    setUsername = (username: string) => {
        this._username = username;
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        if (this._confirmExit) {
            this._confirmButtons.forEach((button) => {
                button.handleClick(mouseX, mouseY);
            })
        } else {
            this._buttons.forEach((button) => {
                button.handleClick(mouseX, mouseY);
            })
        }
    }

    handleSave = () => {
        this._audio.quickPlay("ting01");
        this.currentScreen = false;
        this.switchScreen("save");
    }

    handleQuitToMainMenu = () => {
        this._audio.quickPlay("confirm");
        this._confirmExit = true;     // Show the confirm button only if the player requests it via the quit button
    }

    handleConfirmQuit = () => {
        this._audio.quickPlay("quit");
        this.handleClose();
        this.switchScreen("menu");
    }

    handleCancelQuit = () => {
        this._audio.quickPlay("ting01");
        this._confirmExit = false;      // Returns to the regular state of the in-game menu
    }

    handleReturnToGame = () => {
        this._audio.quickPlay("ting01");
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
        if (this._confirmExit) {
            p5.text(`Are you sure you want to quit, ${this._username}?`, this._center, 80);
            p5.text(`I don't think that's wise.`, this._center, 136);
            this._confirmButtons.forEach((button) => {
                button.render(p5);
            })
        } else {
            p5.text("Just what do you think", this._center, 80);
            p5.text(`you're doing, ${this._username}?`, this._center, 136);
            this._buttons.forEach((button) => {
                button.render(p5);
            })
        }
    }

    handleClose = () => {
        this.currentScreen = false;
        this._p5.clear();
    }

}