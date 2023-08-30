// The Load game screen is available from the pre-game menu, and allows the player to resume a previous play session
import P5 from "p5";
import AudioController from "./audioController";
import Screen from "./screen";
import Button from "./button";
import LoadOption from "./loadOption";
import { constants } from "./constants";
import { SaveInfo, GameTime } from "./saveGame";
import { getSavedGames, loadGameData } from "./server_functions";

// Data structure for the initial fetch, to get a summary of the user's games
export type SaveSummary = {
    id: string,
    game_name: string,
    game_time: GameTime,
    timestamp: string,
    population: number,
}

export default class LoadGame extends Screen {
    // Types for the Load Game Screen:
    // Function imports
    switchScreen: (switchTo: string) => void;
    getSavedGames: (username: string, setter: (saves: SaveSummary[]) => void) => void;
    loadGameData: (id: string, setter: (saveInfo: SaveInfo) => void) => void;
    // Fixed values
    _color: string;
    _loadOptionWidth: number;
    _loadOptionHeight: number;
    _loadOptionX: number;
    _loadOptionY: number;
    _selectOptionX: number;
    _buttonWidth: number;
    _buttonHeight: number;
    _buttonX: number;
    _buttonY: number;
    _buttonText: string;
    _buttonBG: string;
    _messageColor: string;          // The color code for the message will depend upon the manner of the server's return
    _optionsPerPage: number;        // Pagination - How many index positions to show per 'page'
    // Variable values
    _optionsShowing: number;        // Pagination - Index position for the FIRST load option to be shown
    _username: string;
    _justOpened: boolean;           // Experimental prototype method for preventing 'double click' phenomenon on when screen loads
    _savedGames: SaveSummary[];     // List of saved game summary items from the primary server fetch
    _selectedGame: SaveSummary | null;     // Prepare to store the game summary when a load option is selected
    _saveInfo: SaveInfo | null;     // Prepare to store the game info when it comes in from the server
    _message: string;               // Used to display error / success messages when the player hits the confirm button
    _buttons: Button[];
    _loadOptions: LoadOption[];
    _loadWasSuccessful: boolean;  // If a successful save has occurred, set this to true to disable the button to prevent spamming

    constructor(p5: P5, audio: AudioController, switchScreen: (switchTo: string) => void) {
        super(p5, audio);
        this.switchScreen = switchScreen;
        this.getSavedGames = getSavedGames;
        this.loadGameData = loadGameData;
        this._buttons = [];
        this._loadOptions = [];
        this._optionsShowing = 0;           // Start from the beginning of the saved games index
        this._optionsPerPage = 4;           // Show up to 4 saved game files at a time
        this._username = "";                // Value for username is not known when the constructor is deployed
        this._color = constants.APP_BACKGROUND;
        // Standardize button and load option (specialized button) dimensions and positioning:
        this._buttonWidth = 384;
        this._buttonHeight = 112;
        this._buttonX = constants.SCREEN_WIDTH / 2 - this._buttonWidth / 2;
        this._buttonY = 456;
        this._buttonText = constants.GREEN_TERMINAL;
        this._buttonBG = constants.GREEN_DARK;
        this._loadOptionWidth = 480;
        this._loadOptionHeight = 72;
        this._loadOptionX = constants.SCREEN_WIDTH / 2 - this._loadOptionWidth / 2;
        this._loadOptionY = 120;
        this._selectOptionX = 208;
        this._justOpened = false;           // Setup function sets this to true, which will block the very first click response
        this._savedGames = [];              // Initially there are no saved games to display
        this._selectedGame = null;          // Initially there is no game selected
        this._saveInfo = null;              // When the constructor is first deployed there is not yet any info to load
        this._message = "";                 // Default is no message
        this._messageColor = constants.GREEN_TERMINAL;      // Default is optimistic
        this._loadWasSuccessful = false     // Set to true to disable save button after successful save
    }

    // Setup makes the buttons and resets any default values:
    setup = () => {
        this.currentScreen = true;
        this._saveInfo = null;
        this._justOpened = true;            // Set to true to block first click responder from firing
        this._loadWasSuccessful = false;    // Reset to allow new saves to occur each time the screen is opened
        const loadGame = new Button("Load Game", this._buttonX, this._buttonY, this.handleLoad, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        const returnToMenu = new Button("Return to Main Menu", this._buttonX, this._buttonY + this._buttonHeight + 16, this.handleReturnToMenu, this._buttonWidth, this._buttonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        const next = new Button("NEXT", this._buttonX / 2 + 24, this._buttonY / 2 + 96, this.handleNext, this._buttonWidth / 4, this._buttonHeight / 2, constants.GREEN_TERMINAL, constants.GREEN_DARK, 18);
        const prev = new Button("PREV", this._buttonX / 2 - 112, this._buttonY / 2 + 96, this.handlePrev, this._buttonWidth / 4, this._buttonHeight / 2, constants.GREEN_TERMINAL, constants.GREEN_DARK, 18);
        this._buttons = [loadGame, returnToMenu, next, prev];
        // Get list of saved game files for the current user
        this.getSavedGames(this._username, this.setsavedGames);
    }

    setUsername = (username: string) => {
        this._username = username;
    }

    // Stores the save summary data from the server, and creates buttons from it
    setsavedGames = (saves: SaveSummary[]) => {
        if (saves.length > 0) {
            this._savedGames = saves;
            // Invert order of saved games list to place most recent saves at the top:
            const flip: SaveSummary[] = [];
            for (let i = this._savedGames.length - 1; i >= 0; i--) {
                if (this._savedGames[i] != undefined) {
                    flip.push(this._savedGames[i]);
                } 
            }
            this._savedGames = flip;
            this.populateLoadOptions();
        } else {
            this.setMessage(`No save files found for ${this._username}`, constants.RED_ERROR);
        } 
    }

    // Passed to the load option button to set the basic info for the selected file when clicked
    setSaveSelection = (saveSummary: SaveSummary) => {
        const name = saveSummary.game_name.length < 19 ? saveSummary.game_name : saveSummary.game_name.slice(0, 16) + "...";
        this.setMessage(`Selected: ${name}`, constants.GREEN_TERMINAL);
        this._selectedGame = saveSummary;
    }

    // Passed to the loadGameData server function, to set the Save Info field when the Load Game button is clicked
    setSaveInfo = (saveInfo: SaveInfo) => {
        this._saveInfo = saveInfo;
        // Once the save info is loaded we can close up the page and head over to the Game screen
        this.handleStartGame();
    }

    // Color string is red for negative or green for positive
    setMessage = (message: string, color: string) => {
        this._message = message;
        this._messageColor = color;
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        // Reset the info/error message, unless a game has been selected:
        if (!this._selectedGame) {
            this.setMessage("", constants.GREEN_TERMINAL);
        } else {
            const name = this._selectedGame.game_name.length < 19 ? this._selectedGame.game_name : this._selectedGame.game_name.slice(0, 16) + "...";
            this.setMessage(`Selected: ${name}`, constants.GREEN_TERMINAL)
        }
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        });
        this._loadOptions.forEach((option) => {
            option.setSelected(false);
            option.handleClick(mouseX, mouseY);
        })
        // Ensure that if a save has been selected that it is highlighted
        if (this._selectedGame) {
            const save = this._loadOptions.find((game) => game._saveInfo.game_name === this._selectedGame?.game_name);
            if (save) save.setSelected(true);
        }
    }

    handleLoad = () => {
        if (this._selectedGame != null) {
            this.setMessage("Loading game. Please wait.", constants.GREEN_TERMINAL);
            this.loadGameData(this._selectedGame.id, this.setSaveInfo);
        } else {
            this.setMessage("Please select a game to load", constants.RED_ERROR);
        }
    }

    handleReturnToMenu = () => {
        this.handleClose();
        this.switchScreen("menu");
    }

    // This gets called by the Load Game button's handler once the full game data object is retrieved from the server
    handleStartGame = () => {
        if (this._saveInfo != null) {
            this._loadWasSuccessful = true;
            this.switchScreen("game");
            this.handleClose();
        }
    }

    // Pagination button handlers
    handleNext = () => {
        if (this._savedGames.length > this._optionsShowing + this._optionsPerPage) {
            this._optionsShowing += this._optionsPerPage;
        } else {
            this.setMessage("You are at the end of the list.", constants.RED_ERROR);
        }
        this.populateLoadOptions();
    }

    handlePrev = () => {
        if (this._optionsShowing > 0) {
            this._optionsShowing -= this._optionsPerPage;
            if (this._optionsShowing < 0) this._optionsShowing = 0; // Don't go past zero
        } else {
            this.setMessage("You are at the start of the list", constants.RED_ERROR);
        }
        this.populateLoadOptions();
    }

    populateLoadOptions = () => {
        this._loadOptions = []; // Reset the list each time it is populated
        this._savedGames.forEach((save, idx) => {
            // Restrict options to the range specified by the pagination limits:
            if (idx >= this._optionsShowing && idx < this._optionsShowing + this._optionsPerPage) {
                let o = new LoadOption(this._p5, save, this._loadOptionX, this._loadOptionY + (idx - this._optionsShowing) * (this._loadOptionHeight + 8), this._loadOptionWidth, this._loadOptionHeight, this.setSaveSelection);
            this._loadOptions.push(o);
            }
 
        })
    }

    // Resets save data when the player quits to the main menu
    resetSaveInfo = () => {
        this._savedGames = [];
        this._saveInfo = null;
        this._selectedGame = null;
    }

    render = () => {
        this._audio.handleUpdates();
        const p5 = this._p5;
        p5.background(this._color);
        p5.textSize(48);
        p5.fill(constants.EGGSHELL);
        p5.textStyle(p5.BOLD);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.text(`Welcome back, ${this._username}`, constants.SCREEN_WIDTH / 2, 40);
        p5.textSize(36);
        p5.text("Select", this._selectOptionX, 120);
        p5.text("Saved Game:", this._selectOptionX, 160);
        p5.textSize(24);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text(`Showing ${this._optionsShowing + 1} - ${Math.min(this._optionsShowing + this._optionsPerPage, this._savedGames.length)}`, this._selectOptionX, 240);
        p5.text(`of ${this._savedGames.length} saved games`, this._selectOptionX, 272);
        // Render error/info message:
        p5.textSize(20);    
        p5.fill(this._messageColor);
        p5.text(this._message, this._selectOptionX, 400);
        this._loadOptions.forEach((option) => {
            option.render(p5);
        })
        this._buttons.forEach((button) => {
            button.render(p5);
        })
    }

    handleClose = () => {
        this.currentScreen = false;
        this.setMessage("", constants.GREEN_TERMINAL);
        this.resetSaveInfo();
        this._optionsShowing = 0;       // Reset pagination
        this._justOpened = false;       // Reset click resistor
        this._loadWasSuccessful = false // Reset load success indicator
        this._buttons = [];             // Cleanup interface buttons
        this._loadOptions = [];         // Cleanup load option buttons
        this._p5.clear();
    }

}
