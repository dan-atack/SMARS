// The Notifications class is the Engine's secretary in charge of handling in-game messages shown to the player
import P5 from "p5";
import Message from "./message";
import { Coords } from "./connector";
import { GameTime } from "./saveGame";
import { compareGameTimes, getSmartianTimeDelta } from "./engineHelpers";
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
    _maxMessageAge: number;                     // The max amount of game minutes to keep a message in the backlog before it expires

    constructor() {
        this._backlog = [];
        this._queue = [];
        this._currentDisplayPopup = null;
        this._currentClickResponse = null;
        this._maxMessageAge = 120;              // Keep messages in the backlog for up to 2 hours before deleting
    }

    // SECTION 1 - UPDATER METHOD AND BACKLOG MANAGEMENT

    // Run every game-minute by the Engine to check if it's time to show a new message, or to shuffle the current queue
    handleMinutelyUpdates = () => {
        // Search the backlog for new messages and add them to the queue if the queue is empty, or if a high-priority message is in the backlog
        this.updateMessageQueue();
        // If there is no current display popup, check the queue for a new one
        if (this._currentDisplayPopup === null && this._queue.length > 0) {
            this.createMessageFromQueue();
        }
    }

    // Called once per hour, to clean up the backlog if it gets too long
    handleHourlyUpdates = (gameTime: GameTime) => {
        this.pruneOlderMessagesFromBacklog(gameTime);
    }

    // Adds a new message to the backlog and ensures the list is in good order (no duplicate messages, etc)
    addMessageToBacklog = (message: MessageData) => {
        if (message && typeof message.subject === "string" && message.text.length > 0) {
            // Check for duplicates (same subject and text) and filter them out
            if (this._backlog.find((msg) => msg.subject === message.subject && msg.text === msg.text)) {
                this._backlog = this._backlog.filter((msg) => msg.subject !== message.subject || msg.text !== message.text);
            }
            this._backlog.push(message);
            return true;        // Return whether the message was succesfully added or not
        } else {
            console.log(`Error: was unable to add new message with subject ${message.subject} to notifications backlog`);
            return false;
        }
    }

    // Checks the backlog against the current queue and decides which new message, if any, should be added to the queue
    updateMessageQueue = () => {
        // BASIC ARRANGEMENT: Add the earliest message from the backlog to the queue if the queue contains 1 message or less
        if (this._queue.length < 2 && this._backlog.length > 0) {
            // PRIORITIZATION: Check for urgent messages first, and add them instead of the next one in line if there is one
            const priority = this._backlog.find((msg) => msg.subject === "colonist-falling" || msg.subject === "colonist-trapped");
            if (priority) {
                this._queue.unshift(priority); // Push the priority message to the front of the queue, and then filter it out of the backlog
                this._backlog = this._backlog.filter((msg) => msg.subject !== priority.subject || msg.text !== priority.text);
            } else {
                const msg = this._backlog.shift();
                // BASIC FILTERING: Only add a new message to the queue if it's not the same as the current one
                if (msg && (msg.subject !== this._queue[0]?.subject || msg.text !== this._queue[0]?.text)) {
                    this._queue.push(msg);
                }
            }
        }
    }

    // Called once per hour to remove messages that have been there for longer than the maximum message age
    pruneOlderMessagesFromBacklog = (currentTime: GameTime) => {
        this._backlog.forEach((msg) => {
            const delta = getSmartianTimeDelta(currentTime, msg.smarsTime);
            if (delta >= this._maxMessageAge) {
                this._backlog = this._backlog.filter((m) => m.subject !== msg.subject || m.text !== msg.text);
            }
        })
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
            case "command-connector-success":
                coords.y -= 60;
                break;
            case "command-module-success":
                coords.y -= 40;
                break;
            case "command-demolish-failure":
                coords.y -= 60;
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
            case "command-excavate-fail":
                colour = "red";
            case "command-resource-success":
            case "command-excavate-success":
                coords.y -= 80;     // Move the message up to avoid obscuring the cursor for followup click attempts
                duration = 150;
                break;
            default:
                duration = 200;
        }
        this._currentClickResponse = new Message(data.text, colour, duration, coords, false, textSize);
    }

    expireCurrentClickResponse = () => {
        if (this._currentClickResponse) {
            this._currentClickResponse._timeRemaining = 0;
        }
    }

    // SECTION 3 - DISPLAY BANNER CREATION AND MANAGEMENT

    createMessageFromQueue = () => {
        const message = this._queue.shift();
        if (message) {
            let colour = "green";
            let duration = 300;     // Display banners have longer default duration
            const coords: Coords = { x: (constants.SCREEN_WIDTH - constants.SIDEBAR_WIDTH) / 2, y: 108 };
            switch (message.subject) {
                case "event-add-resource-success":
                    duration = 500;
                    break;
                case "earth-launch":
                case "earth-landing":
                case "landing-sequence":
                    duration = 750;
                    break;
                case "module-add-resource-partial":
                    duration = 500;
                    colour = "yellow";
                    break;
                case "colonist-trapped":
                case "event-add-resource-fail":
                case "event-subtract-resource-success":
                case "event-subtract-resource-fail":
                case "module-resource-missing":
                case "module-add-resource-fail":
                    duration = 400;
                case "general-advice-tip":
                    duration = 900;
                case "colonist-falling":
                case "colonist-entry-blocked":
                case "colonist-morale-loss":
                case "colonist-needs-fail":
                    colour = "red";
                break;
            }
            this._currentDisplayPopup = new Message(message.text, colour, duration, coords, true);
        } else {
            console.log("ERROR: Was unable to retreive message from the Notifications queue.");
        }
    }

    expireCurrentDisplayPopup = () => {
        if (this._currentDisplayPopup) {
            this._currentDisplayPopup._timeRemaining = 0;
        }
    }

    // SECTION 4 - GENERAL CLEANUP METHODS

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