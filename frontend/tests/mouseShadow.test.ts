import MouseShadowData from "../src/mouseShadowData";

describe("Mouse Shadow", () => {
    const mouseShadowData = new MouseShadowData(20, 20);

    test("Defines setPosition", () => {
        expect(typeof mouseShadowData.setPosition).toBe("function");
    })
})