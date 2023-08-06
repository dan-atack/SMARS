// The Notifications class is the Engine's secretary in charge of handling in-game messages shown to the player
import P5 from "p5";
import { Coords } from "./connector";
import { GameTime } from "./saveGame";

// Message template definition
export type Message = {
    subject: string;        // Subject tags will be fed into a switch case block to determine what type of popup is produced
    smarsTime: GameTime     // To keep track of when a message was created / how old it is
    entityID: number        // To keep track of the subject of a message, when relevant
    text: string;           // The actual content of the message being displayed
}

export default class Notifications {
    // Notifications class types
    _backlog: Message[];                    // Long list used for general message accumulation
    _queue: Message[];                      // Prioritized short-list of messages to be displayed next
    _currentDisplayPopup: Message | null;   // The current banner-style message being shown, if any
    _currentClickResponse: Message | null;  // The current mouse-click message being shown, if any

    constructor() {
        this._backlog = [];
        this._queue = [];
        this._currentDisplayPopup = null;
        this._currentClickResponse = null;
    }
}