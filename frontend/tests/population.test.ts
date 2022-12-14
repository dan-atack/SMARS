import Population from "../src/population";

describe("Population", () => {
    const population = new Population();

    test("Defines addColonist", () => {
        expect(typeof population.addColonist).toBe("function");
    })

    test("AddColonist adds a Colonist", () => {
        population.addColonist(0, 0);
        expect(population._colonists.length).toBe(1);           // Check that colonist is 'on the list'
        expect(population._colonists[0]._data._id).toBe(9000);  // Check their ID... wow, are these unit tests or a nightclub bouncer's instructions manual, amiright?
    })

    test("Can find a Colonist when given a set of coordinates", () => {
        // First move the colonist so that this isn't too easy
        population._colonists[0]._data._x = 10;
        population._colonists[0]._data._y = 31;     // 31 is the head level, so the feet will be on level 32
        expect(population.getColonistDataFromCoords({ x: 10, y: 31 })?._data._id).toBe(9000);   // Head
        expect(population.getColonistDataFromCoords({ x: 10, y: 32 })?._data._id).toBe(9000);   // Feet
        expect(population.getColonistDataFromCoords({ x: 10, y: 33 })).toBe(null);              // Too low!!!
    })

    test("Can assign a role to a colonist when given the colonist's ID", () => {
        population.assignColonistRole(9000, ["farmer", 1001]);
        expect(population._colonists[0]._data._role[0]).toBe("farmer");             // Role is assigned if colonist exists
        expect(population.assignColonistRole(8000, ["farmer", 1001])).toBe(null);   // If colonist ID does not exist return null
    })

    test("Can calculate the average morale of all the colonists each hour", () => {
        population.addColonist(0, 0);                   // Add a second colonist
        expect(population._averageMorale).toBe(50);     // Default value is 50
        population.addColonist(0, 0);                   // Add a third colonist
        population._colonists[0]._data._morale = 80;    // Increase one colonist's morale by 30
        population.updateMoraleRating();
        expect(population._averageMorale).toBe(60);     // Average morale = 50 + 50 + 80 / 3 = 60
        // Reduce one colonist's morale by one point
        population._colonists[1]._data._morale = 49;
        population.updateMoraleRating();
        expect(population._averageMorale).toBe(60);     // Average morale is rounded to the nearest integer (rounded up)
        // Reduce one colonist's morale by one more point
        population._colonists[1]._data._morale = 48;
        population.updateMoraleRating();
        expect(population._averageMorale).toBe(59);     // Average morale is rounded to the nearest integer (rounded down)
    })

    test("Can calculate how many new colonists to send on the next rocket", () => {
        // Manually set morale and then measure
        population._averageMorale = 0;
        expect(population.determineColonistsForNextLaunch()).toBe(0);
        population._averageMorale = 24;
        expect(population.determineColonistsForNextLaunch()).toBe(0);
        population._averageMorale = 25;
        expect(population.determineColonistsForNextLaunch()).toBe(1);
        population._averageMorale = 49.5;
        expect(population.determineColonistsForNextLaunch()).toBe(1);
        population._averageMorale = 50;
        expect(population.determineColonistsForNextLaunch()).toBe(2);
        population._averageMorale = 75;
        expect(population.determineColonistsForNextLaunch()).toBe(3);
        population._averageMorale = 99.99;
        expect(population.determineColonistsForNextLaunch()).toBe(3);
        population._averageMorale = 100;
        expect(population.determineColonistsForNextLaunch()).toBe(4);
    } )
})