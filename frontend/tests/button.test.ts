import Button from "../src/button";

describe("Button", () => {
    const button = new Button("Test Button", 10, 10, () => console.log("click"), 128, 32, "0", "1", 24);

    test("Defines handleClick", () => {
        expect(typeof button.handleClick).toBe("function");
    })
})