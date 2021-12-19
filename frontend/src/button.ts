import P5 from "p5";
import { constants } from "./constants";

export default class Button {
    // Define types for button attributes:
    _p5: P5;
    _label: string;
    _x: number;
    _y: number;
    _width: number;
    _height: number;
    handler: () => void;

    constructor(p5: P5, label:string, x:number, y:number, handler: () => void, w:number=256, h:number=128) {
        this._p5 = p5;
        this._label = label;
        this._x = x;
        this._y = y;
        this._width = w;
        this._height = h;
        this.handler = handler;
    }

    render = () => {
        const p5 = this._p5;
        p5.fill(constants.EGGSHELL);
        p5.rect(this._x, this._y, this._width, this._height, 8, 8, 8, 8);
        p5.textSize(36);
        p5.textStyle(p5.BOLD);
        p5.fill("black");
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

}