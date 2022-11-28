// New file for testing methods specifically related to the Colonist's morale functions
import ColonistData, { ColonistAction } from "../src/colonistData";

describe("ColonistData", () => {

    // Create test colonist (data class)

    const colonist = new ColonistData(9000, "Bob Jones", 0, 30);

    test("Update morale method increases/decreases morale and respects upper and lower limits", () => {
    // Validate Colonist default morale
    expect(colonist._morale).toBe(50);
    // Validate morale updater function with small increase
    colonist.updateMorale(5);
    expect(colonist._morale).toBe(55);
    // Validate morale updater function respects upper limit (100)
    colonist.updateMorale(50);
    expect(colonist._morale).toBe(100);
    // Validate morale updater function with small decrease
    colonist.updateMorale(-5);
    expect(colonist._morale).toBe(95);
    // Validate morale updater function respects lower limit (0)
    colonist.updateMorale(-100);
    expect(colonist._morale).toBe(0);
    })
})