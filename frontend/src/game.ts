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
import { SaveInfo } from "./saveGame";
import { GameData } from "./newGameSetup";


export default class Game extends Screen {
    // Types for the Game class: The sub-screens it alternates between
    _engine: Engine;
    _population: Population;
    _techTree: TechTree;
    _earth: Earth;
    _industry: Industry;
    // _logbook: Logbook;               // This was a place-filler that there might not be space for now...
    _views: View[];
    _gameData: GameData;                // Simple data for a new game
    _loadGameData: SaveInfo | null;     // More elaborate data object for loading a saved game
    _gameLoaded: boolean;               // Flag for whether to import info from the game setup/load game screen.
    _username: string;
    _mouseDown: boolean;                // Flag for whether the mouse button is currently being clicked (held down)

    switchScreen: (switchTo: string) => void;

    constructor(p5: P5, switchScreen: (switchTo: string) => void) {
        super(p5);
        this.switchScreen = switchScreen;
        // Pass view and screen changer functions to the engine (For the sidebar to use)
        this._engine = new Engine(p5, this.switchScreen, this.changeView, this.updateEarthData);
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
            startingResources: {
                money: ["$", 0],
                oxygen: ["Air", 0],
                water: ["H20", 0],
                food: ["Food", 0],
            }
        };
        this._loadGameData = null;  // By default there is no loaded game data
        this._gameLoaded = false;   // Initially no game data is loaded
        this._username = "";
        this._mouseDown = false;
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
        if (!this._gameLoaded && this._loadGameData) {      // Loading a SAVED game
            this._engine.setupSavedGame(this._loadGameData);
            this._gameLoaded = true;
        } else if (!this._gameLoaded) {                     // Loading a NEW game
            this._engine.setupNewGame(this._gameData);
            this._gameLoaded = true;
        }
        this._engine.setup();   // Show the engine (world) view first (includes in-game sidebar)
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
            case "engine":
                this._engine.setup();
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

    updateEarthData = () => {
        this._earth.setEarthDate(constants.EARTH_DAYS_PER_HOUR); // Add seven days to Earth calendar for every hour that passes on SMARS
    }

    // Pass data from the pre-game setup screen and username from the App itself, to the game with this method:
    setNewGameData = (data: GameData, username: string) => {
        this._gameData = data;
        this._username = username;
    }

    setLoadedGameData = (data: SaveInfo, username: string) => {
        this._loadGameData = data;
        this._username = username;
    }

    // Prepares a SaveInfo object to be passed to the game's backend via the Save Game screen:
    getGameData = () => {
        const moduleData: {name: string, type: string, x: number, y: number}[] = [];
        const connectorData: {name: string, type: string, x: number, y: number}[] = [];
        this._engine._infrastructure._modules.forEach((mod) => {
            const stats = {
                name: mod._moduleInfo.name,
                type: mod._moduleInfo.type,
                x: mod._x,
                y: mod._y
            }
            moduleData.push(stats);
        });
        this._engine._infrastructure._connectors.forEach((con) => {
            const stats = {
                name: con._connectorInfo.name,
                type: con._connectorInfo.type,
                x: con._x,
                y: con._y
            }
            connectorData.push(stats);
        })
        const saveData: SaveInfo = {
            game_name: `${this._username}'s Game`,  // Supply a default value until the user can input their own
            username: this._username,
            time: new Date (),
            game_time: this._engine._gameTime,
            difficulty: this._gameData.difficulty,
            map_type: this._gameData.mapType,
            random_events: this._gameData.randomEvents,
            terrain: this._engine._map._mapData,
            modules: moduleData,
            connectors: connectorData,
            resources: this._engine._economy._resources,
        }
        return saveData;
    }

    // Determine which 'view' is active and call its click handler:
    handleClicks = (mouseX: number, mouseY: number) => {
        if (this._engine.currentView) {
            if (this._mouseDown) {
                this._mouseDown = false;
            }
            this._engine.handleClicks(mouseX, mouseY);
        }
        if (this._earth.currentView) this._earth.handleClicks(mouseX, mouseY);
        if (this._industry.currentView) this._industry.handleClicks(mouseX, mouseY);
        if (this._techTree.currentView) this._techTree.handleClicks(mouseX, mouseY);
        if (this._population.currentView) this._population.handleClicks(mouseX, mouseY);
    }

    // This fires once the instant a mouse button is depressed; the click event handler comes when the mouse is 'up' again.
    // Hence it is a useful way of initiating events that last so long as the mouse is down (with the regular click handler
    // signaling the end of the event)
    handleMouseDowns = (mouseX: number, mouseY: number) => {
        if (this._p5.mouseIsPressed) {
            this._mouseDown = true;
            this._engine.handleMouseDown(mouseX, mouseY);
        }
    }

    // Same as the app; check which view is the 'current' one and call its render method:
    render = () => {
        if (this._engine._sidebar._menuOpen) {  // Check if main menu is open, and close down this screen if so
            this.currentScreen = false;
            this._engine._sidebar.setMenuOpen(false);       // And reset the flag!?
        }
        if (this._engine.currentView) this._engine.render();
        if (this._earth.currentView) this._earth.render();
        if (this._industry.currentView) this._industry.render();
        if (this._techTree.currentView) this._techTree.render();
        if (this._population.currentView) this._population.render();
    }

}