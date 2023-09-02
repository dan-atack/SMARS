// The details area is an expandable section of the sidebar, used to display information and building options
import P5 from "p5";
import AudioController from "./audioController";
import Button from "./button";
import BuildingChip from "./buildingChip";
import Minimap from "./minimap";
import InspectDisplay from "./inspectDisplay";
// Inspect Display Data types
import Block from "./block";
import Colonist from "./colonist";
import Connector from "./connector";
import Module from "./module";
// Types and functions from 'Server functions' file (for backend connectivity)
import { getStructureTypes, getStructures, ModuleInfo, ConnectorInfo } from "./server_functions";
import { constants } from "./constants";

export default class DetailsArea {
    // Details Area types:
    _audio: AudioController;
    _x: number;
    _y: number;
    _minimapY: number;
    _yExtended: number;
    _buttonY: number;
    _width: number;
    _normalHeight: number;
    _extendedHeight: number;
    _buttonHeight: number;
    _buttonMargin: number;              // Height plus a margin; used directly for positioning buttons with a gap in between
    _isExtended: boolean;
    // Category/type/structure selection status
    _buildCategorySelection: string;    // Which CATEGORY of building, if any, is selected
    _buildTypeSelection: string;        // Which TYPE of building, if any, is selected
    _buildingSelection: ModuleInfo | ConnectorInfo | null;     // the actual building itself (if any)
    // Data from backend
    _buildTypeOptions: string[];                        // Storage variable for TYPE OPTIONS data fetched from the backend
    _buildingOptions: ModuleInfo[] | ConnectorInfo[];   // Storage variable for BUILDING OPTIONS data fetched from the backend
    // Buttons
    _categoryButtons: Button[];         // First-level buttons: general building CATEGORIES (modules, connectors... vehicles??)
    _typeButtons: Button[];             // Second-level buttons: building TYPE options (habitation, transport, etc.)
    _optionButtons: BuildingChip[];     // Third-level buttons: actual building options (sorted by type)
    _backButton: Button;                // Button to return from the building options list to the building categories list
    // Minimap / Inspect area
    _inspectDisplay: InspectDisplay;    // Component
    _minimap: Minimap;                  // Component
    _inspectData: boolean;              // Switch to turn on the inspect display if there is data to show
    // TODO: add _currentOption as new component type, buildingDetails, which shows an image of a building and all of its info
    setOpen: (status: boolean) => void; // Alerts the sidebar that the details area has been closed (so it can reshow its own buttons)
    setMouseContext: (value: string) => void;   // Updater for the Engine's mouse context when a building is selected
    getStructureTypes: (setter: (options: string[]) => void, category: string) => void;   // Server function to fetch lists for building types
    getStructures: (setter: (options: ModuleInfo[] | ConnectorInfo[]) => void, category: string, type: string) => void

    constructor(audio: AudioController, setOpen: (status: boolean) => void, setMouseContext: (value: string) => void, setHorizontalOffset: (x: number) => void) {
        this._audio = audio;
        this._x = constants.SCREEN_WIDTH - constants.SIDEBAR_WIDTH + 4;
        this._y = 432;
        this._minimapY = this._y + 256;
        this._yExtended = 124;
        this._buttonY = 240;
        this._width = constants.SIDEBAR_WIDTH - 8;
        this._normalHeight = 284;
        this._extendedHeight = 592;
        this._buttonHeight = 88;
        this._buttonMargin = 96;
        this._isExtended = false;
        this._buildCategorySelection = "";  // Default is no selection for first-level category
        this._buildTypeSelection = "";      // Default is no selection for second-level category (type)
        this._buildingSelection = null;     // Default is no building selection
        this._buildTypeOptions = [];
        this._buildingOptions = [];
        const mods = new Button("Modules", this._x, this._buttonY, this.handleModules, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        const cons = new Button("Connectors", this._x, this._buttonY + this._buttonMargin, this.handleConnectors, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
        const close = new Button("CANCEL", this._x, this._buttonY + 4 * this._buttonMargin, this.handleClose, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG);  // Close is the 'Back' button from the categories list; de-expands DA
        this._categoryButtons = [mods, cons, close];
        this._typeButtons = [];
        this._optionButtons = [];
        this._backButton = new Button("BACK", this._x, this._buttonY + 4 * this._buttonMargin, this.handleBack, this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG);
        this._inspectDisplay = new InspectDisplay(this._x, this._y);
        this._minimap = new Minimap(this._x + 8, this._minimapY, "Minimap", setHorizontalOffset);
        this._inspectData = false;      // By default there is no inspect data to display
        this.setOpen = setOpen;
        this.setMouseContext = setMouseContext;
        this.getStructureTypes = getStructureTypes;
        this.getStructures = getStructures;
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        if (this._isExtended) {
            // Set individual button groups to active depending on which level of selection the user is at:
            if (this._buildTypeSelection) { // If the build TYPE is selected, show the individual buildings
                this._optionButtons.forEach((button) => {
                    button.handleClick(mouseX, mouseY);
                })
                this._backButton.handleClick(mouseX, mouseY);   // Back button is shown alongside building options
            } else if (this._buildCategorySelection) {  // If the type isn't selected but category is, show type options
                this._typeButtons.forEach((button) => {
                    button.handleClick(mouseX, mouseY);
                })
                this._backButton.handleClick(mouseX, mouseY);   // Back button is shown alongside type options too
            } else {
                this._categoryButtons.forEach((button) => {
                    button.handleClick(mouseX, mouseY);
                })
            }
        } else if (this._inspectData) {     // Alternately, if the Inspect Display is open, activate its click handler
            this._inspectDisplay.handleClicks(mouseX, mouseY);
        } else if (mouseY >= this._minimapY - 128) {                            // Otherwise, check if it's a click on the Minimap
            this._minimap.handleClick(mouseX);          // Currently, only the horizontal value is required by the Minimap
        }
    }

    // Take a list of building type name strings and use it to populate the second-level buttons:
    populateTypeOptions = (types: string[]) => {
        this._typeButtons = []; // Clear existing options
        types.forEach((buildingType, idx) => {
            const button = new Button(buildingType, this._x, this._buttonY + idx * this._buttonMargin, () => this.handleTypeSelection(buildingType), this._width, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 22);
            this._typeButtons.push(button);
        })
    }

    // Take a list of building data objects and use it to populate the building option buttons list:
    populateBuildingOptions = (buildings: ModuleInfo[] | ConnectorInfo[]) => {
        this._optionButtons = [];       // Clear existing options
        buildings.forEach((bld, idx) => {
            const m = new BuildingChip(this._audio, bld, this._x, this._buttonY + idx * this._buttonMargin, this.setMouseContext, this.setBuildingSelection);
            this._optionButtons.push(m);
        })
    }

    handleModules = () => {
        this._audio.quickPlay("pip01");
        this.setBuildCategorySelection("modules");
        this.getStructureTypes(this.setBuildTypeOptions, "modules");
    }

    handleConnectors = () => {
        this._audio.quickPlay("pip01");
        this.setBuildCategorySelection("connectors");
        this.getStructureTypes(this.setBuildTypeOptions, "connectors");
    }

    handleTypeSelection = (selection: string) => {
        this._audio.quickPlay("pip01");
        this.setBuildTypeSelection(selection);
        this.getStructures(this.setBuildingOptions, this._buildCategorySelection, this._buildTypeSelection)
    }

    // Close down the component (and return to top-level sidebar display)
    handleClose = () => {
        this._audio.quickPlay("ting03");
        this.setOpen(false);                // For Sidebar
        this.setExtended(false);            // For self
        this._buildingSelection = null;     // Reset building selection if player closes build menu
    }

    // If the actual building is selected, keep the building options but deselect current building and change mouse context
    handleCancelBuilding = () => {
        this._audio.quickPlay("ting03");
        this.setBuildingSelection(null);
        this.setMouseContext("inspect");
        this._optionButtons.forEach((button) => {
            button.setSelected(false);
        })
    }

    // If build type is selected, clear individual building options and remove type selection
    handleCancelType = () => {
        this._audio.quickPlay("ting03");
        this.setBuildingOptions([]);
        this.setBuildTypeSelection("");
    }

    // If only the category is selected, clear the type options and remove category selection
    handleCancelCategory = () => {
        this._audio.quickPlay("ting03");
        this.setBuildCategorySelection("");
        this.setBuildTypeOptions([]);
    }

    // Goes back one level of options, either from the buildings themselves, or the building types (keeping details area extended)
    handleBack = () => {
        this._audio.quickPlay("ting03");
        if (this._buildingSelection) {
            this.handleCancelBuilding();
        } else if (this._buildTypeSelection) {
            this.handleCancelType();
        } else if (this._buildCategorySelection) {
            this.handleCancelCategory();
        }
    }

    setExtended = (extended: boolean) => {
        this._isExtended = extended;
        this._buildCategorySelection = "";  // Reset default values whenever the menu is opened/closed
        this._buildTypeSelection = "";
        this._buildTypeOptions = [];
        this._buildingOptions = [];
        this._buildingSelection = null;     // Reset building selection if player closes build menu
    }

    setBuildCategorySelection = (value: string) => {
        this._buildCategorySelection = value;
    }

    setBuildTypeSelection = (value: string) => {
        this._buildTypeSelection = value;
    }

    // Setter that is passed to the building TYPES server function
    setBuildTypeOptions = (options: string[]) => {
        this._buildTypeOptions = options;
        this.populateTypeOptions(options);  // Create the buttons when the types are fetched from the backend
    }

    // Setter that is passed to the fetcher for the actual building options
    setBuildingOptions = (options: ModuleInfo[] | ConnectorInfo[]) =>  {
        this._buildingOptions = options;
        this.populateBuildingOptions(options);
    }

    setBuildingSelection = (value: ModuleInfo | ConnectorInfo | null) => {
        // De-select all build chips whenever a new selection is made
        this._optionButtons.forEach((chip) => {
            chip.setSelected(false);
        })
        this._buildingSelection = value;
    }

    showBuildingOptions = (p5: P5) => {
        p5.textSize(22);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text("Inspect", this._x + (this._width / 2), this._yExtended + 64);
        p5.text(`${this._buildTypeSelection} ${this._buildCategorySelection}:`, this._x + (this._width / 2), this._yExtended + 88);
        this._backButton.render(p5);  // Render back button to return to building categories menu
        // Render individual building options:
        this._optionButtons.forEach((button) => {
            button.render(p5);
        })
        p5.textAlign(p5.CENTER, p5.CENTER);
        // TODO: Add rules for pagination if list length exceeds 4 items
    }

    showTypeOptions = (p5: P5) => {
        p5.textSize(22);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text(`Select ${this._buildCategorySelection.slice(0, -1)} type:`, this._x + (this._width / 2), this._yExtended + 64);
        this._backButton.render(p5);
        this._typeButtons.forEach((button) => {
            button.render(p5);
        })
        p5.textAlign(p5.CENTER, p5.CENTER);
    }

    showCategoryOptions = (p5: P5) => {
        p5.textSize(22);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text("Select Building Category", this._x + (this._width / 2), this._yExtended + 64);
        this._categoryButtons.forEach((button) => {
            button.render(p5);
        })
        p5.textAlign(p5.CENTER, p5.CENTER);
    }

    // INSPECT DISPLAY CONTROLS

    setInspectData = (data: Block | Colonist | Connector | Module | null) => {
        this._inspectDisplay.updateSelection(data);
        if (data) {
            this._inspectData = true;
        } else {
            this._inspectData = false;
        }
    }

    // RENDERING ZONE

    renderMinimap = (p5: P5) => {
        this._minimap.render(p5);
    }

    renderInspectDisplay = (p5: P5) => {
        this._inspectDisplay.render(p5);
    }

    render = (p5: P5) => {
        p5.fill(constants.BLUEGREEN_DARK);
        p5.strokeWeight(2);
        p5.stroke(constants.ALMOST_BLACK);
        if (this._isExtended) { // If building option is selected from sidebar menu, expand the details area
            p5.rect(this._x, this._yExtended, this._width, this._extendedHeight, 8, 8, 8, 8);
            // If type is selected show building options; else show type options; else show category options
            if (this._buildTypeSelection) {
                this.showBuildingOptions(p5);
            } else if (this._buildCategorySelection) {
                this.showTypeOptions(p5);
            } else {
                this.showCategoryOptions(p5);
            }
        } else {    // If Details Area is not extended, show it at normal height and display either Minimap or Inspect Display
            p5.rect(this._x, this._y, this._width, this._normalHeight, 8, 8, 8, 8);
            if (this._inspectData) {
                this.renderInspectDisplay(p5);
            } else {
                this.renderMinimap(p5);
            }
        }
    }
}