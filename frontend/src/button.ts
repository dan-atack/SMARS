import P5 from "p5";

export default class Button {
    // Define types for button attributes:
    _p5: P5;
    _x: number;
    _y: number;
    _width: number;
    _height: number;
    handler: () => void;

    constructor(p5: P5, x:number, y:number, handler: () => void) {
        this._p5 = p5;
        this._x = x;
        this._y = y;
        this._width = 256;
        this._height = 128;
        this.handler = handler;
    }

    render = () => {
        const p5 = this._p5;
        p5.fill("19191F");
        p5.rect(this._x, this._y, 256, 128);
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