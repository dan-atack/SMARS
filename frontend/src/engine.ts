// Top-level component for the game environment (as opposed to game interface, which is in game.ts)
import P5 from "p5";
import View from "./view";
import Sidebar from "./sidebar";
import Map from "./map";
import { constants } from "./constants";

// Define object shape for pre-game data from game setup screen:
type GameData = {
    difficulty: string,
    mapType: string,
    randomEvents: boolean,
    mapTerrain: number[][];
}

export default class Engine extends View {
    // Engine types
    _sidebar: Sidebar;
    _sidebarExtended: boolean;
    _gameData: GameData;
    _map: Map;
    _horizontalOffset: number;  // This will be used to offset all elements in the game's world, starting with the map
    _scrollDistance: number;    // Pixels from the edge of the world area in which scrolling occurs
    _scrollingLeft: boolean;    // Flags for whether the user is currently engaged in scrolling one way or the other
    _scrollingRight: boolean;
    mouseContext: string;       // Mouse context tells the Engine's click handler what to do when the mouse is pressed.
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
    // Game data!!!

    constructor(p5: P5, switchScreen: (switchTo: string) => void, changeView: (newView: string) => void) {
        super(p5, changeView);
        this.switchScreen = switchScreen;
        this._sidebar = new Sidebar(p5, this.switchScreen, this.changeView, this.setMouseContext, this.setGameSpeed);
        this._sidebarExtended = true;   // Side bar can be partially hidden to expand map view - should this be here or in the SB itself??
        this._gameData = {
            difficulty: "",
            mapType: "",
            randomEvents: true,
            mapTerrain: []
        }   // Game data is loaded from the Game module when it calls the setup method
        this._map = new Map(this._p5);
        this._horizontalOffset = 0;
        this._scrollDistance = 50;
        this._scrollingLeft = false;
        this._scrollingRight = false;
        this.mouseContext = "select"    // Default mouse context is the user wants to select what they click on (if they click on the map)
        // Time-keeping:
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
        this._horizontalOffset = this._map._maxOffset / 2   // Put player in the middle of the map to start out
        this._sidebar.detailsArea._minimap.updateTerrain(this._gameData.mapTerrain);
        // Sidebar minimap display - does it only need it during 'setup' or does it also need occasional updates?
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        // Since the 'click' event occurs on the mouseup part of the button press, a click always signals the end of any scrolling:
        this._scrollingRight = false;
        this._scrollingLeft = false;
        // Click is in sidebar:
        if (mouseX > constants.SCREEN_WIDTH - this._sidebar._width) {
            this._sidebar.handleClicks(mouseX, mouseY);
        } else {
            // Click is on the map, between the scroll zones
            switch (this.mouseContext) {
                case "select":
                    console.log("Select");
                    break;
                case "place":
                    console.log("Place");
                    break;
                case "resource":
                    console.log("Resource");
                    break;
            }   
        }
    }

    // Handler for when the mouse button is being held down (will fire on every click, so be careful what you tell it to do!)
    handleMouseDown = (mouseX: number, mouseY: number) => {
        if (!(mouseX > constants.SCREEN_WIDTH - this._sidebar._width)) {
            if (mouseX < this._scrollDistance) {
                this._scrollingLeft = true;
            } else if (mouseX > constants.WORLD_VIEW_WIDTH - this._scrollDistance) {
                this._scrollingRight = true;
            }
        }  
    }

    setMouseContext = (value: string) => {
        this.mouseContext = value;
    }

    setGameSpeed = (value: string) => {
        this.gameOn = true;     // Always start by assuming the game is on
        switch (value) {
            case "pause":
                console.log("pause!");
                this.gameOn = false;
                break;
            case "slow":
                console.log("slow down!");
                this.ticksPerMinute = 60;
                break;
            case "fast":
                console.log("faster! faster!");
                this.ticksPerMinute = 30;
                break;
            case "blazing":
                console.log("Johnny Blaze!");
                this.ticksPerMinute = 10;
                break;
        }
    }

    advanceClock = () => {
        if (this._tick < this.ticksPerMinute) {
            if (this.gameOn) this._tick ++;      // Advance ticks if game is unpaused
        } else {
            this._tick = 0;
            if (this._minute < this._minutesPerHour - 1) {  // Minus one tells the minutes counter to reset to zero after 59
                this._minute ++;    // Advance minutes
            } else {
                this._minute = 0;
                if (this._hour < this._hoursPerClockCycle) {
                    this._hour ++;      // Advance hours
                    if (this._hour === this._hoursPerClockCycle) {  // Advance day/night cycle when hour hits twelve
                        if (this._clockCycle === "AM") {
                            this._clockCycle = "PM"
                        } else {
                            this._clockCycle = "AM";
                            if (this._sol < this._solsPerYear) {
                                this._sol ++;       // Advance date
                            } else {
                                this._sol = 1;
                                this._smartianYear ++;      // Advance year
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
        p5.text(this._map._maxOffset, constants.SCREEN_WIDTH  * 3/8 , 500)
        const min = p5.map(this._minute, 0, 60, 0, 360);
        p5.text(`Date: ${this._sol}-${this._smartianYear}`, constants.SCREEN_WIDTH * 3/8, 240);
        p5.text(`Time: ${this._hour}:${this._minute} ${this._clockCycle}`, constants.SCREEN_WIDTH * 3/8, 300);
        this._map.render(this._horizontalOffset);
        this._sidebar.render(this._minute, this._hour, this._clockCycle);
    }

}