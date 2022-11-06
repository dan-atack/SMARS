import Industry from "../src/industry";
import Infrastructure from "../src/infrastructure";

describe("Industry class", () => {

    const industry = new Industry();

    test("Defines updateJobs", () => {
        expect(typeof industry.updateJobs).toBe("function");
    })

})