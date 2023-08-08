// The Message class is used to display short in-game popups to provide information to the player. It is controlled by the Notifications class
import P5 from "p5";
import { constants } from "./constants";
import { Coords } from "./connector";

export default class Message {
    // Message class types
    _text: string;
    _colour: string;
    _duration: number;      // Number of frames
    _coords: Coords;        // Either the Notification class's banner default, or the mouse position of a click event

    constructor (text: string, colour: string, duration: number, coords: Coords) {
        this._text = text;
        this._colour = colour;
        this._duration = duration;
        this._coords = coords;
    }
}