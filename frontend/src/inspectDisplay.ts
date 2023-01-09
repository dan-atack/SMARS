// The Inspect Display component sits in the Details Area and displays data about whatever entity has been selected by the Engine's Inspect tool
import P5 from "p5";
import Block from "./block";
import Colonist from "./colonist";
import Connector from "./connector";
import { constants } from "./constants";
import Module from "./module";
import Button from "./button";

export default class InspectDisplay {
    // Inspect Display types
    _leftEdge: number;
    _top: number;
    _width: number;
    _height: number;
    _center: number;        // Derived from the X position plus width over two; for convenience in positioning text elements
    _left1Q: number;        // Positions that are 1/4 and 3/4 of the way from the left edge, for left-aligned grid columns
    _left3Q: number;
    _textAlignleft: number;     // Horizontal Position for left-aligned text
    _headers: number[];         // Vertical positions for rows of data
    _currentSelection: Block | Colonist | Connector | Module | null;
    _selectionName: string;     // Quick way for the renderer to know what type of object is selected
    _moreInfoButton: Button     // Alternates between primary/secondary view for module info displays

    constructor(x: number, y: number) {
        this._leftEdge = x;
        this._top = y;
        this._width = constants.SCREEN_WIDTH - x;
        this._height = constants.SCREEN_HEIGHT - y;
        this._center = this._leftEdge + this._width / 2;
        this._left1Q = this._leftEdge + this._width / 4;
        this._left3Q = this._leftEdge + this._width * 3 / 4;
        this._textAlignleft = this._leftEdge + 12;
        this._headers = [];
        for (let i = 0; i <= 8; i++) {
            this._headers.push(this._top + 24 + i * 32);
        }
        this._currentSelection = null;
        this._selectionName = "";
        this._moreInfoButton = new Button("MORE\nINFO", this._center, this._headers[2] - 16, this.handleProductionInfo, 128, 64, constants.YELLOW_TEXT, constants.YELLOW_BG, 18);
    }

    // SECTION 1 - GENERAL UPDATE AND TYPE IDENTIFICATION METHODS

    updateSelection = (data: Block | Colonist | Connector | Module | null) => {
        this._currentSelection = data;
        if (data) {
            console.log(this._currentSelection);
            if (this.isBlock(data)) this._selectionName = "block";
            if (this.isColonist(data)) this._selectionName = "colonist";
            if (this.isConnector(data)) this._selectionName = "connector";
            if (this.isModule(data)) this._selectionName = "module";
        } else {
            this._selectionName = "";
        }
    }

    isColonist (obj: Block | Colonist | Connector | Module): obj is Colonist {
        return (obj as Colonist).drawHead !== undefined;
    }

    isConnector (obj: Block | Colonist | Connector | Module): obj is Connector {
        return (obj as Connector)._segments !== undefined;
    }

    isModule (obj: Block | Colonist | Connector | Module): obj is Module {
        return (obj as Module).addResource !== undefined;
    }

    isBlock (obj: Block | Colonist | Connector | Module): obj is Block {
        return (obj as Block)._blockData !== undefined;
    }

    // SECTION 2 - BUTTON HANDLERS

    // Toggles between
    handleProductionInfo = () => {
        if (this._selectionName === "module") {
            this._selectionName = "production-module";
        } else {
            this._selectionName = "module";
        }
    }

    // Only allow clicks when the button is 
    handleClicks = (mouseX: number, mouseY: number) => {
        // TODO: Add buttons into a list if more are added for non-module templates
        this._moreInfoButton.handleClick(mouseX, mouseY);
    }

    // SECTION 3 - CLASS-SPECIFIC DISPLAY TEMPLATES

    displayColonistData = (p5: P5) => {
        if (this._currentSelection && this.isColonist(this._currentSelection)) {
            const col = this._currentSelection;   // For convenience
            const morale = col._data._morale;
            const max = col._data._maxMorale;
            const goalString = col._data._currentGoal.split("-").join(" ");
            p5.text(col._data._name, this._center, this._headers[0]);
            p5.textSize(18);
            p5.textAlign(p5.LEFT);
            p5.text(`Current role: ${col._data._role[0] || "none!"}`, this._textAlignleft, this._headers[1]);
            p5.text(`Current goal: ${goalString}`, this._textAlignleft, this._headers[2]);
            p5.text("Morale:", this._textAlignleft, this._headers[3]);
            // Set text colour for morale display
            morale / max > 0.3 ? morale / max > 0.7 ? p5.fill(constants.GREEN_TERMINAL) : p5.fill(constants.YELLOW_TEXT) : p5.fill(constants.RED_ERROR);
            p5.text(`   ${col._data._morale} / ${col._data._maxMorale}`, this._left1Q, this._headers[3]);
            p5.fill(constants.GREEN_TERMINAL);      // Reset text colour
            p5.text("Need Levels:", this._textAlignleft, this._headers[4]);
            p5.textSize(16);
            p5.text("Current", this._left1Q, this._headers[5]);
            p5.text("/  Threshold", this._center, this._headers[5]);
            Object.keys(col._data._needs).forEach((need, idx) => {
                p5.text(need, this._textAlignleft, this._headers[6] + idx * 20);
            });
            Object.values(col._data._needs).forEach((val, idx) => {
                const thresh = Object.values(col._data._needThresholds)[idx];
                if (val < thresh) {
                    p5.fill(constants.GREEN_TERMINAL);
                } else if (val <= thresh + 1) { // Show yellow if Colonist is at, or slightly above the threshold
                    p5.fill(constants.YELLOW_TEXT);
                } else {
                    p5.fill(constants.RED_ERROR);
                }
                p5.text(val, this._left1Q + 24, this._headers[6] + idx * 20);
            });
            p5.fill(constants.GREEN_TERMINAL);
            Object.values(col._data._needThresholds).forEach((val, idx) => {
                p5.text(`/      ${val}`, this._center, this._headers[6] + idx * 20);
            });
        } else {
            p5.fill(constants.RED_ERROR);
            p5.text("Warning: Colonist Data Missing", this._center, this._headers[0]);
        }
    }

    displayConnectorData = (p5: P5) => {
        if (this._currentSelection && this.isConnector(this._currentSelection)) {
            const conn = this._currentSelection;   // For convenience
            p5.text(`${conn._connectorInfo.name} (ID: ${conn._id})`, this._center, this._headers[0]);
            p5.textSize(18);
            p5.textAlign(p5.LEFT);
            p5.text(`Connector Type: ${conn._connectorInfo.type}`, this._textAlignleft, this._headers[1]);
            p5.text(`Orientation: ${conn._orientation}`, this._textAlignleft, this._headers[2]);
            if (conn._orientation === 'vertical') {
                p5.text(`Height: ${conn._bottom - conn._top + 1}`, this._textAlignleft, this._headers[3]);
            } else {
                p5.text(`Length: ${conn._rightEdge - conn._leftEdge + 1}`, this._textAlignleft, this._headers[3]);
            }
            if (conn._connectorInfo.type === "transport") {                 // Transport
                p5.text(`Max occupants: ${conn._connectorInfo.maxFlowRate}`, this._textAlignleft, this._headers[4]);  
            } else {                                                        // Conduit
                p5.text(`Resource: ${conn._connectorInfo.resourcesCarried[0]}`, this._textAlignleft, this._headers[4]);
                p5.text(`Flow rate: ${conn._connectorInfo.maxFlowRate}`, this._textAlignleft, this._headers[5]);
            }
        } else {
            p5.fill(constants.RED_ERROR);
            p5.text("Warning: Connector Data Missing", this._center, this._headers[0]);
        }
    }

    displayModuleData = (p5: P5) => {
        if (this._currentSelection && this.isModule(this._currentSelection)) {
            const mod = this._currentSelection;   // For convenience
            p5.textSize(20);
            p5.text(`${mod._moduleInfo.name} (ID: ${mod._id})`, this._center, this._headers[0]);
            p5.textSize(18);
            p5.textAlign(p5.LEFT);
            if (mod._moduleInfo.pressurized) {
                // If module should be pressurized, ensure that it is, and report in red ink if it is not
                const pressurized = mod._moduleInfo.pressurized && mod._isMaintained;
                if (pressurized) {
                    p5.text("Pressurized", this._textAlignleft, this._headers[1]);
                } else {
                    p5.fill(constants.RED_ERROR);
                    p5.text("Depressurized!", this._textAlignleft, this._headers[1]);
                }
            } else {
                p5.text("Not pressurized", this._textAlignleft, this._headers[1]);
            }
            p5.fill(constants.GREEN_TERMINAL);
            p5.text(`${mod._moduleInfo.crewCapacity ? `Crew: ${mod._crewPresent.length} / ${mod._moduleInfo.crewCapacity}` : "Uncrewed"}`, this._textAlignleft, this._headers[2]);
            p5.text(`Resources:`, this._textAlignleft, this._headers[3]);
            p5.text("Type", this._textAlignleft, this._headers[4]);
            p5.text("/         Quantity", this._left1Q, this._headers[4]);
            p5.text("/  Max", this._left3Q, this._headers[4]);
            const shortageIndices: number[] = [];
            mod._resources.forEach((res, idx) => {
                // Font is green UNLESS: resource is needed for maintenance and is unavailable
                if (mod.getMaintenanceResourceNames().includes(res[0]) && res[1] === 0) {
                    p5.fill(constants.RED_ERROR);
                    shortageIndices.push(idx);
                } else {
                    p5.fill(constants.GREEN_TERMINAL);
                }
                p5.text(res[0], this._textAlignleft, this._headers[5] + idx * 20);
                p5.text((res[1] / 100).toFixed(2), this._center, this._headers[5] + idx * 20);
            });
            mod._moduleInfo.storageCapacity.forEach((res, idx) => {
                if (shortageIndices.includes(idx)) {
                    p5.fill(constants.RED_ERROR);
                } else {
                    p5.fill(constants.GREEN_TERMINAL);
                }
                p5.text(`/  ${(res[1] / 100).toFixed(0)}`, this._left3Q, this._headers[5] + idx * 20);
            });
            p5.fill(constants.GREEN_TERMINAL);  
            // Always show the 'more info' button (not just for production modules)
            this._moreInfoButton._label = "MORE\nINFO";
            this._moreInfoButton.render(p5);
        } else {
            p5.fill(constants.RED_ERROR);
            p5.text("Warning: Module Data Missing", this._center, this._headers[0]);
        }
    }

    // Shows 'page 2' module data - production info breakdown and/or maintenance costs
    displaySecondaryModuleData = (p5: P5) => {
        if (this._currentSelection && this.isModule(this._currentSelection)) {
            const mod = this._currentSelection;
            p5.textSize(20);
            p5.text(`${mod._moduleInfo.name} (ID: ${mod._id})`, this._center, this._headers[0]);
            p5.text("Maintenance Costs:", this._center, this._headers[6]);
            switch (mod._moduleInfo.type) {
                case "Production":
                    p5.text("Production Information", this._center, this._headers[1]);
                    p5.textSize(16);
                    p5.textAlign(p5.LEFT);
                    if (mod._moduleInfo.productionInputs && mod._moduleInfo.productionOutputs) {
                        let inputs = "";
                        let outputs = "";
                        mod._moduleInfo.productionInputs.forEach((input, idx) => {
                            if (idx > 0) inputs += " + ";
                            inputs += (input[1] / 100).toFixed(2);
                            inputs += " ";
                            inputs += input[0];
                        })
                        mod._moduleInfo.productionOutputs.forEach((output, idx) => {
                            if (idx > 0) outputs += " + ";
                            outputs += (output[1] / 100).toFixed(2);
                            outputs += " ";
                            outputs += output[0];
                        })
                        p5.text(`Converts ${inputs}`, this._textAlignleft, this._headers[4]);
                        p5.text(`Into ${outputs}`, this._textAlignleft, this._headers[5]);
                    }
                    break;
                case "Power":
                    if (mod._moduleInfo.productionOutputs !== undefined) {
                        const powerGenerationString = `${(mod._moduleInfo.productionOutputs[0][1] / 100).toFixed(2)} ${mod._moduleInfo.productionOutputs[0][0]}`;
                        p5.text("Power Generation:", this._center, this._headers[1]);
                        p5.textSize(16);
                        p5.textAlign(p5.LEFT);
                        // TODO: Make this more generic to allow for non-solar outputs to be displayed
                        p5.text(`Generates ${powerGenerationString}`, this._textAlignleft, this._headers[4]);
                        p5.text("in full sunlight", this._textAlignleft, this._headers[5]);
                    } else {
                        p5.text("Generates 0 power", this._textAlignleft, this._headers[4]);
                    }
                    break;
            }
            // Show maintenance costs for all modules, starting at header index 7
            const nonOxygenCosts = mod._moduleInfo.maintenanceCosts.length;
            p5.textSize(16);
            p5.fill(constants.YELLOW_TEXT)
            if (nonOxygenCosts > 0) {
                p5.textAlign(p5.LEFT);
                mod._moduleInfo.maintenanceCosts.forEach((res, idx) => {
                    p5.text(`Consumes ${(res[1] / 100).toFixed(2)} ${res[0]} per hour`, this._textAlignleft, this._headers[7 + idx] - idx * 4 - 4);
                })
            } else if (!mod._moduleInfo.pressurized) {
                p5.textAlign(p5.CENTER);
                p5.textSize(18);
                p5.text("None", this._center, this._headers[7]);
            }
            if (mod._moduleInfo.pressurized) {
                const leakage = (mod._moduleInfo.width * mod._moduleInfo.height / 100).toFixed(2);
                p5.textAlign(p5.LEFT);
                p5.text(`Leaks ${leakage} air (oxygen) per hour`, this._textAlignleft, this._headers[7 + nonOxygenCosts] - nonOxygenCosts * 4 - 8);
            }
            // Reset button text before showing it; button will return to regular module info display
            this._moreInfoButton._label = "SHOW\nBASIC INFO"
            this._moreInfoButton.render(p5);
        } else {
            p5.fill(constants.RED_ERROR);
            p5.text("Warning: Module Data Missing", this._center, this._headers[0]);
        }
    }

    displayBlockData = (p5: P5) => {
        if (this._currentSelection && this.isBlock(this._currentSelection)) {
            const block = this._currentSelection;   // For convenience
            p5.text(`Terrain : ${this._currentSelection._blockData.name}`, this._center, this._headers[0]);
            p5.textSize(18);
            p5.textAlign(p5.LEFT);
            p5.text(`Resource type: ${block._blockData.resource}`, this._textAlignleft, this._headers[1]);
            p5.text(`Resource yield: ${block._blockData.yield}`, this._textAlignleft, this._headers[2]);
            p5.text(`${block._currentHp} / ${block._maxHp} HP`, this._textAlignleft, this._headers[3]);
            p5.fill(block._color);
            p5.rect(this._center - 40, this._headers[4], 80, 80);
        } else {
            p5.fill(constants.RED_ERROR);
            p5.text("Warning: Block Data Missing", this._center, this._headers[0]);
        }
    }

    render = (p5: P5) => {
        p5.fill(constants.GREEN_TERMINAL);
        p5.strokeWeight(4);
        p5.stroke(constants.ALMOST_BLACK);
        if (this._currentSelection) {
            switch (this._selectionName) {
                case "block":
                    this.displayBlockData(p5);
                    break;
                case "colonist":
                    this.displayColonistData(p5);
                    break;
                case "connector":
                    this.displayConnectorData(p5);
                    break;
                case "module":
                    this.displayModuleData(p5);
                    break;
                case "production-module":
                    this.displaySecondaryModuleData(p5);
                    break;
                default:
                    p5.fill(constants.RED_ERROR);
                    p5.text("Warning: Inspect Data Missing", this._center, this._headers[0]);
            }
        }
        p5.textAlign(p5.CENTER);    // Reset this after displaying so other text elements don't jump around
    }
}