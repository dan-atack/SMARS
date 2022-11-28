// New file for testing methods specifically related to the Colonist's morale functions
import ColonistData from "../src/colonistData";

describe("ColonistData", () => {

    // Create test colonist (data class)

    const colonist = new ColonistData(9000, "Bob Jones", 0, 30);

    // For convenience
    const resetColonist = (colonist: ColonistData) => {
        colonist._needs = {
            food: 0,
            water: 0,
            rest: 0
        };
        colonist._morale = 50;
    }

    test("updateMorale increases/decreases morale and respects upper and lower limits", () => {
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

    test("determineMoraleChangeForNeeds reduces morale for any need that is intolerably past its threshold", () => {
        // Reset colonist moral and needs
        resetColonist(colonist);
        // Case 1: No needs are at their threshold (no morale loss)
        colonist._needs.food = 6;
        colonist.determineMoraleChangeForNeeds();
        expect(colonist._morale).toBe(50);
        // Case 2: One need is past its threshold, equal to threshold + tolerance (no loss)
        colonist._needs.water = 6;
        colonist.determineMoraleChangeForNeeds();
        expect(colonist._morale).toBe(50);
        // Case 3: One need is past its threshold, above tolerance (-1 morale)
        colonist._needs.rest = 19;
        colonist.determineMoraleChangeForNeeds();
        expect(colonist._morale).toBe(49);
        // Case 4: Two needs are past their thresholds, above tolerance (-2 morale)
        colonist._needs.food = 9;
        colonist.determineMoraleChangeForNeeds();
        expect(colonist._morale).toBe(47);
        // Case 5: Three needs are past their thresholds, above tolerance (-3 morale)
        colonist._needs.water = 7;
        colonist.determineMoraleChangeForNeeds();
        expect(colonist._morale).toBe(44);
    })

})