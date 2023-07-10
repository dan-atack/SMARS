// The modal is an in-game message that pauses the game for the player to read and sometimes make a decision
import P5 from "p5";
import Button from "./button";
import { constants } from "./constants";

// NOTE: If updating either of these type definitions, make sure to copy the update/s to the randomEventFunctions.ts file in the backend
export type Resolution = {
    text: string,                   // Words on the button
    outcomes: [string, number | string, number?][]    // A tuple consisting of a type (string for Engine's switch case) a value (string or a number), and optionally, an ID number for a colonist or module as the third value
}

export type EventData = {
    id: string,                 // Modals are identified with a unique string ID to make them easier to sort through
    title: string,
    text: string,
    resolutions: Resolution[]
 }

export default class Modal {
    _p5: P5;
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

    constructor(p5: P5, closeModal: (resolution: number) => void, eventData: EventData) {
        this._p5 = p5;
        this._closeModal = closeModal;
        this._eventData = eventData;
        this._title = this._eventData.title;
        this._text = this._eventData.text;
        this._resolutions = this._eventData.resolutions;
        this._width = constants.SCREEN_WIDTH / 2;
        this._height = constants.SCREEN_HEIGHT / 2;
        this._xPosition = constants.WORLD_VIEW_WIDTH / 4;
        this._yPosition = constants.SCREEN_HEIGHT / 4;
        this._buttonWidth = 256; // Buttons are always wide
        // Buttons' horizontal start position = middle for one resolution, or off to the right if there are two options
        this._buttonX = this._xPosition + (this._width / (1 + this._resolutions.length)) - (this._buttonWidth / 2 + this._resolutions.length * 18);
        console.log(this._buttonX);
        // TODO: Adjust button Y positions if there are more than 2 options available
        this._buttonY = this._yPosition + this._height * 4 / 5;
        this._buttons = [];
        // Create one button per resolution and have the handler pass the index number of the button to the resolveModal method
        this._resolutions.forEach((res, idx) => {
            const handler = () => this.resolveModal(idx);
            const b = new Button(res.text, this._buttonX + idx * (this._buttonWidth + 16), this._buttonY, handler, this._buttonWidth, 48, constants.GREEN_TERMINAL, constants.GREEN_DARK, 18);
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
        p5.textSize(28);
        p5.text(this._title, this._xPosition + this._width / 2, this._yPosition + this._height / 8);
        p5.textSize(18);
        p5.textAlign()
        p5.text(this._text, this._xPosition + this._width / 2, this._yPosition + this._height / 2); // TODO: limit text box size
        this._buttons.forEach((button) => {
            button.render(p5);
        })
    }

}