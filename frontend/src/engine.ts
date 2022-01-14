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
    mouseContext: string;       // Mouse context tells the Engine's click handler what to do when the mouse is pressed.
    switchScreen: (switchTo: string) => void;   // App-level SCREEN switcher (passed down via drill from the app)
    // Game data!!!

    constructor(p5: P5, switchScreen: (switchTo: string) => void, changeView: (newView: string) => void) {
        super(p5, changeView);
        this.switchScreen = switchScreen;
        this._sidebar = new Sidebar(p5, this.switchScreen, this.changeView, this.setMouseContext);
        this._sidebarExtended = true;   // Side bar can be partially hidden to expand map view - should this be here or in the SB itself??
        this._gameData = {
            difficulty: "",
            mapType: "",
            randomEvents: true,
            mapTerrain: []
        }   // Game data is loaded from the Game module when it calls the setup method
        this._map = new Map(this._p5);
        this.mouseContext = "select"    // Default mouse context is the user wants to select what they click on (if they click on the map)
    }

    setup = (gameData: GameData) => {
        this.currentView = true;
        this._gameData = gameData;
        this._sidebar.setup();
        this._map.setup(this._gameData.mapTerrain);
        console.log(this._map._columns);
        this._sidebar.detailsArea._minimap.updateTerrain(this._gameData.mapTerrain);
        // Sidebar minimap display - does it only need it during 'setup' or does it also need occasional updates?
    }

    // When there is a click, establish whether it's in the 'world' or the sidebar:
    handleClicks = (mouseX: number, mouseY: number) => {
        // Click is in sidebar:
        if (mouseX > constants.SCREEN_WIDTH - this._sidebar._width) {
            this._sidebar.handleClicks(mouseX, mouseY);
        } else {
            // Click is on the map somewhere:
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

    setMouseContext = (value: string) => {
        this.mouseContext = value;
    }

    render = () => {
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5. fill(constants.GREEN_TERMINAL);
        p5.text(this.mouseContext, constants.SCREEN_WIDTH  * 3/8 , 540);
        this._sidebar.render();
        this._map.render();
    }

}