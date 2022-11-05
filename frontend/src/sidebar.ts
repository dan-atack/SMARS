// The in-game sidebar (control panel) is a sub-component of the Engine view
import P5 from "p5";
import Button from "./button";
import DetailsArea from "./detailsArea";
import { constants } from "./constants";

export default class Sidebar {
    // Sidebar types:
    _p5: P5;
    _width: number;
    _height: number;
    _viewButtonWidth: number;
    _viewButtonHeight: number;
    _gameSpeedButtonWidth: number;
    _gameSpeedButtonMargin: number;
    _position: number;
    _buttons: Button[];
    _gameSpeedButtons: Button[];
    _clockX: number;
    _clockY: number;
    _gameSpeedButtonX: number;
    _gameSpeedButtonY: number;
    _viewButtonY: number;
    _mapButtonsY: number;
    _detailsAreaY: number;
    _extendedDetailsAreaY: number;
    _detailsAreaHeight: number;
    _extendedDetailsAreaHeight: number;
    _buildOptionsOpen: boolean;     // Flag for showing the build options buttons instead of regular top-level buttons
    _menuOpen: boolean;
    _martianDate: number[];                     // Martian date = year, month, date. Screw Date objects!
    switchScreen: (switchTo: string) => void;   // App-level SCREEN switcher (passed down via drill from the app)
    changeView: (newView: string) => void;      // Game-level VIEW switcher (passed down from the game module)
    setMouseContext: (value: string) => void    // Changes the mouse click handler response in the Engine
    setGameSpeed: (value: string) => void;      // Changes the game speed (ticks per game minute) in Engine (string goes in switch block)
    menuButton: Button;                 // The Main Menu button stands apart from the regular buttons list to ensure it's always rendered.
    _detailsArea: DetailsArea;

    constructor(p5:P5, switchScreen: (switchTo: string) => void, changeView: (newView: string) => void, setMouseContext: (value: string) => void, setGameSpeed: (value: string) => void) {
        this._p5 = p5;
        this._width = constants.SIDEBAR_WIDTH // Just over one quarter of the screen is given to the sidebar
        this._height = constants.SCREEN_HEIGHT
        this._position = constants.SCREEN_WIDTH - this._width;
        this._clockX = this._position + 56;
        this._clockY = 48;
        this._gameSpeedButtonX = this._position + 120;
        this._gameSpeedButtonY = 94;
        this._viewButtonWidth = this._width / 2 - 8;        // Minus eight for the padding space
        this._viewButtonHeight = this._width / 4 - 8;
        this._gameSpeedButtonWidth = 24;
        this._gameSpeedButtonMargin = 32;
        this._viewButtonY = 132;
        this._mapButtonsY = 284;
        this._detailsAreaY = 432;
        this._extendedDetailsAreaY = 120;
        this._detailsAreaHeight = 284;
        this._extendedDetailsAreaHeight = 596;
        this._buttons = [];
        this._gameSpeedButtons = [];
        this._buildOptionsOpen = false;     // Flag for showing the build options buttons instead of regular top-level buttons
        this._menuOpen = false;             // Use this flag to alert the Game screen if the menu has just been opened
        this._martianDate = [1, 0];         // Date, Year: Game starts on day 1 of year zero in the Smartian calendar!
        this.switchScreen = switchScreen;
        this.changeView = changeView;
        this.setMouseContext = setMouseContext;
        this.setGameSpeed = setGameSpeed;
        this.menuButton = new Button("Menu", constants.SCREEN_WIDTH - 88, 16, this.handleMenuButton, 76, 64, constants.GREEN_TERMINAL, constants.ALMOST_BLACK, 24);
        this._detailsArea = new DetailsArea(p5, this.setBuildOptionsOpen, setMouseContext);  // OR ThIS.SetMouseContex?
    }

    setup = () => {
        // Ensure top level sidebar display is shown:
        this._buildOptionsOpen = false;
        this._detailsArea.setExtended(false);
        // Create view-changing buttons:
        const earth = new Button("Earth", this._position + 4, this._viewButtonY, this.handleEarth, this._viewButtonWidth, this._viewButtonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK, 24);
        const industry = new Button("Industry", this._position + this._viewButtonWidth + 12, this._viewButtonY, this.handleIndustry, this._viewButtonWidth, this._viewButtonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK, 24);
        const tech = new Button("Technology", this._position + 4, this._viewButtonY + this._viewButtonHeight + 8, this.handleTech, this._viewButtonWidth, this._viewButtonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK, 20);
        const population = new Button("Population", this._position + this._viewButtonWidth + 12, this._viewButtonY + this._viewButtonHeight + 8, this.handlePopulation, this._viewButtonWidth, this._viewButtonHeight, constants.GREEN_TERMINAL, constants.GREEN_DARK, 22);
        // Construction, resources and map options buttons:
        const build = new Button("BUILD", this._position + 4, this._mapButtonsY, this.handleBuild, this._viewButtonWidth, this._viewButtonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 24);
        const resource = new Button("RESOURCE", this._position + this._viewButtonWidth + 12, this._mapButtonsY, this.handleResource, this._viewButtonWidth, this._viewButtonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        const inspect = new Button("INSPECT", this._position + 4, this._mapButtonsY + this._viewButtonHeight + 8, this.handleInspect, this._viewButtonWidth, this._viewButtonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 24);
        const overlays = new Button("OVERLAYS", this._position + this._viewButtonWidth + 12, this._mapButtonsY + this._viewButtonHeight + 8, this.handleOverlays, this._viewButtonWidth, this._viewButtonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        // Game speed adjustment buttons:
        const pause = new Button("||", this._gameSpeedButtonX, this._gameSpeedButtonY, this.handlePause, this._gameSpeedButtonWidth, this._gameSpeedButtonWidth, constants.GREEN_TERMINAL, constants.GREEN_DARK, 18);
        const slow = new Button(">", this._gameSpeedButtonX + this._gameSpeedButtonMargin, this._gameSpeedButtonY, this.handleSlow, this._gameSpeedButtonWidth, this._gameSpeedButtonWidth, constants.GREEN_TERMINAL, constants.GREEN_DARK, 18);
        const fast = new Button(">>", this._gameSpeedButtonX + 2 * this._gameSpeedButtonMargin, this._gameSpeedButtonY, this.handleFast, this._gameSpeedButtonWidth + 8, this._gameSpeedButtonWidth, constants.GREEN_TERMINAL, constants.GREEN_DARK, 18);
        const blazing = new Button(">>>", this._gameSpeedButtonX + 3 * this._gameSpeedButtonMargin + 8, this._gameSpeedButtonY, this.handleBlazing, this._gameSpeedButtonWidth + 16, this._gameSpeedButtonWidth, constants.GREEN_TERMINAL, constants.GREEN_DARK, 18);
        this._buttons = [earth, industry, tech, population, build, resource, inspect, overlays];
        this._gameSpeedButtons = [pause, slow, fast, blazing];
    }

    // General-purpose click dispatcher
    handleClicks = (mouseX: number, mouseY: number) => {
        this._detailsArea.handleClicks(mouseX, mouseY); // Run Details Area click handlers first
        // Only run top-level button handlers if the building options aren't open:
        if (!this._buildOptionsOpen) {
            this._buttons.forEach((button) => {
                button.handleClick(mouseX, mouseY);
            })
        }
        this.menuButton.handleClick(mouseX, mouseY);    // Call menu button separately since it's not part of the standard list of buttons
        this._gameSpeedButtons.forEach((button) => {    // Ditto for the game speed buttons
            button.handleClick(mouseX, mouseY);
        })
    }

    // Handlers for changing views:
    handleEarth = () => {
        this.changeView("earth");
    }

    handleIndustry = () => {
        this.changeView("industry");
    }

    handleTech = () => {
        this.changeView("tech");
    }

    handlePopulation = () => {
        this.changeView("population");
    }

    // Handlers for in-game options
    handleBuild = () => {
        // Opening the build options re-arranges the sidebar layout
        this.setBuildOptionsOpen(true);
        this._detailsArea.setExtended(true);
    }
    
    handleResource = () => {
        this.setMouseContext("resource");
        this.resetSelectedButton();
        this._buttons[5].setSelected(true);
    }

    handleInspect = () => {
        this.setMouseContext("inspect");
        this.resetSelectedButton();
        this._buttons[6].setSelected(true);
    }

    handleOverlays = () => {
        this.resetSelectedButton();
        this._buttons[7].setSelected(true);
        console.log("Let's see some overlays!");
    }

    handleMenuButton = () => {
        this.setMenuOpen(true);
        this.switchScreen("inGameMenu");
        this.setMouseContext("inspect");     // Reset mouse context if menu is opened
    }

    // Handlers for game-speed adjustments
    handlePause = () => {
        this.resetGameSpeedButtons();
        this._gameSpeedButtons[0].setSelected(true);
        this.setGameSpeed("pause");
    }

    handleSlow = () => {
        this.resetGameSpeedButtons();
        this._gameSpeedButtons[1].setSelected(true);
        this.setGameSpeed("slow");
    }
    
    handleFast = () => {
        this.resetGameSpeedButtons();
        this._gameSpeedButtons[2].setSelected(true);
        this.setGameSpeed("fast");
    }

    handleBlazing = () => {
        this.resetGameSpeedButtons();
        this._gameSpeedButtons[3].setSelected(true);
        this.setGameSpeed("blazing");
    }

    resetSelectedButton = () => {
        this._buttons.forEach((button) => {
            button.setSelected(false);
        })
    }

    resetGameSpeedButtons = () => {
        this._gameSpeedButtons.forEach((button) =>{
            button.setSelected(false);
        })
    }

    // Setter for flag that the menu has just opened:
    setMenuOpen = (status: boolean) => {
        this._menuOpen = status;
    }

    setBuildOptionsOpen = (status: boolean) => {
        this._buildOptionsOpen = status;
    }

    setDate = (date: number, year: number) => {
        this._martianDate = [date, year];
    }

    renderClock = (minute: number, hour: number, clockCycle: string) => {
        const p5 = this._p5;
        // Martian Clock: Show hands of the clock at different angle as the day progresses
        p5.fill(constants.BLUE_BG);
        p5.circle(this._clockX, this._clockY, 64);
        p5.fill(constants.GREEN_TERMINAL);
        p5.textSize(14);
        hour > 9 || hour < 3 ? p5.text(clockCycle, this._clockX, this._clockY + 16): p5.text(clockCycle, this._clockX, this._clockY - 16);
        // Minute hand
        const min = p5.map(minute, 0, 60, 0, 360) + 270;
        const mv = P5.Vector.fromAngle(p5.radians(min), 24);
        p5.stroke(constants.EGGSHELL);
        p5.strokeWeight(3);
        p5.line(this._clockX, this._clockY, mv.x + this._clockX, mv.y + this._clockY);
        // Hour hand
        p5.stroke(constants.GRAY_DRY_ICE);
        const hr = p5.map(hour, 0, 12, 0, 360) + 270;
        const hv = P5.Vector.fromAngle(p5.radians(hr), 18);
        p5.strokeWeight(5);
        p5.line(this._clockX, this._clockY, hv.x + this._clockX, hv.y + this._clockY);
    }

    render = (minute: number, hour: number, clockCycle: string) => {
        const p5 = this._p5;
        p5.strokeWeight(4);
        p5.stroke(constants.ALMOST_BLACK);
        p5.fill(constants.SIDEBAR_BG);
        p5.rect(this._position, 0, this._width, this._height);
        this.renderClock(minute, hour, clockCycle);
        // Weather gauge
        p5.stroke(constants.ALMOST_BLACK);
        p5.fill(constants.RED_BG);
        p5.circle(this._clockX + 84, this._clockY, 64);
        // Martian Date
        p5.fill(constants.EGGSHELL);
        const dateString = `Day ${this._martianDate[0]}, Year ${this._martianDate[1]}`;
        p5.strokeWeight(2);
        p5.textSize(14);
        p5.text(dateString, this._clockX, this._clockY + 60);
        this.menuButton.render(p5);
        this._gameSpeedButtons.forEach((button) => {
            button.render(p5);
        })
        if (!this._buildOptionsOpen) {
            // Show top-level buttons if build options area is not expanded
            this._buttons.forEach((button) => {
                button.render(p5);    // Top-level buttons
            })
        }
        this._detailsArea.render(p5);
    }
}