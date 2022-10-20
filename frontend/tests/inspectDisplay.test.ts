import InspectDisplay from "../src/inspectDisplay";

describe("InspectDisplay", () => {
    const inspec = new InspectDisplay(0, 0);

    test("Defines updateSelection", () => {
        expect(typeof inspec.updateSelection).toBe("function");
    })
})