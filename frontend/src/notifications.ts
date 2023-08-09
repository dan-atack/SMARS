// The Notifications class is the Engine's secretary in charge of handling in-game messages shown to the player
import P5 from "p5";
import Message from "./message";
import { Coords } from "./connector";
import { GameTime } from "./saveGame";
import { compareGameTimes } from "./engineHelpers";
import { constants } from "./constants";

// Message data template definition
export type MessageData = {
    subject: string;        // Subject tags will be fed into a switch case block to determine what type of popup is produced
    smarsTime: GameTime     // To keep track of when a message was created / how old it is
    entityID: number        // To keep track of the subject of a message, when relevant
    text: string;           // The actual content of the message being displayed
}

export default class Notifications {
    // Notifications class types
    _backlog: MessageData[];                    // Long list used for general message accumulation
    _queue: MessageData[];                      // Prioritized short-list of messages to be displayed next
    _currentDisplayPopup: Message | null;       // The current banner-style message being shown, if any
    _currentClickResponse: Message | null;      // The current mouse-click message being shown, if any

    constructor() {
        this._backlog = [];
        this._queue = [];
        this._currentDisplayPopup = null;
        this._currentClickResponse = null;
    }

    // SECTION 1 - BACKLOG MANAGEMENT

    // Adds a new message to the backlog and ensures the list is in good order (no duplicate messages, etc)
    addMessageToBacklog = (message: MessageData) => {
        if (message && typeof message.subject === "string" && message.text.length > 0) {
            // Check for duplicates (same subject and text) and filter them out
            if (this._backlog.find((msg) => msg.subject === message.subject && msg.text === msg.text)) {
                this._backlog = this._backlog.filter((msg) => msg.subject !== message.subject || msg.text !== message.text);
            }
            this._backlog.push(message);
            console.log(this._backlog);
            return true;        // Return whether the message was succesfully added or not
        } else {
            console.log(`Error: was unable to add new message with subject ${message.subject} to notifications backlog`);
            return false;
        }
    }

    clearMessageBacklog = () => {
        this._backlog = [];
    }

    // SECTION 2 - CLICK MESSAGE CREATION AND MANAGEMENT

    // Called directly by the Engine when a mouse click results in a message being created
    createMessageFromClick = (coords: Coords, data: MessageData, textSize?: number) => {
        // Unless there is a good reason, over-ride the existing message whenever a new click is triggered
        let colour = "green";
        let duration = 150; // Default duration is 150 frames (~3 seconds)
        switch (data.subject) {     // Determine message duration and colouring based on the subject line
            case "command-demolish-success":
                duration = 100;
                break;
            case "command-demolish-failure":
                colour = "red";
                duration = 150;
                break;
            case "command-must-wait":
                colour = "red";
                duration = 50;      // Short duration for animation interruption clicks
                break;
            case "command-connector-fail":
            case "command-module-fail":
                colour = "red";
                duration = 100;
                break;
            case "command-resource-invalid":
            case "command-resource-no-surface":
                colour = "red";
            case "command-resource-success":
                coords.y -= 80;     // Move the message up to avoid obscuring the cursor for followup click attempts
                duration = 125;
                break;
            default:
                duration = 200;
        }
        this._currentClickResponse = new Message(data.text, colour, duration, coords, textSize);
    }

    expireCurrentClickResponse = () => {
        if (this._currentClickResponse) {
            this._currentClickResponse._timeRemaining = 0;
        }
    }

    // SECTION 3 - DISPLAY BANNER CREATION AND MANAGEMENT

    expireCurrentDisplayPopup = () => {
        if (this._currentDisplayPopup) {
            this._currentDisplayPopup._timeRemaining = 0;
        }
    }

    // Checks each frame for messages with no more display time remaining and cleans them up
    cleanupExpiredMessages = () => {
        if (this._currentClickResponse && this._currentClickResponse._timeRemaining <= 0) {
            this._currentClickResponse = null;
        }
        if (this._currentDisplayPopup && this._currentDisplayPopup._timeRemaining <= 0) {
            this._currentDisplayPopup = null;
        }
    }

    // RENDER ZONE

    render = (p5: P5) => {
        if (this._currentClickResponse) {
            this._currentClickResponse.render(p5);
        }
        if (this._currentDisplayPopup) {
            this._currentDisplayPopup.render(p5);
        }
        this.cleanupExpiredMessages();
    }

}