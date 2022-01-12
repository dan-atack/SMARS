// Top-level component for the game environment (as opposed to game interface, which is in game.ts)
import P5 from "p5";
import View from "./view";
import Sidebar from "./sidebar";
import { constants } from "./constants";

export default class Engine extends View {
    // Engine types
    _sidebar: Sidebar;
    _sidebarExtended: boolean;
    mouseContext: string;       // Mouse context tells the Engine's click handler what to do when the mouse is pressed.
    switchScreen: (switchTo: string) => void;   // App-level SCREEN switcher (passed down via drill from the app)
    // Game data!!!

    constructor(p5: P5, switchScreen: (switchTo: string) => void, changeView: (newView: string) => void) {
        super(p5, changeView);
        this.switchScreen = switchScreen;
        this._sidebar = new Sidebar(p5, this.switchScreen, this.changeView, this.setMouseContext);
        this._sidebarExtended = true;   // Side bar can be partially hidden to expand map view - should this be here or in the SB itself??
        this.mouseContext = "select"    // Default mouse context is the user wants to select what they click on (if they click on the map)
    }

    setup = () => {
        this.currentView = true;
        const p5 = this._p5;
        this._sidebar.setup();
        // Sidebar will need map data for minimap display - does it only need it during 'setup' or does it also need occasional updates?
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
        p5.text("Hello Engine!", constants.SCREEN_WIDTH  * 3/8 , 540);
        this._sidebar.render();
    }

}