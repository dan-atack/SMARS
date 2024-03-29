// The top-level screen for the actual game interface
import P5 from "p5";
import Screen from "./screen";
import View from "./view";
import AudioController from "./audioController";
// In-game views:
import Engine from "./engine";
import PopulationView from "./populationView";
import TechTree from "./science";
import Earth from "./earth";
import IndustryView from "./industryView";
import Logbook from "./logbook";
// Other components/data types:
import { ModuleSaveInfo, ConnectorSaveInfo, SaveInfo } from "./saveGame";
import { GameData } from "./newGameSetup";
import { MessageData } from "./notifications";
// Game constants:
import { constants } from "./constants";

export default class Game extends Screen {
    // Types for the Game class: The sub-screens it alternates between
    _engine: Engine;
    _population: PopulationView;
    _techTree: TechTree;
    _earth: Earth;
    _industry: IndustryView;
    // _logbook: Logbook;               // This was a place-filler that there might not be space for now...
    _views: View[];
    _gameData: GameData;                // Simple data for a new game
    _loadGameData: SaveInfo | null;     // More elaborate data object for loading a saved game
    _gameLoaded: boolean;               // Flag for whether to import info from the game setup/load game screen.
    _username: string;
    _mouseDown: boolean;                // Flag for whether the mouse button is currently being clicked (held down)

    switchScreen: (switchTo: string) => void;

    constructor(p5: P5, audio: AudioController, switchScreen: (switchTo: string) => void) {
        super(p5, audio);
        // Pass view and screen changer functions to the engine (For the sidebar to use)
        this.switchScreen = switchScreen;
        this._engine = new Engine(p5, audio, this.switchScreen, this.changeView, this.updateEarthData);
        this._population = new PopulationView(audio, this.changeView);
        this._techTree = new TechTree(audio, this.changeView);
        this._earth = new Earth(audio, this.changeView) // There IS no planet B!!!
        this._industry = new IndustryView(audio, this.changeView);
        // this._logbook = new Logbook(p5, this.changeView);        // On hold pending investigation into why we need it.
        this._views = [this._engine, this._population, this._techTree, this._earth, this._industry];
        this._gameData = {          // Default values will be overridden
            difficulty: "",
            mapType: "",
            randomEvents: true,
            mapTerrain: [],
            startingResources: [
                ["money", 100],
            ]
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
        this._engine.setup();   // Show the engine (world) view first (includes in-game sidebar)
        if (!this._gameLoaded && this._loadGameData) {      // Loading a SAVED game
            this._engine.setupSavedGame(this._loadGameData);
            this._earth.loadSavedDate(this._loadGameData.earth_dates);
            this._earth.loadSavedFlightData(this._loadGameData.flight_data);
            this._gameLoaded = true;
        } else if (!this._gameLoaded) {                     // Loading a NEW game
            this._engine.setupNewGame(this._gameData);
            this._gameLoaded = true;
        }
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
                this._industry.setup(this._engine._infrastructure, this._engine._industry, this._engine._population);
                break;
            case "population":
                this._population.setup(this._engine._population);
                break;
            case "tech":
                this._techTree.setup();
                break;
        }
    }

    updateEarthData = () => {
        const colonists = this._engine._population.determineColonistsForNextLaunch();
        // Update the Earth calendar for every hour that passes on SMARS (in game time) and check if a landing or a launch has taken place
        const ev = this._earth.handleWeeklyUpdates(colonists);
        // If a launch or landing has taken place, display an in-game notification
        if (ev && ev.launch) {
            const message: MessageData = {
                subject: "earth-launch",
                smarsTime: this._engine._gameTime,
                entityID: 0,
                text: `A ship, with ${ev.colonists} new colonists onboard has just been launched from Earth!`
            };
            this._engine._notifications.addMessageToBacklog(message);
        } else if (ev && ev.landing) {
            this._engine.startNewColonistsLanding(ev.colonists);
            const message: MessageData = {
                subject: "earth-landing",
                smarsTime: this._engine._gameTime,
                entityID: 0,
                text: `A landing pod with ${ev.colonists} new colonists has arrived from Earth!`
            };
            this._engine._notifications.addMessageToBacklog(message);
        }     
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
    prepareSaveData = () => {
        const moduleData: ModuleSaveInfo[] = [];
        // TODO: Update to use newer connector data
        const connectorData: ConnectorSaveInfo[] = [];
        this._engine._infrastructure._modules.forEach((mod) => {
            const stats = {
                id: mod._id,
                name: mod._moduleInfo.name,
                type: mod._moduleInfo.type,
                x: mod._x,
                y: mod._y,
                resources: mod._resources,
                crewPresent: mod._crewPresent,
                isMaintained: mod._isMaintained
            }
            moduleData.push(stats);
        });
        this._engine._infrastructure._connectors.forEach((con) => {
            const stats = {
                id: con._id,
                name: con._connectorInfo.name,
                type: con._connectorInfo.type,
                segments: con._segments,
            }
            connectorData.push(stats);
        })
        const saveData: SaveInfo = {
            game_name: `${this._username}'s Game`,  // Supply a default value until the user can input their own
            username: this._username,
            time: new Date (),
            game_time: this._engine._gameTime,
            earth_dates: {
                date: this._earth._earthDate,
                remainder: this._earth._dateRemainder,
                nextLaunch: this._earth._nextLaunchDate,
                nextLanding: this._earth._nextLandingDate
            },
            flight_data: {
                colonists: this._earth._colonistsEnRoute,
                en_route: this._earth._flightEnRoute
            },
            difficulty: this._loadGameData?.difficulty || this._gameData.difficulty,
            map_type: this._loadGameData?.map_type || this._gameData.mapType,
            random_events: this._loadGameData?.random_events !== undefined ? this._loadGameData.random_events : this._gameData.randomEvents,
            terrain: this._engine._map._mapData,
            modules: moduleData,
            connectors: connectorData,
            resources: this._engine._economy._data._resources,
            miningLocations: this._engine._industry._miningLocations,
            miningLocationsInUse: this._engine._industry._miningCoordinatesInUse,
            colonists: this._engine._population.prepareColonistSaveData(),
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

    // Handles key press events, whose key codes are sent down by the application layer
    handleKeyPress = (keyCode: number) => {
        if (this._engine.currentView) this._engine.handleKeyPress(keyCode);
    }

    // Resets all game parameters; copied from the constructor function
    reset = () => {
        // Pass view and screen changer functions to the engine (For the sidebar to use)
        this._engine = new Engine(this._p5, this._audio, this.switchScreen, this.changeView, this.updateEarthData);
        this._population = new PopulationView(this._audio, this.changeView);
        this._techTree = new TechTree(this._audio, this.changeView);
        this._earth = new Earth(this._audio, this.changeView) // There IS no planet B!!!
        this._industry = new IndustryView(this._audio, this.changeView);
        // this._logbook = new Logbook(p5, this.changeView);        // On hold pending investigation into why we need it.
        this._views = [this._engine, this._population, this._techTree, this._earth, this._industry];
        this._gameData = {          // Default values will be overridden
            difficulty: "",
            mapType: "",
            randomEvents: true,
            mapTerrain: [],
            startingResources: [
                ["money", 100],
            ]
        };
        this._loadGameData = null;  // By default there is no loaded game data
        this._gameLoaded = false;   // Initially no game data is loaded
        this._username = "";
        this._mouseDown = false;
    }

    // Same as the app; check which view is the 'current' one and call its render method:
    render = () => {
        this._audio.handleUpdates();
        if (this._engine._sidebar._menuOpen) {  // Check if main menu is open, and close down this screen if so
            this.currentScreen = false;
            this._engine._sidebar.setMenuOpen(false);       // And reset the flag!?
        }
        if (this._engine.currentView) this._engine.render();
        if (this._earth.currentView) this._earth.render(this._p5);
        if (this._industry.currentView) this._industry.render(this._p5);
        if (this._techTree.currentView) this._techTree.render(this._p5);
        if (this._population.currentView) this._population.render(this._p5);
    }

}