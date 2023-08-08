import Message from "../src/message";

describe("Message", () => {

    const text = "test text";
    const colour = "#000000";
    const duration = 100;
    const coords = { x: 0, y: 0 };

    test("Defines render", () => {
        const message = new Message(text, colour, duration, coords);
        expect(typeof message.render).toBe("function");
    })

})