// Top-level component for the game environment (as opposed to game interface, which is in game.ts)
import P5 from "p5";
import * as dotenv from "dotenv";
import View from "./view";
import Sidebar from "./sidebar";
import Map from "./map";
import Infrastructure from "./infrastructure";
import Modal from "./modal";
import { ModuleInfo, ConnectorInfo } from "./server_functions";
import { constants } from "./constants";

// Define object shape for pre-game data from game setup screen:
type GameData = {
    difficulty: string,
    mapType: string,
    randomEvents: boolean,
    mapTerrain: number[][];
}

// TODO: Load Environment variables
if (process.env.ENVIRONMENT) console.log(process.env.ENVIRONMENT);


export default class Engine extends View {
    // Engine types
    _sidebar: Sidebar;
    _sidebarExtended: boolean;
    _gameData: GameData;
    _map: Map;
    _infrastructure: Infrastructure;
    _modal: Modal | null;
    // Map scrolling control
    _horizontalOffset: number;  // This will be used to offset all elements in the game's world, starting with the map
    _scrollDistance: number;    // Pixels from the edge of the world area in which scrolling occurs
    _scrollingLeft: boolean;    // Flags for whether the user is currently engaged in scrolling one way or the other
    _scrollingRight: boolean;
    // Mouse click control
    mouseContext: string;       // Mouse context tells the Engine's click handler what to do when the mouse is pressed.
    selectedBuilding: ModuleInfo | ConnectorInfo | null;    // Data storage for when the user is about to place a new structure
    selectedBuildingCategory: string    // String name of the selected building category (if any)
    // In-game time control
    gameOn: boolean;            // If the game is on then the time ticker advances; if not it doesn't
    _tick: number;
    ticksPerMinute: number;
    _minute: number;
    _minutesPerHour: number;
    _hour: number;
    _hoursPerClockCycle: number;    // One day = two trips around the clock
    _clockCycle: string;            // AM or PM
    _sol: number;                   // On SMARS, days are called "Sols"
    _solsPerYear: number;
    _smartianYear: number;          // Smartian year (AKA mission year) is the amount of times SMARS has orbited the sun since mission start (Lasts approximately twice as long as a Terrestrial year).
    switchScreen: (switchTo: string) => void;   // App-level SCREEN switcher (passed down via drill from the app)
    updateEarthData: () => void;    // Updater for the date on Earth (for starters)
    // Game data!!!

    constructor(p5: P5, switchScreen: (switchTo: string) => void, changeView: (newView: string) => void, updateEarthData: () => void) {
        super(p5, changeView);
        this.switchScreen = switchScreen;
        this.updateEarthData = updateEarthData;
        this._sidebar = new Sidebar(p5, this.switchScreen, this.changeView, this.setMouseContext, this.setGameSpeed);
        this._sidebarExtended = true;   // Side bar can be partially hidden to expand map view - should this be here or in the SB itself??
        this._gameData = {
            difficulty: "",
            mapType: "",
            randomEvents: true,
            mapTerrain: []
        }   // Game data is loaded from the Game module when it calls the setup method
        this._map = new Map(this._p5);
        this._infrastructure = new Infrastructure(p5);
        this._modal = null;
        this._horizontalOffset = 0;
        this._scrollDistance = 50;
        this._scrollingLeft = false;
        this._scrollingRight = false;
        this.mouseContext = "select"    // Default mouse context is the user wants to select what they click on (if they click on the map)
        this.selectedBuilding = null;   // There is no building info selected by default.
        this.selectedBuildingCategory = "";  // Keep track of whether the selected building is a module or connector
        // Time-keeping:
        // TODO: Make the clock its own component, to de-clutter the Engine.
        this.gameOn = true;             // By default the game is on when the Engine starts
        this._tick = 0;
        this.ticksPerMinute = 30        // Medium "fast" speed is set as the default
        this._minute = 0;
        this._minutesPerHour = 60;      // Minutes go from 0 - 59, so this should really be called max minutes
        this._hour = 12;
        this._hoursPerClockCycle = 12;
        this._clockCycle = "AM";
        this._sol = 1;
        this._solsPerYear = 4;
        this._smartianYear = 0;
    }

    setup = (gameData: GameData) => {
        this.currentView = true;
        this._gameData = gameData;
        this._sidebar.setup();
        this._map.setup(this._gameData.mapTerrain);
        this._horizontalOffset = this._map._maxOffset / 2;   // Put player in the middle of the map to start out
        this._infrastructure.setup(this._horizontalOffset);
        this._sidebar._detailsArea._minimap.updateTerrain(this._gameData.mapTerrain);
        // Sidebar minimap display - does it only need it during 'setup' or does it also need occasional updates?
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        // Since the 'click' event occurs on the mouseup part of the button press, a click always signals the end of any scrolling:
        this._scrollingRight = false;
        this._scrollingLeft = false;
        // Click is in sidebar (not valid if modal is open):
        if (mouseX > constants.SCREEN_WIDTH - this._sidebar._width && !this._modal) {
            this._sidebar.handleClicks(mouseX, mouseY);
        } else {
            // Click is on the map, between the scroll zones
            switch (this.mouseContext) {
                case "select":
                    console.log("Select");
                    break;
                case "place":
                    console.log("Place");
                    const [x, y] = this.getMouseGridPosition(mouseX, mouseY);
                    if (this.selectedBuilding != null) this._infrastructure.addBuilding(x, y, this.selectedBuilding);
                    break;
                case "resource":
                    console.log("Resource");
                    break;
                case "modal":
                    this._modal?.handleClicks(mouseX, mouseY);
                    break;
            }
            this.getMouseGridPosition(mouseX, mouseY);
        }
    }

    // Handler for when the mouse button is being held down (for scrolling))
    handleMouseDown = (mouseX: number, mouseY: number) => {
        if (!this._modal) {     // Do not allow scrolling when modal is opened
            if (!(mouseX > constants.SCREEN_WIDTH - this._sidebar._width)) {    // Do not allow scrolling from the sidebar
                if (mouseX < this._scrollDistance) {
                    this._scrollingLeft = true;
                } else if (mouseX > constants.WORLD_VIEW_WIDTH - this._scrollDistance) {
                    this._scrollingRight = true;
                }
            } 
        } 
    }

    // Given to various sub-components, this dictates how the mouse will behave when clicked in different situations
    setMouseContext = (value: string) => {
        this.mouseContext = value;
        this.selectedBuilding = this._sidebar._detailsArea._buildingSelection;
        if (this.selectedBuilding != null)  {
            console.log(`Selected building: ${this.selectedBuilding.name ? this.selectedBuilding.name : null}`);
        }
    }

    // Used for placing buildings and anything else that needs to 'snap to' the grid (returns values in grid locations)
    getMouseGridPosition(mouseX: number, mouseY: number) {
        const mouseGridX = Math.floor(mouseX / constants.BLOCK_WIDTH)
        const mouseGridY = Math.floor(mouseY / constants.BLOCK_WIDTH)
        const horizontalOffGridValue = Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH);
        const gridX = mouseGridX + horizontalOffGridValue;
        const gridY = mouseGridY;
        // TODO: ADD vertical offset calculation
        // Return coordinates as a tuple:
        return [gridX, gridY];
    }

    setGameSpeed = (value: string) => {
        this.gameOn = true;     // Always start by assuming the game is on
        switch (value) {
            case "pause":
                this.gameOn = false;
                break;
            case "slow":
                this.ticksPerMinute = 60;
                break;
            case "fast":
                this.ticksPerMinute = 20;
                break;
            case "blazing":
                this.ticksPerMinute = 1;    // Ultra fast mode in dev mode?!
                break;
        }
    }

    // In-game event generator: produces scheduled and/or random events which will create modal popups
    generateEvent = (probability?: number) => {     // Probability is given optionally as a percent value
        if (probability) {
            const rand = Math.floor(Math.random() * 100);           // Generate random value and express as a percent
            if (rand <= probability) this.createModal(true, 0);     // Fire if given probability is higher than random value
        } else {
            this.createModal(false, 0);
        }
    }

    createModal = (random: boolean, id: number) => {
        this.gameOn = false;
        this._modal = new Modal(this._p5, this.closeModal, random, id);
        this.setMouseContext("modal");
    }

    closeModal = () => {
        this.gameOn = true;
        this._modal = null;
        // Reset mouse context to 'select' unless a building has been selected for construction:
        if (this.selectedBuilding) {
            this.setMouseContext("place");
        } else {
            this.setMouseContext("select");
        }
    }

    advanceClock = () => {
        if (this._tick < this.ticksPerMinute) {
            if (this.gameOn) this._tick ++;      // Advance ticks if game is unpaused
        } else {
            this._tick = 0;     // Advance minutes
            if (this._minute < this._minutesPerHour - 1) {  // Minus one tells the minutes counter to reset to zero after 59
                this._minute ++;
            } else {
                this._minute = 0;   // Advance hours (anything on an hourly schedule should go here)
                this.updateEarthData();     // Advance Earth date every game hour
                this.generateEvent();
                // this.generateEvent(50);
                if (this._hour < this._hoursPerClockCycle) {
                    this._hour ++;
                    if (this._hour === this._hoursPerClockCycle) {  // Advance day/night cycle when hour hits twelve
                        if (this._clockCycle === "AM") {
                            this._clockCycle = "PM"
                        } else {
                            this._clockCycle = "AM";        // Advance date (anything on a daily schedule should go here)
                            if (this._sol < this._solsPerYear) {
                                this._sol ++;
                            } else {
                                this._sol = 1;
                                this._smartianYear ++;      // Advance year (anything on an yearly schedule should go here)
                            }
                            this._sidebar.setDate(this._sol, this._smartianYear);   // Update sidebar date display
                        }  
                    }
                } else {
                    this._hour = 1;     // Hour never resets to zero
                }
            }      
        }
    }

    // For building placement
    renderBuildingShadow = () => {
        const p5 = this._p5;
        let [x, y] = this.getMouseGridPosition(p5.mouseX, p5.mouseY);
        x = x * constants.BLOCK_WIDTH - this._horizontalOffset;
        y = y * constants.BLOCK_WIDTH;
        if (this.selectedBuilding !== null) {
            if (this._infrastructure.isModule(this.selectedBuilding)) {
                const w = this.selectedBuilding.width * constants.BLOCK_WIDTH;
                const h = this.selectedBuilding.height * constants.BLOCK_WIDTH;
                p5.rect(x, y, w, h);
            } else {
                p5.rect(x, y, constants.BLOCK_WIDTH, constants.BLOCK_WIDTH);
            }
        }
    }

    render = () => {
        // Scroll over 1 pixel per refresh cycle if mouse is pressed and the game is not yet at the right or left edge of the map:
        if (this._scrollingLeft && this._horizontalOffset > 0) {
            this._horizontalOffset --;
        } else if (this._scrollingRight && this._horizontalOffset < this._map._maxOffset){
            this._horizontalOffset ++;
        }
        this.advanceClock();
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5. fill(constants.GREEN_TERMINAL);
        p5.text(this._horizontalOffset, constants.SCREEN_WIDTH  * 3/8 , 450);
        p5.text(this._map._maxOffset, constants.SCREEN_WIDTH  * 3/8 , 500);
        p5.text(`Date: ${this._sol}-${this._smartianYear}`, constants.SCREEN_WIDTH * 3/8, 240);
        p5.text(`Time: ${this._hour}:${this._minute} ${this._clockCycle}`, constants.SCREEN_WIDTH * 3/8, 300);
        this._map.render(this._horizontalOffset);
        this._infrastructure.render(this._horizontalOffset);
        this._sidebar.render(this._minute, this._hour, this._clockCycle);
        // Mouse pointer is shadow of selected building, to help with building placement:
        if (this.selectedBuilding !== null) {
            this.renderBuildingShadow();
        }
        if (this._modal) {
            this._modal.render();
        }
    }

}