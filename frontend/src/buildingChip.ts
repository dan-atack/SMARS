// The Building Chip is a specialized button that displays basic information about a prospective building in the sidebar
import P5 from "p5";
import Button from "./button";
import { constants } from "./constants";

// Rudimentary definition of what shape the building data object will take:
type BuildingData = {
    name: string
}

export default class BuildingChip extends Button {
    // Building Chip types:
    buildingData: BuildingData;

    constructor(p5: P5, buildingData: BuildingData, x: number, y: number) {
        super(p5, buildingData.name, x, y, () => console.log("they called him space man"), constants.SIDEBAR_WIDTH, 88, constants.EGGSHELL, constants.ALMOST_BLACK, 20);
        this.buildingData = buildingData;
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
        p5.text(this.buildingData.name, this._x + 12, this._y + this._height / 4);
    }
    
}