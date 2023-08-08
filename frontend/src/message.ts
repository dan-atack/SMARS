// The Message class is used to display short in-game popups to provide information to the player. It is controlled by the Notifications class
import P5 from "p5";
import { constants } from "./constants";
import { Coords } from "./connector";

export default class Message {
    // Message class types
    _text: string;
    _colour: [number, number, number];      // This will be a list of RGB values after recieving a string argument to the constructor
    _duration: number;      // Number of frames
    _coords: Coords;        // Either the Notification class's banner default, or the mouse position of a click event
    _width: number;         // Given in terms of pixels; will be determined by the constructor based on the length and position of the message
    _height: number;        // Given in terms of pixels too
    _fontSize: number;      // Determined by text length and position
    _timeRemaining: number; // Initially the same as duration; counts down when the message is rendered

    constructor (text: string, colour: string, duration: number, coords: Coords, textSize?: number) {
        this._text = text;
        const textlines = this._text.split("\n").length;
        this._colour = this.convertColourStringToRGB(colour);
        this._duration = duration;
        this._coords = coords;
        // Ensure coords are not too far to the side in case of mouse click responses
        if (this._coords.x < constants.BLOCK_WIDTH * 5) this._coords.x = constants.BLOCK_WIDTH * 5;
        if (this._coords.x > (constants.SCREEN_WIDTH - constants.SIDEBAR_WIDTH - constants.BLOCK_WIDTH * 5)) this._coords.x = constants.SCREEN_WIDTH - constants.SIDEBAR_WIDTH - constants.BLOCK_WIDTH * 5;
        if (this._coords.y < 64) this._coords.y = 64;
        this._fontSize = textSize || 20;                // Default value for basic messages is 20 if no other value is provided
        this._width = Math.min(text.length * (this._fontSize / 3) + 24, 360);
        this._height = this._fontSize * textlines + 16;
        console.log(this._height);
        this._timeRemaining = duration;     // Time remaining will begin counting down when the message is rendered
    }

    convertColourStringToRGB = (colour: string) => {
        type RGB = [number, number, number];
        switch (colour) {
            case "red":
                const red: RGB =  [150, 0, 0];
                return red;
            case "green":
                const green: RGB = [0, 200, 50];
                return green;
            case "blue":
                const blue: RGB = [0, 0, 200];
                return blue;
            default:
                const white: RGB = [255, 255, 255];
                return white;
        }
    }

    render = (p5: P5) => {
        const x = this._coords.x - this._width / 2;
        const y = this._coords.y - this._height / 2;       // For convenience
        p5.fill(...this._colour, 150);
        p5.stroke(constants.ALMOST_BLACK);
        p5.strokeWeight(1);
        p5.rect(x, y, this._width, this._height, 16, 16, 16, 16);
        p5.fill(constants.EGGSHELL);
        p5.textSize(this._fontSize);
        p5.text(this._text, this._coords.x, this._coords.y);
        // Advance countdown for message removal with every frame rendered
        if (this._timeRemaining > 0) {
            this._timeRemaining--;
        }
    }

}