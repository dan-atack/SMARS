// The modal is an in-game message that pauses the game for the player to read and sometimes make a decision
import P5 from "p5";
import Button from "./button";
import { constants } from "./constants";

export type Resolution = {
    text: string,                   // Words on the button
    outcomes: [string, number | string][]    // A tuple consisting of a type (the the Engine's switch case) and a value (which can be either a string or a number)
}

export type EventData = {
    id: number,
    title: string,
    text: string,
    resolutions: Resolution[]
 }

export default class Modal {
    _p5: P5;
    _random: boolean;           // To keep track of whether this was a scheduled event or a random one
    _eventData: EventData;      // All event data is now passed directly to the constructor; no lookups to the constants file
    _title: string;
    _text: string;
    _resolutions: Resolution[];
    _width: number;
    _height: number;
    _xPosition: number;
    _yPosition: number;
    _buttonWidth: number;
    _buttonX: number;
    _buttonY: number;
    _buttons: Button[];
    _closeModal: (resolution: number) => void;        // Engine-level closer function - also resolves the modals various outcomes

    constructor(p5: P5, closeModal: (resolution: number) => void, random: boolean, eventData: EventData) {
        this._p5 = p5;
        this._closeModal = closeModal;
        this._random = random;
        this._eventData = eventData;
        this._title = this._eventData.title;
        this._text = this._eventData.text;
        this._resolutions = this._eventData.resolutions;
        this._width = constants.SCREEN_WIDTH / 2;
        this._height = constants.SCREEN_HEIGHT / 2;
        this._xPosition = constants.SCREEN_WIDTH / 4;
        this._yPosition = constants.SCREEN_HEIGHT / 4;
        this._resolutions[0].text.length <= 13 ? this._buttonWidth = 128 : this._buttonWidth = 256; // Button width is conditional
        this._buttonX = this._xPosition + (this._width / (1 + this._resolutions.length)) - (this._buttonWidth / (1 + this._resolutions.length));
        this._buttonY = this._yPosition + this._height * 3 / 4;
        this._buttons = [];
        // Create one button per resolution and have the handler pass the index number of the button to the resolveModal method
        this._resolutions.forEach((res, idx) => {
            const handler = () => this.resolveModal(idx);
            const b = new Button(this._p5, res.text, this._buttonX + idx * (this._buttonWidth + 16), this._buttonY, handler, this._buttonWidth, 48, constants.GREEN_TERMINAL, constants.GREEN_DARK, 18);
            this._buttons.push(b);
        })
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        })
    }

    resolveModal = (idx: number) => {
        this._closeModal(idx);
    }

    render = () => {
        const p5 = this._p5;
        p5.fill(constants.EGGSHELL);
        p5.strokeWeight(2);
        p5.stroke(constants.ALMOST_BLACK);
        p5.rect(this._xPosition, this._yPosition, this._width, this._height);
        p5.fill(constants.BLUEGREEN_DARK)
        p5.rect(this._xPosition + 4, this._yPosition + 4, this._width - 8, this._height - 8);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.fill(constants.BLUE_ICE);
        p5.text(this._title, this._xPosition + this._width / 2, this._yPosition + this._height / 8);
        p5.textSize(16);
        p5.textAlign()
        p5.text(this._text, this._xPosition + this._width / 2, this._yPosition + this._height / 2); // TODO: limit text box size
        this._buttons.forEach((button) => {
            button.render();
        })
    }

}