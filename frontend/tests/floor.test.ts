import Floor from "../src/floor";

const id = 1000;
const left = 0;
const right = 3;
const elev = 10;

const footprint = [4, 5, 6, 7];

describe("Floor Tests", () => {
    const floor = new Floor(id, left, right, elev);

    test("Defines elevation", () => {
        expect(typeof floor._elevation).toBe("number");
    })

    test("Can update footprint", () => {

    })

    test("Can check for adjacency", () => {
        
    })
})