import P5 from "p5";

// Game constants:
import { constants } from "./constants";
// Components:
// import Menu from "./menu";
import Login from "./login";
// import Button from "./button";

import "./styles.scss";

const sketch = (p5:P5) => {
    const login = new Login(p5);

    p5.setup = () => {
        const canvas = p5.createCanvas(constants.SCREEN_WIDTH, constants.SCREEN_HEIGHT);
        canvas.parent("app");
        login.currentScreen = true; // Login screen is the first one you will see:
        login.setup();
    }

    p5.mouseClicked = () => {
        if (login.currentScreen) login.handleClicks(p5.mouseX, p5.mouseY);
    }

    p5.draw = () => {
        // Run the render method for the current screen:
        if (login.currentScreen) login.render();  
    }
}

new P5(sketch);