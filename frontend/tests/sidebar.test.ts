/**
 * @jest-environment jsdom
 */

// For some reason it's necessary to run the Sidebar's unit tests, and only the Sidebar's unit tests, in the JSDOM environment as opposed to the regular 'node' environment. Weird, eh??

import Sidebar from "../src/sidebar";

describe("Sidebar", () => {

    // Dummy Engine functions to pass to the constructor:
    const switchScreen = (switchTo: string) => { return 0 };
    const changeView = (newView: string) => { return 0 };
    const setMouseContext = (value: string) => { return 0 };
    const setGameSpeed = (value: string) => { return 0 };

    const sidebar = new Sidebar(switchScreen, changeView, setMouseContext, setGameSpeed);

    test("Defines handleClicks", () => {
        expect(typeof sidebar.handleClicks).toBe("function");
    })

})