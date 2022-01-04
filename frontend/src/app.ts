import P5 from "p5";

// Game constants:
import { constants } from "./constants";
// Components:
import Menu from "./menu";
import Login from "./login";
import NewGameSetup from "./newGameSetup";
import Game from "./game";

import "./styles.scss";

const sketch = (p5:P5) => {
    // Prepare to keep track of username after login is finished:
    let username: string = "";
    // Functions first! But we're still really object-oriented, I swear!
    // Check the login class instance for a successful login:
    const checkForLogin = () => {
        // Once the login is completed, set the username and move to the main menu screen, and let the menu know what the user's name is:
        if (login.loggedIn) {
            username = login.username;
            menu.setUsername(username);
        }
    }

    // Use this function to activate the 'currentScreen' property of the screen being switched to (switchTo argument = name of screen instance, e.g. menu, game, inGameMenu, etc.)
    const switchScreen = (switchTo: string) => {
        switch (switchTo) {
            case "game":
                // TODO: If this is a new game, pass the pre-game setup data from the newGameSetup screen to the game module
                game.setup();
                break;
            case "loadGame":
                p5.background(constants.RED_ERROR);
                break;
            case "login" :
                username = ""   // Reset username to blank if the logout button is activated
                login.loggedIn = false; // Tell the login page that no user is currently logged in
                login.setup();  // Call this from the menu's logout button, if you have the energy
                break;
            case "menu":
                menu.setup();
                break;
            case "newGameSetup":
                newGame.setup();
                break;
            case "preferences":
                p5.background(constants.GREEN_TERMINAL);
                break;            
        }
    }

    // Instantiate Screen classes:
    const login = new Login(p5, switchScreen);
    const menu = new Menu(p5, constants.APP_BACKGROUND, switchScreen);
    const newGame = new NewGameSetup(p5, switchScreen);
    const game = new Game(p5, switchScreen);

    p5.setup = () => {
        const canvas = p5.createCanvas(constants.SCREEN_WIDTH, constants.SCREEN_HEIGHT);
        canvas.parent("app");
        login.setup();  // Setup login page first, since that's always the first screen you'll see
    }

    p5.mouseClicked = () => {
        if (login.currentScreen) login.handleClicks(p5.mouseX, p5.mouseY);
        if (menu.currentScreen) menu.handleClicks(p5.mouseX, p5.mouseY);
        if (newGame.currentScreen) newGame.handleClicks(p5.mouseX, p5.mouseY);
        if (game.currentScreen) game.handleClicks(p5.mouseX, p5.mouseY);
    }

    p5.draw = () => {
        // Check for login if username hasn't been set yet:
        if (username.length === 0) checkForLogin();
        // Run the render method for the current screen:
        if (login.currentScreen) login.render();
        if (menu.currentScreen) menu.render();
        if (newGame.currentScreen) newGame.render();
        if (game.currentScreen) game.render();
    }
}

new P5(sketch);