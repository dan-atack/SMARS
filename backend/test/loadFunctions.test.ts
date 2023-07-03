const { loadGamesForUser, loadGameData } = require("../src/server_functions/loadFunctions");

describe("Load functions", () => {
    // Store function locally
    const loadGames = loadGamesForUser;
    const loadData = loadGameData;

    test("Defines loadGamesForUser", () => {
        expect(typeof loadGames).toBe("function");
    });

    test("Defines loadGameData", () => {
        expect(typeof loadData).toBe("function");
    });
});