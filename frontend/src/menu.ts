import P5 from "p5";
import Screen from "./screen";
import Button from "./button";

export default class Menu extends Screen {
    // Define types new to Menu class:
    _buttons: Array<Button>;
    _color: string


    constructor(p5: P5, buttons: Array<Button>, color: string) {
        super(p5);
        this._buttons = buttons;
        this._color = color;
    }

    render = () => {
        const p5 = this._p5;
        p5.background(this._color);
        this._buttons.forEach((button) => {
            button.render();
        })
    }

    // Not the most elegant, but menus can afford to ask each of their buttons if they are clicked like this:
    handleClicks = (mouseX: number, mouseY: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        })
    } 

}