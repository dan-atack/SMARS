// The Save Game screen is where the player goes to review and name their save file before uploading it to the game's server
import P5 from "p5";
import p5 from "p5";
import Screen from "./screen";
import Button from "./button";
import { constants } from "./constants";
import { sendSaveGame } from "./server_functions";
import { Resource } from "./economyData";
import { ColonistSaveData } from "./colonist";
import { Coords } from "./connector";
import { MiningLocations } from "./industry";

// Save Game type info
export type GameTime = {
    minute: number,
    hour: number,
    cycle: string,
    sol: number,    // The Smartian day is called a 'Sol'
    year: number    // Smartian year (AKA mission year) is the amount of times SMARS has orbited the sun since mission start (Lasts approximately twice as long as a Terrestrial year).
}

export type ModuleSaveInfo = {
    id: number,
    name: string,
    type: string,           // Module type info is needed to complete search parameters when re-fetching full data object
    x: number,
    y: number,
    resources: Resource[],
    crewPresent: number[],  // IDs of crew present
    isMaintained: boolean   // Current maintenance status
}

export type ConnectorSaveInfo = {
    id: number,
    name: string,
    type: string,
    segments: {start: Coords, stop: Coords}[],  // Connectors all consist of pairs of start/stop coordinates
}

export type SaveInfo = {
    game_name: string,          // Save game name
    username: string,           // Name of the username associated with this save
    time: Date,                 // Timestamp for the save file
    game_time: GameTime,        // Smars date
    earth_dates: {              // Earth dates includes a date element and a number for the remainder, which is a fraction of a day
        date: Date,
        remainder: number,
        nextLaunch: Date,       // ... As well as the next launch and landing dates currently scheduled
        nextLanding: Date
    },
    flight_data: {              // Flight data contains information about the current flight/s coming from Earth
        en_route: boolean
        colonists: number
    }
    difficulty: string,         // Easy, medium or hard - values will be inserted into switch cases throughout the game
    map_type: string,           // From the game's initial settings
    terrain: number[][],        // The 'map' consists of terrain plus structures plus sprites
    random_events: boolean,     // From the game's initial settings
    modules: ModuleSaveInfo[],
    connectors: ConnectorSaveInfo[],
    resources: Resource[],
    miningLocations: MiningLocations,   // For the industry class
    miningLocationsInUse: MiningLocations,
    colonists: ColonistSaveData[]
}

export default class SaveGame extends Screen {
    // Types for the save game screen:
    switchScreen: (switchTo: string) => void;
    sendSaveGame: (saveInfo: SaveInfo, setter: (status: boolean) => void) => void;
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
    _message: string            // Used to display error / success messages when the player hits the confirm button
    _messageColor: string       // The color code for the message will depend upon the manner of the server's return
    _saveWasSuccessful: boolean // If a successful save has occurred, set this to true to disable the button to prevent spamming

    constructor(p5: P5, switchScreen: (switchTo: string) => void) {
        super(p5);
        this.switchScreen = switchScreen;
        this.sendSaveGame = sendSaveGame;
        this._buttons = [];
        this._gameNameInput = null;             // This starts as null when the game is first created and is created during setup
        this._color = constants.APP_BACKGROUND;
        // Standardize button dimensions and positioning:
        this._buttonWidth = 384;
        this._buttonHeight = 112;
        this._buttonX = constants.SCREEN_WIDTH / 2 - this._buttonWidth / 2;
        this._buttonY = 420;
        this._buttonText = constants.GREEN_TERMINAL;
        this._buttonBG = constants.GREEN_DARK;
        this._justOpened = false;           // Setup function sets this to true, which will block the very first click response
        this._saveInfo = null;              // When the constructor is first deployed there is not yet any info to save
        this._message = "";                 // Default is no message
        this._messageColor = constants.GREEN_TERMINAL;      // Default is optimistic
        this._saveWasSuccessful = false     // Set to true to disable save button after successful save
    }

    // Setup makes the buttons and the input elements:
    setup = (saveInfo: SaveInfo) => {
        this.currentScreen = true;
        this._saveInfo = saveInfo;
        this._gameNameInput = this._p5.createInput(`${saveInfo.username}'s game`); // Input field is created at setup time
        this._gameNameInput.parent("app");
        this._gameNameInput.addClass("save-game-name");
        const saveGame = new Button("Save Game", this._buttonX, this._buttonY, this.handleSave, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        const returnToGame = new Button("Return to Main Menu", this._buttonX, this._buttonY + this._buttonHeight + 16, this.handleReturnToMainMenu, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        this._buttons = [saveGame, returnToGame];
        this._justOpened = true;            // Set to true to block first click responder from firing
        this._saveWasSuccessful = false;    // Reset to allow new saves to occur each time the screen is opened
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
        if (!this._saveWasSuccessful) {     // Only allow save to proceed if there hasn't already been a successful save
            const game_name = this._gameNameInput?.value() as string;
            if (this._saveInfo != null && game_name.length > 2) {
                console.log("Saving game - please wait");
                let finalData = this._saveInfo;
                finalData.game_name = game_name;
                this.sendSaveGame(finalData, this.setHttpStatus);
                this.setMessage("", constants.GREEN_TERMINAL);
            } else if (this._saveInfo != null) {
                this.setMessage("Please enter at least 3 characters for the game name.", constants.RED_ERROR);
            } else {
                this.setMessage("Exception: No save occurred because save data was missing", constants.RED_ERROR);
            }
        }
    }

    handleReturnToMainMenu = () => {
        this.handleClose();
        this.switchScreen("inGameMenu");
    }

    handleClose = () => {
        this.currentScreen = false;
        this.setMessage("", constants.GREEN_TERMINAL);
        this._p5.clear();
        this._gameNameInput?.remove();
    }

    // Color string is red for negative or green for positive
    setMessage = (message: string, color: string) => {
        this._message = message;
        this._messageColor = color;
    }

    setHttpStatus = (status: boolean) => {
        if (status) {
            this.setMessage("Game saved successfully", constants.GREEN_TERMINAL);
            this._saveWasSuccessful = true;
        } else {
            this.setMessage("Sorry, there was an error sending to the server. Please try again.", constants.RED_ERROR);
            this._saveWasSuccessful = false;
        }
    }

    render = () => {
        const p5 = this._p5;
        p5.background(this._color);
        p5.textSize(42);
        p5.fill(constants.EGGSHELL);
        p5.textStyle(p5.BOLD);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.text("Enter name for new save file", constants.SCREEN_WIDTH / 2, 96);
        p5.text("(3 characters minimum):", constants.SCREEN_WIDTH / 2, 144);
        p5.fill(this._messageColor);
        p5.textSize(30);
        p5.text(this._message, constants.SCREEN_WIDTH / 2, 320);
        this._buttons.forEach((button) => {
            button.render(p5);
        })
    }
}

