// The Building Chip is a specialized button that displays basic information about a prospective building in the sidebar
import P5 from "p5";
import Button from "./button";
import { ModuleInfo, ConnectorInfo } from "./server_functions";
import { constants } from "./constants";

export default class BuildingChip extends Button {
    // Building Chip types:
    buildingData: ModuleInfo | ConnectorInfo;
    setMouseContext: (value: string) => void;

    constructor(p5: P5, buildingData: ModuleInfo | ConnectorInfo, x: number, y: number, setMouseContext: (value: string) => void) {
        super(p5, buildingData.name, x + 8, y, () => console.log("Exception: build chip click handler is not working."), constants.SIDEBAR_WIDTH - 24, 88, constants.EGGSHELL, constants.ALMOST_BLACK, 20);    // Handler here is a dud since the build chip uses the set mouse context function as its handler and this requires a string argument (instead of no argument)
        this.buildingData = buildingData;
        this.setMouseContext = setMouseContext;
    }

    // Based on the ancestral button class, but with a twist: 
    handleClick = (mouseX: number, mouseY: number) => {
        // Establish that click is within button's borders:
        const xMatch = mouseX >= this._x && mouseX < this._x + this._width;
        const yMatch = mouseY >= this._y && mouseY < this._y + this._height;
        if (xMatch && yMatch) { // TODO: When more detailed building data is available, add a case for a two-part placement label
            this.setMouseContext("place");
            console.log(this.buildingData.name);
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
        p5.text(this.buildingData.name, this._x + 12, this._y + this._height / 4);
    }
    
}