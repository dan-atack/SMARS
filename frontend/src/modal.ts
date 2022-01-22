// The modal is an in-game message that pauses the game for the player to read and sometimes make a decision
import P5 from "p5";
import Button from "./button";
import { constants, EventData, randomEvents, scheduledEvents } from "./constants";

export default class Modal {
    _p5: P5;
    _random: boolean;
    _eventId: number;
    _eventData: EventData;
    _title: string;
    _text: string;
    _width: number;
    _height: number;
    _xPosition: number;
    _yPosition: number;
    _buttonWidth: number;
    _buttonX: number;
    _buttonY: number;
    _buttons: Button[];
    _resume: () => void;

    constructor(p5: P5, resume: () => void, random: boolean, id: number) {
        this._p5 = p5;
        this._resume = resume;
        this._random = random;
        this._eventId = id;
        if (this._random) {
            this._eventData = randomEvents[this._eventId];
        } else {
            this._eventData = scheduledEvents[this._eventId];
        }
        this._title = this._eventData.title;
        this._text = this._eventData.text;
        this._width = constants.SCREEN_WIDTH / 2;
        this._height = constants.SCREEN_HEIGHT / 2;
        this._xPosition = constants.SCREEN_WIDTH / 4;
        this._yPosition = constants.SCREEN_HEIGHT / 4;
        this._buttonWidth = 128;
        this._buttonX = this._xPosition + (this._width / 2) - (this._buttonWidth / 2);
        this._buttonY = this._yPosition + this._height * 3 / 4;
        this._buttons = [];
        const button = new Button(this._p5, "Sheeeee", this._buttonX, this._buttonY, this._resume, this._buttonWidth, 48, constants.YELLOW_BG, constants.EGGSHELL, 24);
        this._buttons.push(button);
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        })
    }

    render = () => {
        const p5 = this._p5;
        p5.fill(constants.EGGSHELL);
        p5.strokeWeight(2);
        p5.stroke(constants.ALMOST_BLACK);
        p5.rect(this._xPosition, this._yPosition, this._width, this._height);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.fill(constants.BLUE_ICE);
        p5.text(this._title, this._xPosition + this._width / 2, this._yPosition + this._height / 8);
        p5.textSize(18);
        p5.text(this._text, this._xPosition + this._width / 2, this._yPosition + this._height / 2); // TODO: limit text box size
        this._buttons.forEach((button) => {
            button.render();
        })
    }

}