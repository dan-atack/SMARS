import P5 from "p5";
import Screen from "./screen";
import Button from "./button";
import AudioController from "./audioController";
import { constants } from "./constants";

// Main Menu (Pre-game)
export default class Menu extends Screen {
    // Define types new to Menu class:
    _buttons: Button[];
    _color: string;
    _username: string;
    _buttonWidth: number;
    _buttonHeight: number;
    _buttonX: number;
    _buttonText: string;
    _buttonBG: string;
    switchScreen: (switchTo: string) => void;

    constructor(p5: P5, audio: AudioController, color: string, switchScreen: (switchTo: string) => void) {
        super(p5, audio);
        this._buttons = [];
        this._color = color;
        this._username = "";    // This will be set after the initial construction of this class, once login is completed.
        // Standardize button dimensions and positioning:
        this._buttonWidth = 384;
        this._buttonHeight = 112;
        this._buttonX = constants.SCREEN_WIDTH / 2 - this._buttonWidth / 2;
        this._buttonText = constants.GREEN_TERMINAL;
        this._buttonBG = constants.GREEN_DARK;
        this.switchScreen = switchScreen;
        
    }

    setup = () => {
        this.currentScreen = true;
        const newGame = new Button(
            "New Game",
            this._buttonX,
            176,
            this.handleNewGame,
            this._buttonWidth,
            this._buttonHeight,
            this._buttonText,
            this._buttonBG
        );
        const loadGame = new Button(
            "Load Game",
            this._buttonX,
            304,    // Buttons are 128 pixels apart on the Y axis
            this.handleLoadGame,
            this._buttonWidth,
            this._buttonHeight,
            this._buttonText,
            this._buttonBG
        );
        const preferences = new Button (
            "Preferences",
            this._buttonX,
            432,    // Buttons are 128 pixels apart on the Y axis
            this.handlePreferences,
            this._buttonWidth,
            this._buttonHeight,
            constants.ALMOST_BLACK,
            constants.GRAY_MEDIUM
        );
        const logout = new Button (
            "Return to Login",
            this._buttonX,
            560,
            this.handleLogout,
            this._buttonWidth,
            this._buttonHeight,
            this._buttonText,
            this._buttonBG
        )
        this._buttons = [newGame, loadGame, preferences, logout];
    }

    setUsername = (username: string) => {
        this._username = username;
    }

    handleNewGame = () => {
        this._audio.quickPlay("ting01");
        this.handleCloseMenu();
        this.switchScreen("newGameSetup");
    }

    handleLoadGame = () => {
        this._audio.quickPlay("ting01");
        this.handleCloseMenu();
        this.switchScreen("loadGame");
    }

    handlePreferences = () => {
        this._audio.quickPlay("fail02");        // Fail 2 is more of a "dud" sound than an "error" sound
        console.log("The Button you have pressed: \"Preferences\" is not in service. Please make a note of it.");
        // this.handleCloseMenu();
        // this.switchScreen("preferences");
    }

    handleLogout = () => {
        this._audio.quickPlay("ting01");
        this._username = "";
        this.handleCloseMenu();
        this.switchScreen("login");
    }

    render = () => {
        this._audio.handleUpdates();
        const p5 = this._p5;
        p5.background(this._color);
        p5.textSize(48);
        p5.fill(constants.EGGSHELL);
        p5.textStyle(p5.BOLD);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.text(`Welcome to SMARS, ${this._username}`, constants.SCREEN_WIDTH / 2, 80);
        this._buttons.forEach((button) => {
            button.render(p5);
        })
    }

    // Not the most elegant, but menus can afford to ask each of their buttons if they are clicked like this:
    handleClicks = (mouseX: number, mouseY: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        })
    }

    // When we close the menu, we'll tell it which screen to go to next
    handleCloseMenu = () => {
        this._p5.clear();
        this.currentScreen = false;
    }

}