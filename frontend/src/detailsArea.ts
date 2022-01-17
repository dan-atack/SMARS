// The details area is an expandable section of the sidebar, used to display information and building options
import P5 from "p5";
import Button from "./button";
import BuildingChip from "./buildingChip";
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
    _buttonMargin: number;              // Height plus a margin; used directly for positioning buttons with a gap in between
    _isExtended: boolean;
    _buildTypeSelection: string;        // Case name for which category of building, if any, is selected
    _categoryButtons: Button[];         // First-level buttons: build option categories
    _optionbuttons: BuildingChip[];     // Second-level buttons: actual build options (sorted into categories)
    _backButton: Button;                // Button to return from the building options list to the building categories list
    _minimap: Minimap;
    // TODO: add _currentOption as new component type, buildingDetails, which shows an image of a building and all of its info
    setOpen: (status: boolean) => void; // Alerts the sidebar that the details area has been closed (so it can reshow its own buttons)
    setMouseContext: (value: string) => void;   // Updater for the Engine's mouse context when a building is selected

    constructor(p5: P5, setOpen: (status: boolean) => void, setMouseContext: (value: string) => void) {
        this._p5 = p5;
        this._x = constants.SCREEN_WIDTH - constants.SIDEBAR_WIDTH + 4;
        this._y = 432;
        this._yExtended = 124;
        this._buttonY = 240;
        this._width = constants.SIDEBAR_WIDTH - 8;
        this._normalHeight = 284;
        this._extendedHeight = 592;
        this._buttonHeight = 88;
        this._buttonMargin = 96;
        this._isExtended = false;
        this._buildTypeSelection = "";      // Default is no selection
        const hab = new Button(p5, "Habitation Modules", this._x, this._buttonY, this.handleHabitation, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        const ind = new Button(p5, "Industrial Modules", this._x, this._buttonY + this._buttonMargin, this.handleIndustrial, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        const log = new Button(p5, "Logistics", this._x, this._buttonY + 2 * this._buttonMargin, this.handleLogistics, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        const veh = new Button(p5, "Vehicles", this._x, this._buttonY + 3 * this._buttonMargin, this.handleVehicles, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        const close = new Button(p5, "BACK", this._x, this._buttonY + 4 * this._buttonMargin, this.handleClose, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG);  // Close is the 'Back' button from the categories list; de-expands DA
        this._categoryButtons = [hab, ind, log, veh, close];
        this._optionbuttons = [];
        this._backButton = new Button(p5, "BACK", this._x, this._buttonY + 4 * this._buttonMargin, this.handleBack, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG);
        this._minimap = new Minimap(p5, this._x + 24, this._y + 256, []);
        this.setOpen = setOpen;
        this.setMouseContext = setMouseContext;
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        if (this._isExtended) {
            // Set individual button groups to active depending on which level of selection the user is at:
            if (this._buildTypeSelection) {
                this._optionbuttons.forEach((button) => {
                    button.handleClick(mouseX, mouseY);
                })
                this._backButton.handleClick(mouseX, mouseY);   // Back button is shown alongside building options
            } else {
                this._categoryButtons.forEach((button) => {
                    button.handleClick(mouseX, mouseY);
                })
            }   
        }
    }

    // Take a list of building data objects and use it to populate the building option buttons list:
    populateBuildingOptions = (buildings: string[]) => {
        this._optionbuttons = [];       // Clear existing options
        buildings.forEach((mod, idx) => {
            const data = {
                name: mod,
            }
            const m = new BuildingChip(this._p5, data, this._x, this._buttonY + idx * this._buttonMargin, this.setMouseContext);
            this._optionbuttons.push(m);
        })
    }

    handleHabitation = () => {
        this.setBuildTypeSelection("habitation");
        // TODO: Add server action to fetch a list of buildings with the 'habitation' type; pass the result to building populator (above)
        const modules = ["Sleeping Quarters", "Cantina", "Recreation Area"];
        this.populateBuildingOptions(modules);
    }

    handleIndustrial = () => {
        this.setBuildTypeSelection("industrial");
        const modules = ["Glass Smelter", "Rover Garage", "Oxygen Factory"];
        this.populateBuildingOptions(modules);
    }

    handleLogistics = () => {
        this.setBuildTypeSelection("logistics");
        const modules = ["Pipes", "Ladder", "Ventilation Duct"];
        this.populateBuildingOptions(modules);
    }

    handleVehicles = () => {
        this.setBuildTypeSelection("vehicles");
        const modules = ["Simple Rover"];
        this.populateBuildingOptions(modules);
    }

    // Close the build categories list (and return to top-level sidebar display)
    handleClose = () => {
        this.setOpen(false);        // For Sidebar
        this._isExtended = false;   // For self
    }

    // Close a specific building category's modules list and return to build category options (keeping details area extended)
    handleBack = () => {
        this.setBuildTypeSelection("");
    }

    setExtended = (extended: boolean) => {
        this._isExtended = extended;
    }

    setBuildTypeSelection = (value: string) => {
        this._buildTypeSelection = value;
    }

    showBuildingOptions = () => {
        const p5 = this._p5;
        p5.textSize(22);
        p5.fill(constants.GREEN_TERMINAL);
        switch (this._buildTypeSelection) {
            case "habitation":
                p5.text("Select Habitation Module", this._x + (this._width / 2), this._yExtended + 64);
                break;
            case "industrial":
                p5.text("Select Industrial Module", this._x + (this._width / 2), this._yExtended + 64);
                break;
            case "logistics":
                p5.text("Build Logistical Module", this._x + (this._width / 2), this._yExtended + 64);
                break;
            case "vehicles":
                p5.text("Build New Vehicle", this._x + (this._width / 2), this._yExtended + 64);
                break;
        }
        this._backButton.render();  // Render back button to return to building categories menu
        // Render individual building options:
        this._optionbuttons.forEach((button) => {
            button.render();
        })
        p5.textAlign(p5.CENTER, p5.CENTER);
        // TODO: Add rules for pagination if list length exceeds 4 items
    }

    render = () => {
        const p5 = this._p5;
        p5.fill(constants.BLUEGREEN_DARK);
        p5.strokeWeight(2);
        if (this._isExtended) { // If building option is selected from sidebar menu, expand the details area
            p5.rect(this._x, this._yExtended, this._width, this._extendedHeight, 8, 8, 8, 8);
            if (this._buildTypeSelection) { // If building type has been selected, show building options for that type
                this.showBuildingOptions();
            } else {
                this._categoryButtons.forEach((button) => { // If not, show the buttons to choose a building category
                    button.render();
                })
                p5.textSize(22);
                p5.fill(constants.GREEN_TERMINAL);
                p5.text("Select Construction Type", this._x + (this._width / 2), this._yExtended + 64)
            }
        } else {    // If Details Area is not extended, show it with normal height and display the Minimap in the middle of it
            p5.rect(this._x, this._y, this._width, this._normalHeight, 8, 8, 8, 8);
            p5.fill(constants.GREEN_TERMINAL);
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.text("Minimap", this._x + (this._width / 2), this._y + 64);
            this._minimap.render();
        }
    }
}