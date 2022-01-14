// Global variables for the front-end:
export const constants = {
    // Backend connection
    URL_PREFIX: "http://localhost:7000/api",
    // Units of measurement, in pixels
    SCREEN_WIDTH: 960,
    SCREEN_HEIGHT: 720,
    SIDEBAR_WIDTH: 280,
    WORLD_VIEW_WIDTH: 680,    // Screen width minus sidebar width
    BLOCK_WIDTH: 20,
    // Colours (darkest to lightest gray at top, then ROYGBIV going downwards below that)
    ALMOST_BLACK: "#010101",
    APP_BACKGROUND: "#03090A",
    SIDEBAR_BG: "#4B4446",
    EGGSHELL: "#F6F7E9",
    RED_ERROR: "#D10000",
    RED_CONTRAST: "#FF4230",
    RED_BG: "#450701",
    YELLOW_BG: "#544503",
    YELLOW_TEXT: "#FFD412",
    GREEN_TERMINAL: "#0FFF13",
    GREEN_MODULE: "#22B14C",
    GREEN_DARK: "#023803",
    BLUEGREEN_DARK: "#052E26",
    BLUE_BG: "#00004F",
}

 // BLOCKTIONARY!!!!
 export type BlockData = {
    type: number,
    name: string,
    color: string,
    resource: string,
    hp: number,
    yield: number
}

 export const blocks: BlockData[] = [
     {
        type: 1,
        name: "rock",
        color: constants.RED_BG,
        resource: "minerals",
        hp: 300,
        yield: 1
     },
     {
        type: 2,
        name: "sand",
        color: constants.YELLOW_BG,
        resource: "minerals",
        hp: 100,
        yield: 2
     },
     {
        type: 3,
        name: "ice",
        color: constants.BLUE_BG,
        resource: "water",
        hp: 200,
        yield: 5
     },
     {
        type: 4,
        name: "iron_ore",
        color: constants.SIDEBAR_BG,
        resource: "minerals",
        hp: 500,
        yield: 3
     },
     {
        type: 5,
        name: "dry_ice",
        color: constants.EGGSHELL,
        resource: "carbon",
        hp: 150,
        yield: 4
     },
     {
        type: 6,
        name: "meteor",
        color: constants.GREEN_MODULE,
        resource: "carbon",
        hp: 300,
        yield: 2
     },
     {
        type: 7,
        name: "frozen_mud",
        color: constants.GREEN_DARK,
        resource: "water",
        hp: 250,
        yield: 2
     },
     {
         type: 8,
         name: "crystal",
         color: "#89DF0C",
         resource: "minerals",
         hp: 1000,
         yield: 10
     }
 ]