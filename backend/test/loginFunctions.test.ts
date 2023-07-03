const { handleLogin, handleSignup } = require("../src/server_functions/loginFunctions");

describe("Login functions", () => {
    const login = handleLogin;
    const signup = handleSignup;

    test("Defines handleLogin", () => {
        expect(typeof login).toBe("function");
    });

    test("Defines handleSignup", () => {
        expect(typeof signup).toBe("function");
    });

});