import P5 from "p5";

// Game constants:
import { constants } from "./constants";
// Components:
import AudioController from "./audioController";
import Menu from "./menu";
import Login from "./login";
import NewGameSetup from "./newGameSetup";
import InGameMenu from "./inGameMenu";
import Game from "./game";
import SaveGame from "./saveGame";
import LoadGame from "./loadGame";

import "./styles.scss";
import { playSound } from "./engineHelpers";

const sketch = (p5:P5) => {
    // Prepare to keep track of username after login is finished:
    let username: string = "";
    // Functions first! But we're still really object-oriented, I swear!
    // Check the login class instance for a successful login:
    const checkForLogin = () => {
        // Once the login is completed, set the username and move to the main menu screen, and let both menus know what the user's name is:
        if (login.loggedIn) {
            username = login.username;
            menu.setUsername(username);
        }
    }

    // Use this function to activate the 'currentScreen' property of the screen being switched to (switchTo argument = name of screen instance, e.g. menu, game, inGameMenu, etc.)
    const switchScreen = (switchTo: string) => {
        switch (switchTo) {
            case "game":
                // If Load Game screen has game loaded AND the Game screen has not yet loaded, boot it up with Load screen's data
                if (!game._gameLoaded && loadGame._saveInfo != null) {
                    game.setLoadedGameData(loadGame._saveInfo, username);
                // Otherwise, load the game with data from the New Game screen instead
                } else if (!game._gameLoaded) {
                    game.setNewGameData(newGame.gameData, username);
                }
                game.setup();
                break;
            case "inGameMenu":
                inGameMenu.setUsername(username);
                inGameMenu.setup();
                break;
            case "loadGame":
                loadGame.setUsername(username);
                loadGame.setup();
                break;
            case "login":
                username = ""   // Reset username to blank if the logout button is activated
                login.loggedIn = false; // Tell the login page that no user is currently logged in
                login.setup();  // Call this from the menu's logout button, if you have the energy
                break;
            case "menu":
                // Reset the game and load data if arriving at the main menu from the in-game menu
                if (game._gameLoaded) {
                    game.reset();
                } else {
                    menu._audio.playSound("music", "smarsTheme");       // Play soundtrack if it's the player's first time seeing the main menu
                    menu._audio.setFadeinTime("music", 20);                 // Fade-in gradually over the first 20 seconds
                    menu._audio.setFadeoutTimes("music", 128, 10);          // Start fading out after two minutes and stop playing entirely at 2:18
                }
                menu.setup();
                break;
            case "newGameSetup":
                newGame.setup();
                break;
            case "preferences":
                p5.background(constants.GREEN_TERMINAL);
                break;
            case "save":
                const data = game.prepareSaveData();
                saveGame.setup(data);
                break;
        }
    }

    // Instantiate Screen classes:
    const audio = new AudioController();
    const login = new Login(p5, audio, switchScreen);
    const menu = new Menu(p5, audio, constants.APP_BACKGROUND, switchScreen);
    const newGame = new NewGameSetup(p5, audio, switchScreen);
    const game = new Game(p5, audio, switchScreen);
    const inGameMenu = new InGameMenu(p5, audio, switchScreen);
    const saveGame = new SaveGame(p5, audio, switchScreen);
    const loadGame = new LoadGame(p5, audio, switchScreen);

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
        if (inGameMenu.currentScreen) inGameMenu.handleClicks(p5.mouseX, p5.mouseY);
        if (saveGame.currentScreen) saveGame.handleClicks(p5.mouseX, p5.mouseY);
        if (loadGame.currentScreen) loadGame.handleClicks(p5.mouseX, p5.mouseY);
    }

    // Handler for in-game operations that involve holding the mouse button down (as opposed to regular clicks):
    p5.mousePressed = () => {
        if (game.currentScreen) game.handleMouseDowns(p5.mouseX, p5.mouseY);
    }

    // Handle key press events (currently only of interest to the Game's Engine component)
    p5.keyPressed = () => {
        if (game.currentScreen) game.handleKeyPress(p5.keyCode);
    }

    p5.draw = () => {
        // Check for login if username hasn't been set yet:
        if (username.length === 0) checkForLogin();
        // Run the render method for the current screen:
        if (login.currentScreen) login.render();
        if (menu.currentScreen) menu.render();
        if (newGame.currentScreen) newGame.render();
        if (game.currentScreen) game.render();
        if (inGameMenu.currentScreen) inGameMenu.render();
        if (saveGame.currentScreen) saveGame.render();
        if (loadGame.currentScreen) loadGame.render();
    }
}

new P5(sketch);