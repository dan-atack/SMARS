// The Building Chip is a specialized button that displays basic information about a prospective building in the sidebar
import P5 from "p5";
import Button from "./button";
import { ModuleInfo, ConnectorInfo } from "./server_functions";
import { constants } from "./constants";

export default class BuildingChip extends Button {
    // Building Chip types:
    buildingData: ModuleInfo | ConnectorInfo;
    _maintenanceAlign: number;  // X location for maintenance cost info bullet points
    _maintenanceHeight: number; // Y location start for maintenance cost info bullet points
    setMouseContext: (value: string) => void;
    setBuildingSelection: (value: ModuleInfo | ConnectorInfo | null) => void;

    constructor(buildingData: ModuleInfo | ConnectorInfo, x: number, y: number, setMouseContext: (value: string) => void, setBuildingSelection: (value: ModuleInfo | ConnectorInfo | null) => void) {
        super(buildingData.name, x + 8, y, () => console.log("Exception: build chip click handler is not working."), constants.SIDEBAR_WIDTH - 24, 88, constants.EGGSHELL, constants.ALMOST_BLACK, 20);    // Handler here is a dud since the build chip uses the set mouse context function as its handler and this requires a string argument (instead of no argument)
        this.buildingData = buildingData;
        this._maintenanceAlign = this._x + this._width * 5 / 8;
        this._maintenanceHeight = this._y + this._height / 2 + 16;
        this.setMouseContext = setMouseContext;
        this.setBuildingSelection = setBuildingSelection;
    }

    // Determines if the new building is a module or a connector:
    isModule (building: ModuleInfo | ConnectorInfo): building is ModuleInfo {
        return (building as ModuleInfo).pressurized !== undefined
    }

    // Based on the ancestral button class, but with a twist: 
    handleClick = (mouseX: number, mouseY: number) => {
        // Establish that click is within button's borders:
        const xMatch = mouseX >= this._x && mouseX < this._x + this._width;
        const yMatch = mouseY >= this._y && mouseY < this._y + this._height;
        if (xMatch && yMatch) { // TODO: When more detailed building data is available, add a case for a two-part placement label
            // If building is already selected, clicking its chip again deselects it:
            if (this._selected) {
                this.setBuildingSelection(null);
                this.setMouseContext("inspect");
                this.setSelected(false);
            } else {        // Otherwise set this building as the selection and set mouse context
                this.setBuildingSelection(this.buildingData);
                this.setSelected(true);
                // LAST - Set mouse context based on whether building is a module or connector
                if (this.isModule(this.buildingData)) {
                    this.setMouseContext("placeModule");
                } else {
                    this.setMouseContext("connectorStart")
                }
            }
        }
    }

    // Converts the cost into a string with dollar sign and decimal place
    getCostString = () => {
        let cost = this.buildingData.buildCosts[0][1].toString();   // Money always has to be the first type of cost!
        cost = cost.slice(0, cost.length - 2) + "." + cost.slice(cost.length - 2, cost.length);
        if (this.buildingData.type === "conduit" || this.buildingData.type === "transport") {
            cost = `$${cost} per meter`;
        } else {
            cost = `$${cost}`;
        }
        return cost;
    }

    render = (p5: P5) => {
        p5.strokeWeight(4);
        // Render borders thicker and in font colour if button is 'selected':
        if (this._selected) {
            p5.strokeWeight(6);
            p5.stroke(this._color);
        }
        p5.fill(this._bgColor);    // Button BG color
        p5.rect(this._x, this._y, this._width, this._height, 8, 8, 8, 8);
        p5.strokeWeight(3); // Reset stroke weight before button text is rendered
        p5.stroke(0);
        p5.textSize(this._fontSize);
        p5.textStyle(p5.BOLD);
        p5.fill(this._color);   // Text color
        p5.textAlign(p5.LEFT, p5.CENTER);
        // Building Chip label text is slightly above center line, to make space for other info:
        p5.text(this.buildingData.name, this._x + 12, this._y + this._height / 4);
        p5.textSize(this._fontSize - 4);
        p5.fill(constants.GREEN_TERMINAL);
        const cost = this.getCostString();
        p5.text(cost, this._x + 12, this._y + this._height * 3 / 4);
        // Maintenance cost info displayed on the right side, halfway down
        p5.fill(constants.YELLOW_TEXT);
        p5.textSize(12);
        // Show maintenance costs if the building has any costs listed, or if it is a pressurized module
        const nonOxygenCosts = this.buildingData.maintenanceCosts.length;
        const pressurized = this.isModule(this.buildingData) && this.buildingData.pressurized;
        if (nonOxygenCosts > 0 || pressurized) {
            p5.text("Maintenance:", this._maintenanceAlign, this._maintenanceHeight - 16);
            this.buildingData.maintenanceCosts.forEach((res, idx) => {
                p5.fill(constants.YELLOW_TEXT);
                p5.text(`* ${res[1]} ${res[0]}`, this._maintenanceAlign, this._maintenanceHeight + idx * 16);
            });
            if (pressurized && this.isModule(this.buildingData)) {
                p5.fill(constants.BLUE_ICE);
                p5.text(`* ${this.buildingData.width * (this.buildingData.height)} Air`, this._maintenanceAlign, this._maintenanceHeight + nonOxygenCosts * 16);
            }
        } else {
            p5.text("No Maintenance", this._maintenanceAlign, this._maintenanceHeight - 16);
            p5.text("Costs", this._maintenanceAlign + 32, this._maintenanceHeight);
        }
    }
    
}