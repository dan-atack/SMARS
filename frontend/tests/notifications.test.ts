import Notifications, { Message } from "../src/notifications";
import { GameTime } from "../src/saveGame";

describe("Notifications", () => {

    const notifications = new Notifications();

    test("Defines addMessageToBacklog", () => {
        expect(typeof notifications.addMessageToBacklog).toBe("function");
    })

    test("addMessageToBacklog validates a new message and adds it to the backlog if it is correctly formatted", () => {
        const goodMessage: Message = {
            subject: "Module-placement-rejection",
            entityID: 1002,
            text: "Module cannot be placed there",
            smarsTime: {
                minute: 0,
                hour: 0,
                sol: 1,
                cycle: "AM",
                year: 0
            }
        }
        const badMessage: Message = {
            subject: "Module-placement-rejection",
            entityID: 1002,
            text: "",       // Good messages have at least some text
            smarsTime: {
                minute: 0,
                hour: 0,
                sol: 1,
                cycle: "AM",
                year: 0
            }
        }
        expect(notifications.addMessageToBacklog(goodMessage)).toBe(true);  // Should accept properly formatted message (which includes at least some text in the text field)
        expect(notifications.addMessageToBacklog(badMessage)).toBe(false);  // Should reject message with no text
    })

    test("addMessageToBacklog eliminates duplicates of messages with the same subject line, keeping the one with the most recent Smars-time stamp", () => {
        notifications.clearMessageBacklog();    // Reset test conditions
        const oldMessage: Message = {
            subject: "command-must-wait",
            entityID: 1002,
            text: "Please hold.",
            smarsTime: {
                minute: 2,
                hour: 12,
                sol: 1,
                cycle: "AM",
                year: 0
            }
        }
        const newMessage: Message = {
            subject: "command-must-wait",
            entityID: 1002,
            text: "Please hold.",
            smarsTime: {
                minute: 3,
                hour: 12,
                sol: 1,
                cycle: "AM",
                year: 0
            }
        }
        const diffMessage: Message = {
            subject: "module-placement-success",    // Different subject line = should not be eliminated
            entityID: 1002,
            text: "Module can TOTALLY be placed there",
            smarsTime: {
                minute: 1,
                hour: 11,
                sol: 1,
                cycle: "AM",
                year: 0
            }
        }
        notifications.addMessageToBacklog(oldMessage);
        notifications.addMessageToBacklog(newMessage);
        expect(notifications._backlog.length).toBe(1);                  // Only one message should be kept
        expect(notifications._backlog[0]).toStrictEqual(newMessage);    // It should be the newer of the two
        notifications.addMessageToBacklog(diffMessage);
        expect(notifications._backlog.length).toBe(2);                  // When a different message is entered it should be kept, even if it has an older timestamp
        expect(notifications._backlog[1]).toStrictEqual(diffMessage);    // It should be the newer of the two
    })

})