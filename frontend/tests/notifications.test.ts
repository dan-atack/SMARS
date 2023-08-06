import Notifications from "../src/notifications";

describe("Notifications", () => {

    const notifications = new Notifications();

    test("Defines addMessageToBacklog", () => {
        expect(typeof notifications.addMessageToBacklog).toBe("function");
    })

})