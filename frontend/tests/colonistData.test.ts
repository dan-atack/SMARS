import ColonistData from "../src/colonistData";

describe("ColonistData", () => {
    const colonistData = new ColonistData(0, 0);

    test("Defines updateNeeds()", () => {
        expect(typeof colonistData.updateNeeds).toBe("function");
    });

    test("Sets goal to explore", () => {
        colonistData.setGoal("explore");
        expect(colonistData._currentGoal).toBe("explore");
    })
});