// The details area is an expandable section of the sidebar, used to display information and building options
import P5 from "p5";
import Button from "./button";
import Minimap from "./minimap";
import { constants } from "./constants";

export default class DetailsArea {
    // Details Area types:
    _p5: P5;
    _x: number;
    _y: number;
    _yExtended: number;
    _buttonY: number;
    _width: number;
    _normalHeight: number;
    _extendedHeight: number;
    _buttonHeight: number;
    _buttonMargin: number;          // Height plus a margin; used directly for positioning buttons with a gap in between
    _isExtended: boolean;
    _categoryButtons: Button[];     // First-level buttons: build option categories
    _optionbuttons: Button[];       // Second-level buttons: actual build options (sorted into categories)
    _minimap: Minimap;
    // TODO: add _currentOption as new component type, buildingDetails, which shows an image of a building and all of its info
    setOpen: (status: boolean) => void; // Alerts the sidebar that the details area has been closed (so it can reshow its own buttons)

    constructor(p5: P5, setOpen: (status: boolean) => void) {
        this._p5 = p5;
        this._x = constants.SCREEN_WIDTH - constants.SIDEBAR_WIDTH + 4;
        this._y = 432;
        this._yExtended = 120;
        this._buttonY = 240;
        this._width = constants.SIDEBAR_WIDTH - 8;
        this._normalHeight = 284;
        this._extendedHeight = 596;
        this._buttonHeight = 88;
        this._buttonMargin = 96;
        this._isExtended = false;
        const hab = new Button(p5, "Habitation Modules", this._x, this._buttonY, this.handleHabitation, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        const ind = new Button(p5, "Industrial Modules", this._x, this._buttonY + this._buttonMargin, this.handleIndustrial, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        const log = new Button(p5, "Logistics", this._x, this._buttonY + 2 * this._buttonMargin, this.handleLogistics, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        const veh = new Button(p5, "Vehicles", this._x, this._buttonY + 3 * this._buttonMargin, this.handleVehicles, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        const close = new Button(p5, "BACK", this._x, this._buttonY + 4 * this._buttonMargin, this.handleClose, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG);    // Close is the 'Back' button from the categories list; we'll have another 'back' button to return to categories buttons from within an individual category (this will not shrink the details area like the 'close' button does)
        this._categoryButtons = [hab, ind, log, veh, close];
        this._optionbuttons = [];
        this._minimap = new Minimap(p5, this._x + 24, this._y + 256, []);
        this.setOpen = setOpen;
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        // Set individual button groups to active depending on which level of selection the user is at:
        // Initial back button is active when details area is expanded:
        if (this._isExtended) {
            this._categoryButtons.forEach((button) => {
                button.handleClick(mouseX, mouseY);
            })
        }
    }

    handleHabitation = () => {
        console.log("Go Habs Go!!!");
    }

    handleIndustrial = () => {
        console.log("Very industrious for a cossack!");
    }

    handleLogistics = () => {
        console.log("It's a logistical nightmare");
    }

    handleVehicles = () => {
        console.log("Zoom zoom.");
    }

    handleClose = () => {
        this.setOpen(false);        // For Sidebar
        this._isExtended = false;   // For self
    }

    setExtended = (extended: boolean) => {
        this._isExtended = extended;
    }

    render = () => {
        const p5 = this._p5;
        p5.fill(constants.BLUEGREEN_DARK);
        p5.strokeWeight(2);
        if (this._isExtended) {
            p5.rect(this._x, this._yExtended, this._width, this._extendedHeight, 8, 8, 8, 8);
            this._categoryButtons.forEach((button) => {
                button.render();
            })
            p5.textSize(22);
            p5.fill(constants.GREEN_TERMINAL)
            p5.text("Select Construction Type", this._x + (this._width / 2), this._yExtended + 64)
            // TODO: If category selected, show individual construction options
        } else {
            p5.rect(this._x, this._y, this._width, this._normalHeight, 8, 8, 8, 8);
            // If not expanded, show minimap
            p5.fill(constants.GREEN_TERMINAL);
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.text("Minimap", this._x + (this._width / 2), this._y + 64);
            this._minimap.render();
        }
    }
}