// The top-level screen for the actual game interface
import P5 from "p5";
import Screen from "./screen";
import View from "./view";
// In-game views:
import Engine from "./engine";
import Population from "./population";
import TechTree from "./tech";
import Earth from "./earth";
import Industry from "./industry";
import Logbook from "./logbook";
// Game constants:
import { constants } from "./constants";

// Define object shape for pre-game data from game setup screen:
type GameData = {
    difficulty: string,
    mapType: string,
    randomEvents: boolean,
    mapTerrain: number[][];
}

export default class Game extends Screen {
    // Types for the Game class: The sub-screens it alternates between
    _engine: Engine;
    _population: Population;
    _techTree: TechTree;
    _earth: Earth;
    _industry: Industry;
    // _logbook: Logbook;       // This was a place-filler that there might not be space for now...
    _views: View[];
    _gameData: GameData;
    _gameLoaded: boolean;       // Flag for whether to import info from the game setup screen.
    _username: string;

    switchScreen: (switchTo: string) => void;

    constructor(p5: P5, switchScreen: (switchTo: string) => void) {
        super(p5);
        this.switchScreen = switchScreen;
        // Pass view and screen changer functions to the engine (For the sidebar to use)
        this._engine = new Engine(p5, this.switchScreen, this.changeView);
        this._population = new Population(p5, this.changeView);
        this._techTree = new TechTree(p5, this.changeView);
        this._earth = new Earth(p5, this.changeView) // There IS no planet B!!!
        this._industry = new Industry(p5, this.changeView);
        // this._logbook = new Logbook(p5, this.changeView);        // On hold pending investigation into why we need it.
        this._views = [this._engine, this._population, this._techTree, this._earth, this._industry];
        this._gameData = {
            difficulty: "",
            mapType: "",
            randomEvents: true,
            mapTerrain: [],
        }
        this._gameLoaded = false;
        this._username = "";
    }

    setup = () => {
        const p5 = this._p5;
        this.currentScreen = true;
        p5.background(constants.APP_BACKGROUND);
        p5.fill(constants.GREEN_TERMINAL);
        p5.strokeWeight(4);
        p5.textSize(48);
        p5.stroke(constants.ALMOST_BLACK);
        p5.textAlign(p5.CENTER, p5.CENTER);
        this._engine.setup(this._gameData);   // Show the engine (world) view first (includes in-game sidebar)
    }

    changeView = (newView: string) => {
        // Reset current view by de-activating all views before setting up the new one:
        this._views.forEach((view) => {
            view.currentView = false;
        })
        switch (newView) {
            case "earth":
                this._earth.setup();
                break;
            case "engine":  // Show the game's main world first (represented by the engine, which manages it [i.e. the game's world])
                this._engine.setup(this._gameData);   // TODO: Engine's setup routine needs to take game data as argument IF it doesn't already have it
                break;
            case "industry":
                this._industry.setup();
                break;
            // case "logbook":              // Due to limited real-estate on the sidebar, logs are on hold for the moment.
            //     this._logbook.setup();
            //     break;
            case "population":
                this._population.setup();
                break;
            case "tech":
                this._techTree.setup();
                break;
        }
    }

    // Pass data from the pre-game setup screen and username from the App itself, to the game with this method:
    setGameData = (data: GameData, username: string) => {
        console.log("setting new game data");
        this._gameData = data;
        this._username = username;
        this._gameLoaded = true;
    }

    // Determine which 'view' is active and call its click handler:
    handleClicks = (mouseX: number, mouseY: number) => {
        if (this._engine.currentView) this._engine.handleClicks(mouseX, mouseY);
        if (this._earth.currentView) this._earth.handleClicks(mouseX, mouseY);
        if (this._industry.currentView) this._industry.handleClicks(mouseX, mouseY);
        if (this._techTree.currentView) this._techTree.handleClicks(mouseX, mouseY);
        if (this._population.currentView) this._population.handleClicks(mouseX, mouseY);
    }

    // Same as the app; check which view is the 'current' one and call its render method:
    render = () => {
        if (this._engine._sidebar._menuOpen) {  // Check if main menu is open, and close down this screen if so
            this.currentScreen = false;
            this._engine._sidebar.setMenuOpen(false);
        }
        if (this._engine.currentView) this._engine.render();
        if (this._earth.currentView) this._earth.render();
        if (this._industry.currentView) this._industry.render();
        if (this._techTree.currentView) this._techTree.render();
        if (this._population.currentView) this._population.render();
    }

}