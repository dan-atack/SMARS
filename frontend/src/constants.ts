// Global variables for the front-end:
import { EventData } from "./modal";
import { Resource } from "./economyData";

export const constants = {
    // Backend connection
    URL_PREFIX: "http://localhost:7000/api",
    // Units of measurement, in pixels
    SCREEN_WIDTH: 1080,       // If adjusting this parameter, make sure to also adjust the WORLD_VIEW_WIDTH just below
    SCREEN_HEIGHT: 720,
    SIDEBAR_WIDTH: 280,
    WORLD_VIEW_WIDTH: 800,    // Screen width minus sidebar width
    BLOCK_WIDTH: 20,
    EARTH_DAY_HUNDREDTHS_PER_HOUR: 715, // With 4 Smartian days per Smars year, this makes 1 Smartian year = 687 Earth days when divided by 100 (true value is 7.15 but multiplying that by 100 avoids floating point arithmetic issues)
    // Orbital physics values (all in terms of EARTH DAYS)
    HOHMANN_TRANSFER_INTERVAL: 791,       // Total time interval between rocket launches from Earth to Smars
    INTERPLANETARY_FLIGHT_DURATION: 274,  // Total time for a rocket to get to Smars from Earth
    PREFLIGHT_PREPARATION_TIME: 517,      // Time between the end of one Hohmann transfer interval and the ideal next launch date
    // Colours (darkest to lightest gray at top, then ROYGBIV going downwards below that)
    ALMOST_BLACK: "#010101",
    APP_BACKGROUND: "#03090A",
    SIDEBAR_BG: "#4B4446",
    GRAY_DRY_ICE: "#BCC4C1",
    GRAY_LIGHT: "#7D7D7D",
    GRAY_MEDIUM: "#626378",
    GRAY_DARK: "#595A6B",
    GRAY_DARKER: "#595A6B",
    GRAY_METEOR: "#353837",
    GRAY_IRON_ORE: "#2E1409",
    EGGSHELL: "#F6F7E9",
    RED_ERROR: "#D10000",
    RED_CONTRAST: "#FF4230",
    RED_BG: "#450701",
    RED_ROCK: "#882000",
    BROWN_SAND: "#B8A27D",
    BROWN_MUD: "#3B1E05",
    ORANGE_JUMPSUIT: "#C77E00",
    YELLOW_BG: "#544503",
    YELLOW_TEXT: "#FFD412",
    BLUE_ICE: "#A0EBE3",
    BLUE_SUNSET: "#050094",
    GREEN_LEAVES: "#049426",
    GREEN_TERMINAL: "#0FFF13",
    GREEN_MODULE: "#22B14C",
    GREEN_DARKISH: "#054F07",
    GREEN_DARK: "#023803",
    GREEN_DARKER: "#012400",
    GREEN_DARKEST: "#031A0A",
    BLUEGREEN_CRYSTAL: "#00F2BA",
    BLUEGREEN_DARK: "#052E26",
    BLUE_BG: "#00004F",
    PURPLE_LIGHT: "#A67ACF",
    // Other game data
    colonistNames: ["Jeb", "Valentina", "Bob", "Zelda", "Buzz", "Sally", "Diego", "Amelia", "Roy", "Carmen", "Zade", "Jesse"],
    colonistLastNames: ["Armstrong", "Lovell", "Gaga-ren", "Zhukov", "Borman", "Tsiolkovsky", "Goddard", "Ming", "Karman", "Holst"]
}

// Modal Data (for now - eventually it should come from the backend!)

export const modalData: EventData[] = [
   {
      id: 0,
      title: "Confirm Landing Selection",
      text: "Really? Are you sure this is a good\nlanding site? I mean, it's your call obviously...",
      resolutions: [
          {
              text: "Yes I'm sure!",
              outcomes: [["set-mouse-context", "inspect"], ["start-landing-sequence", 1]]
          },
          {
            text: "No, go back!",
            outcomes: [["set-mouse-context", "landing"]]
         }
      ]
  },
  {
      id: 1,
      title: "Touchdown!",
      text: "The colonists have arrived at the planet's surface,\nmiraculously unharmed!",
      resolutions: [
         {
            text: "Hallelujah!",
            outcomes: [["set-mouse-context", "inspect"], ["provision-base-structures", 1]]
         }
      ]
   },
]

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
        name: "Rock",
        color: constants.RED_ROCK,
        resource: "minerals",
        hp: 300,
        yield: 1
     },
     {
        type: 2,
        name: "Sand",
        color: constants.BROWN_SAND,
        resource: "minerals",
        hp: 100,
        yield: 2
     },
     {
        type: 3,
        name: "Ice",
        color: constants.BLUE_ICE,
        resource: "water",
        hp: 200,
        yield: 5
     },
     {
        type: 4,
        name: "Iron Ore",
        color: constants.GRAY_IRON_ORE,
        resource: "minerals",
        hp: 500,
        yield: 3
     },
     {
        type: 5,
        name: "Dry Ice",
        color: constants.GRAY_DRY_ICE,
        resource: "carbon",
        hp: 150,
        yield: 4
     },
     {
        type: 6,
        name: "Meteor",
        color: constants.GRAY_METEOR,
        resource: "carbon",
        hp: 300,
        yield: 2
     },
     {
        type: 7,
        name: "Frozen Mud",
        color: constants.BROWN_MUD,
        resource: "water",
        hp: 250,
        yield: 2
     },
     {
         type: 8,
         name: "Crystal",
         color: constants.BLUEGREEN_CRYSTAL,
         resource: "minerals",
         hp: 1000,
         yield: 10
     }
]