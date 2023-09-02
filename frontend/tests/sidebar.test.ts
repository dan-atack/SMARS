/**
 * @jest-environment jsdom
 */

// For some reason it's necessary to run the Sidebar's unit tests, and only the Sidebar's unit tests, in the JSDOM environment as opposed to the regular 'node' environment. Weird, eh??

import Sidebar from "../src/sidebar";
import AudioController from "../src/audioController";

describe("Sidebar", () => {

    // Dummy Engine functions to pass to the constructor:
    const switchScreen = (switchTo: string) => { return 0 };
    const changeView = (newView: string) => { return 0 };
    const setMouseContext = (value: string) => { return 0 };
    const setGameSpeed = (value: string) => { return 0 };
    const setHorizontalOffset = (x: number) => { return 0 };

    const audio = new AudioController;

    const sidebar = new Sidebar(audio, switchScreen, changeView, setMouseContext, setGameSpeed, setHorizontalOffset);

    test("Defines handleClicks", () => {
        expect(typeof sidebar.handleClicks).toBe("function");
    })

})