import P5 from "p5";
import { constants } from "./constants";

export default class Button {
    // Define types for button attributes:
    _label: string;
    _x: number;
    _y: number;
    _width: number; // Optional aesthetic overrides
    _height: number;
    _color: string;
    _bgColor: string;
    _fontSize: number;
    _selected: boolean; // Use to add an extra thick barrier
    handler: () => void;
 

    constructor(label:string, x:number, y:number, handler: () => void, w:number=256, h:number=128, color:string="black", bgColor=constants.EGGSHELL, fontSize:number=36) {
        this._label = label;
        this._x = x;
        this._y = y;
        this._width = w;
        this._height = h;
        this._color = color;
        this._bgColor = bgColor;
        this._fontSize = fontSize;
        this._selected = false; // Not set by the constructor
        this.handler = handler;
    }

    render = (p5: P5) => {
        p5.strokeWeight(4);
        // Render borders thicker and in font colour if button is 'selected':
        if (this._selected) {
            p5.strokeWeight(8);
            p5.stroke(this._color);
        }
        p5.fill(this._bgColor);    // Button BG color
        p5.rect(this._x, this._y, this._width, this._height, 8, 8, 8, 8);
        p5.strokeWeight(2); // Reset stroke weight before button text is rendered
        p5.stroke(0);
        p5.textSize(this._fontSize);
        p5.textStyle(p5.BOLD);
        p5.fill(this._color);   // Text color
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text(this._label, this._x + this._width / 2, this._y + this._height / 2);
    }
    
    handleClick = (mouseX: number, mouseY: number) => {
        // Establish that click is within button's borders:
        const xMatch = mouseX >= this._x && mouseX < this._x + this._width;
        const yMatch = mouseY >= this._y && mouseY < this._y + this._height;
        if (xMatch && yMatch) {
            this.handler();
        }
    }

    setSelected = (selected: boolean) => {
        this._selected = selected;
    }

}