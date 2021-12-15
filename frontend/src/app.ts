import P5 from "p5";

// Server Functions:
import { signalServer } from "./server_functions";
// Game constants:
import { constants } from "./constants";
// Components:
// import Screen from "./screen";
import Menu from "./menu";
import Button from "./button";

import "./styles.scss";

const sketch = (p5:P5) => {
    // const screen = new Screen(p5);
    const button = new Button(p5, 16, 16, signalServer)
    const buttons = [button];
    const mainMenu = new Menu(p5, buttons, "black");

    p5.setup = () => {
        const canvas = p5.createCanvas(constants.SCREEN_WIDTH, constants.SCREEN_HEIGHT);
        canvas.parent("app");
    }

    p5.mouseClicked = () => {
        mainMenu.handleClicks(p5.mouseX, p5.mouseY);
    }

    p5.draw = () => {
        // screen.render();
        mainMenu.render();
        p5.fill("black");
        p5.circle(p5.mouseX, p5.mouseY, 30);   
    }
}

new P5(sketch);