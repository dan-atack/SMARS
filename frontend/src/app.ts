import P5 from "p5";

import { signalServer } from "./server_functions";

import "./styles.scss";

const sketch = (p5:P5) => {

    p5.setup = () => {
        const canvas = p5.createCanvas(512, 1024);
        canvas.parent("app");
        p5.background("black");
    }

    p5.mouseClicked = () => {
        // On any click, send signal to backend:
        signalServer();
    }

    p5.draw = () => {
        p5.background("black");
        p5.fill('white');
        p5.circle(p5.mouseX, p5.mouseY, 30);   
    }
}

new P5(sketch);