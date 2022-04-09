// The Save Game screen is where the player goes to review and name their save file before uploading it to the game's server
import P5 from "p5";
import Screen from "./screen";
import Button from "./button";
import { constants } from "./constants";
import p5 from "p5";

// Save Game type info
export type SaveInfo = {
    game_name: string           // Save game name
    username: string            // Name of the username associated with this save
    time: Date                  // Timestamp for the save file
    game_time: {                // The time on SMARS
        minute: number,
        hour: number,
        cycle: string,
        sol: number,
        year: number
    }
    difficulty: string          // Easy, medium or hard - values will be inserted into switch cases throughout the game
    map_type: string            // From the game's initial settings
    terrain: number[][]         // The 'map' consists of terrain plus structures plus sprites
    random_events: boolean      // From the game's initial settings
    modules: {                  // Store only a minimal amount of data on the individual modules
        name: string,
        x: number,
        y: number
    }[]
    connectors: {               // Connector data's shape will eventually change, but for now it's basically the same as a module
        name: string,
        x: number,
        y: number
    }[]

}

export default class SaveGame extends Screen {
    // Types for the save game screen:
    switchScreen: (switchTo: string) => void;
    _buttons: Array<Button>;
    _gameNameInput: p5.Element | null;
    _color: string;
    _buttonWidth: number;
    _buttonHeight: number;
    _buttonX: number;
    _buttonY: number;
    _buttonText: string;
    _buttonBG: string;
    _justOpened: boolean;       // Experimental prototype method for preventing 'double click' phenomenon on when screen loads
    _saveInfo: SaveInfo | null; // Prepare to store the save info when the game loads this screen

    constructor(p5: P5, switchScreen: (switchTo: string) => void) {
        super(p5);
        this.switchScreen = switchScreen;
        this._buttons = [];
        this._gameNameInput = null;             // This starts as null when the game is first created and is created during setup
        this._color = constants.APP_BACKGROUND;
        // Standardize button dimensions and positioning:
        this._buttonWidth = 384;
        this._buttonHeight = 112;
        this._buttonX = 288;
        this._buttonY = 420;
        this._buttonText = constants.GREEN_TERMINAL;
        this._buttonBG = constants.GREEN_DARK;
        this._justOpened = false;           // Setup function sets this to true, which will block the very first click response
        this._saveInfo = null;              // When the constructor is first deployed there is not yet any info to save
    }

    // Setup makes the buttons and the input elements:
    setup = (saveInfo: SaveInfo) => {
        this.currentScreen = true;
        this._saveInfo = saveInfo;
        this._gameNameInput = this._p5.createInput(`${saveInfo.username}'s game`); // Input field is created at setup time
        this._gameNameInput.parent("app");
        this._gameNameInput.addClass("save-game-name");
        const saveGame = new Button(this._p5, "Save Game", this._buttonX, this._buttonY, this.handleSave, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        const returnToGame = new Button(this._p5, "Return to Main Menu", this._buttonX, this._buttonY + this._buttonHeight + 16, this.handleReturnToMainMenu, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        this._buttons = [saveGame, returnToGame];
        this._justOpened = true;        // Set to true to block first click responder from firing
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        if (!this._justOpened) {
            this._buttons.forEach((button) => {
                button.handleClick(mouseX, mouseY);
            })
        } else {
            this._justOpened = false;
        }
    }

    handleSave = () => {
        const game_name = this._gameNameInput?.value() as string;
        if (this._saveInfo != null && game_name.length > 2) {
            console.log("proceeding with save.");
            let finalData = this._saveInfo;
            finalData.game_name = game_name;
            console.log(finalData);
        } else if (this._saveInfo != null) {
            console.log("Please enter at least 3 characters for the game name.")
        } else {
            console.log("Exception: No save occurred because save data was missing")
        }
    }

    handleReturnToMainMenu = () => {
        console.log("Returning to main menu.");
        this.handleClose();
        this.switchScreen("inGameMenu");
    }

    handleClose = () => {
        this.currentScreen = false;
        this._p5.clear();
        this._gameNameInput?.remove();
    }

    render = () => {
        const p5 = this._p5;
        p5.background(this._color);
        p5.textSize(42);
        p5.fill(constants.EGGSHELL);
        p5.textStyle(p5.BOLD);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.text("Enter name", 480, 96);
        p5.text("for new save file:", 480, 144);
        this._buttons.forEach((button) => {
            button.render();
        })
    }
}

