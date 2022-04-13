// The Load Option component is a specialized button that displays additional information about a saved game file
import P5 from "p5";
import Button from "./button";
import { constants } from "./constants";
import { SaveSummary } from "./loadGame";

export default class LoadOption extends Button {
    // Save Summary Types:
    _saveInfo: SaveSummary;
    setSaveSelection: (saveSummary: SaveSummary) => void;
    // TODO: Add a setter to interact with the Load Game screen's field for the current save data thing

    constructor(p5: P5, saveInfo: SaveSummary, x: number, y: number, w: number, h: number, setSaveSelection: (saveSummary: SaveSummary) => void) {
        super(p5, saveInfo.game_name, x, y, () => console.log("Exception: load option click handler is not working."), w, h, constants.EGGSHELL, constants.ALMOST_BLACK, 20);
        this.setSaveSelection = setSaveSelection;
        this._saveInfo = saveInfo;
        this._width = w;
        this._height = h;
    }

    handleClick = (mouseX: number, mouseY: number) => {
        const xMatch = mouseX >= this._x && mouseX < this._x + this._width;
        const yMatch = mouseY >= this._y && mouseY < this._y + this._height;
        if (xMatch && yMatch) {
            this.setSelected(true);
            this.setSaveSelection(this._saveInfo);
        }
    };

    getTerranDate = () => {
        const str = this._saveInfo.timestamp.toString().slice(0, 16).split("T").join(" - ");
        return str;
    }

    getSmartianTime = () => {
        const min = this._saveInfo.game_time.minute;
        const hr = this._saveInfo.game_time.hour;
        const cy = this._saveInfo.game_time.cycle;
        const sol = this._saveInfo.game_time.sol;
        const yr = this._saveInfo.game_time.year;
        if (min > 10) {
            return `${hr}:${min} ${cy} - Day ${sol}, Year ${yr}`;
        } else {
            return `${hr}:0${min} ${cy} - Day ${sol}, Year ${yr}`;
        }
    }

    render = () => {
        const p5 = this._p5;
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
        p5.text(this._saveInfo.game_name, this._x + 12, this._y + this._height / 4);
        p5.text(this.getTerranDate(), this._x + 280, this._y + this._height / 4);
        p5.fill(constants.GREEN_TERMINAL);
        p5.textSize(18);
        p5.text(`Smartian Date: ${this.getSmartianTime()}`, this._x + 12, this._y + this._height * 5 / 6);
    }

}