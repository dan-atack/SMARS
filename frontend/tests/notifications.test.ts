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

})