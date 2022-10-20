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
})