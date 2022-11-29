// Sub-component for the Population View page, to display info for individual Colonists
import P5 from "p5";
import Button from "./button";
import Colonist from "./colonist";
import { constants } from "./constants";

export default class PopulationRow {
    // Population Row types
    _colonist: Colonist;                // Store a pointer to the actual colonist, rather than taking a bunch of individual stats
    _width: number;
    _height: number;
    _colWidths: number[]                // List of column widths, in pixels
    _colEdges: number[];                // The left edge of each column
    _margin: number;
    _buttonWidth: number;
    _buttonHeight: number;
    _buttonX: number;
    _buttonY: number;
    _x: number;
    _y: number;
    _buttons: Button[];
    _setExplorer: (id: number) => void;
    _setFarmer: (id: number) => void;
    _setMiner: (id: number) => void;
    // TODO: Add handler functions for other roles

    // X = Left edge; Idx = vertical position increment, rowWidths = table formatting determined in populationView component
    constructor(colonist: Colonist, x: number, idx: number, rowWidths: number[], setExplorer: (id: number) => void, setFarmer: (id: number) => void, setMiner: (id: number) => void) {
        this._colonist = colonist;
        this._width = constants.SCREEN_WIDTH - 160;
        this._height = 64;
        this._colWidths = rowWidths;
        this._colEdges = [];
        let cur = x;    // Derive column edge positions from widths
        this._colWidths.forEach((col) => {
            this._colEdges.push(cur);   // Ensure each column header is at the middle of the column
            cur += col;
        })
        this._margin = 8;
        this._x = x;
        this._y = 160 + idx * (this._height + this._margin);
        this._buttonWidth = 64;
        this._buttonHeight = 32;
        this._buttonX = this._colEdges[3] + this._margin;
        this._buttonY = this._y + this._margin * 2;
        this._buttons = [];
        this._setExplorer = setExplorer;
        this._setFarmer = setFarmer;
        this._setMiner = setMiner;
        const exp = new Button("Explorer", this._buttonX, this._buttonY, this.handleExplorer, this._buttonWidth, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 14);
        this._buttons.push(exp);
        const farm = new Button("Farmer", this._buttonX + (this._buttonWidth + this._margin), this._buttonY, this.handleFarmer, this._buttonWidth, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 14);
        this._buttons.push(farm);
        const mine = new Button("Miner", this._buttonX + (this._buttonWidth + this._margin) * 2, this._buttonY, this.handleMiner, this._buttonWidth, this._buttonHeight, constants.YELLOW_TEXT, constants.YELLOW_BG, 14);
        this._buttons.push(mine);
    }

    // SECTION 1: BUTTON HANDLERS

    // Top-level click handler
    handleClicks = (x: number, y: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(x, y);
        })
    }

    // Note: to enable proper button selection highlighting, button handlers must appear in same order in which buttons are created
    handleExplorer = () => {
        this._setExplorer(this._colonist._data._id);
        this.setRoleButtonSelection(0);
    }

    handleFarmer = () => {
        this._setFarmer(this._colonist._data._id);
        this.setRoleButtonSelection(1);
    }

    handleMiner = () => {
        this._setMiner(this._colonist._data._id);
        this.setRoleButtonSelection(2);
    }

    setRoleButtonSelection = (buttonIndex: number) => {
        this._buttons.forEach((btn) => {
            btn.setSelected(false);
        });
        this._buttons[buttonIndex].setSelected(true);

    }

    render = (p5: P5) => {
        p5.stroke(constants.GREEN_TERMINAL);
        p5.strokeWeight(1);
        // ID
        p5.fill(constants.GREEN_DARKISH);
        p5.rect(this._colEdges[0], this._y, this._colWidths[0], this._height);
        // Name
        p5.fill(constants.GREEN_DARK);
        p5.rect(this._colEdges[1], this._y, this._colWidths[1], this._height);
        // Current Role
        p5.fill(constants.GREEN_DARKER);
        p5.rect(this._colEdges[2], this._y, this._colWidths[2], this._height);
        // Role Options
        p5.fill(constants.GREEN_DARKEST);
        p5.rect(this._colEdges[3], this._y, this._colWidths[3], this._height);
        p5.stroke(constants.ALMOST_BLACK);
        p5.fill(constants.GREEN_TERMINAL);
        p5.textSize(18);
        // Text all at once after the boxes are rendered
        p5.text(this._colonist._data._name, this._colEdges[0] + this._colWidths[0] / 2, this._y + this._height / 2);
        p5.text(this._colonist._data._morale, this._colEdges[1] + this._colWidths[1] / 2, this._y + this._height / 2);
        p5.text(this._colonist._data._role[0], this._colEdges[2] + this._colWidths[2] / 2, this._y + this._height / 2);
        this._buttons.forEach((btn) => {
            btn.render(p5);
        })
    }

}