// The Pre-game settings page
import P5 from "p5";
import Screen from "./screen";
import Button from "./button";
import Minimap from "./minimap";
import { constants } from "./constants";
import { getMap } from "./server_functions";

export default class NewGameSetup extends Screen {
    // Pre-game setup types:
    switchScreen: (switchTo: string) => void;
    _buttons: Array<Button>;
    _difficulty: string;    // Current options include 'easy', 'normal', and 'hard'
    _mapType: string;       // Current options include 'polar', 'highlands' and 'riverbed'
    _randomEvents: boolean; // Default is true!
    _difficultyPositionY: number;   // Standard values for easier aesthetic adjustments!
    _difficultyPositionX: number;
    _difficultyWidth: number;
    _difficultyHeight: number;
    _mapTypePositionY: number;
    _mapTypePositionX: number;
    _mapTypeWidth: number;
    _mapTypeHeight: number;
    _randomPositionY: number;
    _randomPositionX: number;
    _randomWidth: number;
    _randomHeight: number;
    _mapTerrain: number[][];
    minimap: Minimap;
    gameData: {
        difficulty: string,
        mapType: string,
        randomEvents: boolean,
        mapTerrain: number[][];
    }

    constructor(p5: P5, switchScreen: (switchTo: string) => void) {
        super(p5);
        this.switchScreen = switchScreen;
        this._buttons = [];
        this._difficulty = "medium" // Default settings are already in place
        this._mapType = "polar"     // Default settings are already in place - meaning we'll need to run the fetch map function immediately
        this._randomEvents = true;  // Do you feel lucky?
        // Innate properties used for standardizing positions:
        this._difficultyPositionX = 426; // Position of the easy button; to allow reference for the other two.
        this._difficultyPositionY = 96;
        this._difficultyWidth = 96;
        this._difficultyHeight = 92;
        this._mapTypePositionY = 256;
        this._mapTypePositionX = 192;
        this._mapTypeWidth = 192;
        this._mapTypeHeight = 64;
        this._randomPositionY = 512;
        this._randomPositionX = 420;
        this._randomWidth = 192;
        this._randomHeight = 64;
        this._mapTerrain = [];       // Fills in with return from a fetch in the setup method
        this.minimap = new Minimap(p5, 688, 420, this._mapTerrain);
        this.gameData = {   // To export to the Game once data has been selected
            difficulty: "",
            mapType: "",
            randomEvents: true,
            mapTerrain: []
        }
    }

    setup = () => {
        const p5 = this._p5;
        this.currentScreen = true;
        // Create buttons:
        const easy = new Button(
            p5,
            "easy",
            this._difficultyPositionX,
            this._difficultyPositionY,
            this.handleEasy,
            this._difficultyWidth,
            this._difficultyHeight,
            constants.GREEN_TERMINAL,
            constants.GREEN_DARK
        );
        const medium = new Button(
            p5,
            "medium",
            this._difficultyPositionX + this._difficultyWidth, 
            this._difficultyPositionY,
            this.handleMedium,
            this._difficultyWidth,
            this._difficultyHeight,
            constants.GREEN_TERMINAL,
            constants.GREEN_DARK,
            22  // Font size override
        );
        const hard = new Button(p5,
            "hard",
            this._difficultyPositionX + 2 * this._difficultyWidth,
            this._difficultyPositionY,
            this.handleHard,
            this._difficultyWidth,
            this._difficultyHeight,
            constants.GREEN_TERMINAL,
            constants.GREEN_DARK
        );
        const polar = new Button(
            p5,
            "polar",
            this._mapTypePositionX,
            this._mapTypePositionY,
            this.handlePolar,
            this._mapTypeWidth,
            this._mapTypeHeight,
            constants.GREEN_TERMINAL,
            constants.GREEN_DARK,
            28
        );
        const highlands = new Button(
            p5,
            "highlands",
            this._mapTypePositionX,
            this._mapTypePositionY + this._mapTypeHeight,
            this.handleHighlands,
            this._mapTypeWidth,
            this._mapTypeHeight,
            constants.GREEN_TERMINAL,
            constants.GREEN_DARK,
            28
        );
        const riverbed = new Button(
            p5,
            "riverbed",
            this._mapTypePositionX,
            this._mapTypePositionY + 2 * this._mapTypeHeight,
            this.handleRiverbed,
            this._mapTypeWidth,
            this._mapTypeHeight,
            constants.GREEN_TERMINAL,
            constants.GREEN_DARK,
            28
        );
        const yesRandom = new Button(
            p5,
            "yes",
            this._randomPositionX,
            this._randomPositionY,
            this.handleYesRandom,
            this._randomWidth,
            this._randomHeight,
            constants.GREEN_TERMINAL,
            constants.GREEN_DARK
        );
        const noRandom = new Button(
            p5,
            "no",
            this._randomPositionX + this._randomWidth,
            this._randomPositionY,
            this.handleNoRandom,
            this._randomWidth,
            this._randomHeight,
            constants.GREEN_TERMINAL,
            constants.GREEN_DARK
        );
        const startGame = new Button(
            p5,
            "start game",
            192,
            600,
            this.handleStartGame,
            256,
            96,
            constants.GREEN_TERMINAL,
            constants.GREEN_DARK
        );
        const backToMenu = new Button(p5,
            "back to menu",
            512,
            600,
            this.handleReturnToMenu,
            256,
            96,
            constants.RED_CONTRAST,
            constants.RED_BG
        )
        this._buttons = [easy, medium, hard, polar, highlands, riverbed, yesRandom, noRandom, startGame, backToMenu];
        // Activate buttons to match default values:
        this._buttons[1].setSelected(true); // Medium activated by default
        this._buttons[3].setSelected(true); // Polar landing site selected by default
        this._buttons[6].setSelected(true); // Random events enabled by default
        // Load initial map:
        getMap(this._mapType, this.setTerrain)
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        })
    }

    // Difficulty Settings handlers
    handleEasy = () => {
        this._difficulty = "easy";
        // Set selection status for all difficulty buttons:
        this._buttons[0].setSelected(true);
        this._buttons[1].setSelected(false);
        this._buttons[2].setSelected(false);
    }

    handleMedium = () => {
        this._difficulty = "medium";
        this._buttons[0].setSelected(false);
        this._buttons[1].setSelected(true);
        this._buttons[2].setSelected(false);
    }

    handleHard = () => {
        this._difficulty = "hard";
        this._buttons[0].setSelected(false);
        this._buttons[1].setSelected(false);
        this._buttons[2].setSelected(true);
    }

    // Map Type Selection handlers
    handlePolar = () => {
        this._mapType = "polar";
        this._buttons[3].setSelected(true);
        this._buttons[4].setSelected(false);
        this._buttons[5].setSelected(false);
        getMap(this._mapType, this.setTerrain);
    }

    handleHighlands = () => {
        this._mapType = "highlands";
        this._buttons[3].setSelected(false);
        this._buttons[4].setSelected(true);
        this._buttons[5].setSelected(false);
        getMap(this._mapType, this.setTerrain);
    }

    handleRiverbed = () => {
        this._mapType = "riverbed";
        this._buttons[3].setSelected(false);
        this._buttons[4].setSelected(false);
        this._buttons[5].setSelected(true);
        getMap(this._mapType, this.setTerrain);
    }

    // Random Event handlers
    handleYesRandom = () => {
        this._randomEvents = true;
        this._buttons[6].setSelected(true);
        this._buttons[7].setSelected(false);
    }

    handleNoRandom = () => {
        this._randomEvents = false;
        this._buttons[6].setSelected(false);
        this._buttons[7].setSelected(true);
    }

    handleStartGame = () => {
        this.gameData = {   // Prepare to dispatch the following info to the new game's set
            difficulty: this._difficulty,
            mapType: this._mapType,
            randomEvents: this._randomEvents,
            mapTerrain: this._mapTerrain
        }
        this.switchScreen("game");
        this.cleanup();
    }

    handleReturnToMenu = () => {
        this.cleanup();
        this.switchScreen("menu");
    }

    setTerrain = (terrain: number[][]) => {
        this._mapTerrain = terrain;
        this.minimap.updateTerrain(terrain);
    }

    // Set up the description bullet points separately so as to not totally clutter the render method
    renderDescription = () => {
        const p5 = this._p5;
        const startingPoint = 276;
        const alignment = 420;
        const interval = 28;
        const messages = [];
        p5.fill(constants.EGGSHELL);
        p5.textSize(18);
        p5.textAlign(p5.LEFT)
        switch(this._difficulty) {
            case "easy":
                messages.push("- reduced upkeep costs");
                if (this._randomEvents) messages.push("- luckier random events");
                break;
            case "medium":
                messages.push("- regular costs");
                if (this._randomEvents) messages.push("- average luck");
                break;
            case "hard":
                messages.push("- steeper upkeep costs");
                messages.push("- unfair starting situation");
                if (this._randomEvents) messages.push("- unlucky random events")
        }
        switch(this._mapType) {
            case "polar":
                messages.push("- abundant water ice");
                messages.push("- higher power costs");
                break;
            case "highlands":
                messages.push("- buildings leak air faster");
                messages.push("- better power generation");
                break;
            case "riverbed":
                messages.push("- abundant resources");
                messages.push("- minimal air leakage");
                messages.push("- lower radiation levels");
        }
        messages.forEach((msg, idx) => {
            p5.text(msg, alignment, startingPoint + idx * interval);
        })
        // TODO: Parse out the game details based on the difficulty level and map type; print out a list of 4 to 5 bullet points
    }

    render = () => {
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        // Text description backdrops:
        p5.stroke(constants.GREEN_DARK);
        p5.fill(constants.APP_BACKGROUND);
        p5.rect(this._mapTypePositionX + this._mapTypeWidth + 16, this._mapTypePositionY - 40, 256, 256, 8, 8, 8, 8);
        // Text elements render here:
        p5.textSize(48);
        p5.fill(constants.EGGSHELL);
        p5.textStyle(p5.BOLD);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.text("Setup New Game", 480, 24);
        p5.textSize(32);
        p5.text("Select Difficulty Level:", 224, this._difficultyPositionY + this._difficultyHeight / 3);
        p5.text("Select Landing Site:", 24, this._mapTypePositionY + this._mapTypeHeight / 2, 192, 256);
        p5.text("Allow Random Events?", 224, this._randomPositionY + this._randomHeight / 3);
        p5.textSize(24);
        p5.text("Game Details:", this._mapTypePositionX + 336, this._mapTypePositionY - 24);
        // Green (Descriptive) text:
        p5.fill(constants.GREEN_TERMINAL);
        p5.text("Map Preview", 800, 240);
        // Render unselected buttons FIRST, so that the selected ones' glowing borders are always fully visible:
        this._buttons.forEach((button) => {
            if (!button._selected) {
                button.render();
            }
        })
        this._buttons.forEach((button) => {
            if (button._selected) {
                button.render();
            }
        })
        // Minimap
        this.minimap.render();
        // Game details:
        this.renderDescription();
    }

    cleanup = () => {
        this.currentScreen = false;
        this._p5.clear();
    }

}