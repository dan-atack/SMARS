// Global variables for the front-end:
import { EventData } from "./modal";
import { Resource } from "./economyData";

// Get environment variables
const environment = process.env.ENVIRONMENT as string || "local_dev";
const serverName = process.env.SERVER_NAME as string || "localhost";
const serverPort = process.env.SERVER_PORT as string || "7000";
const httpsPort = process.env.HTTPS_PORT as string || "443";

export const constants = {
    // Game copyright and version info for display on login screen
    RELEASE_YEAR: "2023",
    RELEASE_VERSION: "1.1.4",
    // Backend connection: HTTP in dev environment, or HTTPS in staging/production??
    URL_PREFIX: environment === "local_dev" ? `http://${serverName}:${serverPort}/api` : `https://${serverName}:${httpsPort}/api`,
    // Units of measurement, in pixels
    SCREEN_WIDTH: 1200,       // If adjusting this parameter, make sure to also adjust the WORLD_VIEW_WIDTH just below
    SCREEN_HEIGHT: 720,
    SIDEBAR_WIDTH: 280,
    WORLD_VIEW_WIDTH: 920,    // Screen width minus sidebar width
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
    GRAY_LIGHTISH: "#7C7D99",
    GRAY_MEDIUM: "#626378",
    GRAY_DARK: "#595A6B",
    GRAY_DARKER: "#595A6B",
    GRAY_DARKEST: "#262626",
    GRAY_METEOR: "#353837",
    GRAY_IRON_ORE: "#2E1409",
    GRAY_WHITE: "#E5E6E1",
    EGGSHELL: "#F6F7E9",
    RED_ERROR: "#D10000",
    RED_CONTRAST: "#FF4230",
    RED_BG: "#450701",
    RED_ROCK: "#882000",
    BROWN_SAND: "#B8A27D",
    BROWN_BRINE: "#59502E",
    BROWN_MUD: "#3B1E05",
    ORANGE_JUMPSUIT: "#C77E00",
    ORANGE_COPPER: "#8C5827",
    YELLOW_BG: "#544503",
    YELLOW_TEXT: "#FFD412",
    YELLOW_SKY: "#C9A551",
    BLUE_ICE: "#A0EBE3",
    BLUE_DIRTY: "#2E4A59",
    BLUE_SUNSET: "#050094",
    GREEN_LEAVES: "#049426",
    GREEN_TERMINAL: "#0FFF13",
    GREEN_MINIMAP: "#20BD23",
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
      id: "landfall",
      title: "ARRIVAL",
      text: "Greetings, Earthling!\n\nThe SMARS Corporation welcomes you to your new home.\n\nPlease select your landing site, and for goodness' sakes\nbe careful where you choose to land.\n\nWe can't afford any more rescue missions this quarter.",
      resolutions: [
         {
            text: "That inspires confidence!",
            outcomes: [["set-mouse-context", "landing"]]
         }
      ],
   },
   {
      id: "load-game",
      title: "YOU'RE BACK!!!",
      text: `Welcome back, Commander!\n The colonists missed you.\nThey look up to you.`,
      resolutions: [
          {
              text: "The feeling is mutual.",
              outcomes: [["set-mouse-context", "inspect"]]
          } 
      ]
   },
   {
      id: "landing-confirm",
      title: "CONFIRM LANDING SITE",
      text: "Really? You want to land here?\nI mean okay, it's your call obviously...",
      resolutions: [
          {
              text: "Sure I'm sure!",
              outcomes: [["set-mouse-context", "inspect"], ["start-landing-sequence", 1]]
          },
          {
            text: "Let's reconsider!",
            outcomes: [["set-mouse-context", "landing"]]
         }
      ]
  },
  {
      id: "landing-touchdown",
      title: "TOUCHDOWN!",
      text: "The colonists have arrived at the planet's surface,\nmiraculously unharmed!",
      resolutions: [
         {
            text: "Hallelujah!",
            outcomes: [["set-mouse-context", "inspect"], ["provision-base-structures", 1]]
         }
      ]
   },
   {
      id: "easy-resupply",
      title: "RESUPPLY MISSION ARRIVES",
      text: "A new supply pod has arrived from Earth.\n\nAlthough they didn't remember to send any of that shampoo that\nyou like, there's still a pretty good haul of food, air and water.\n\nAnd also some money, which is still surprisingly useful out here.",
      resolutions: [
         {
            text: "I really wanted that shampoo!",
            outcomes: [["set-mouse-context", "inspect"], [ "add-resource", 1000, "food" ], [ "add-resource", 1000, "water" ], [ "add-resource", 1000, "oxygen" ], ["add-money", 500000] ]
         }
      ]
   },
   {
      id: "medium-resupply",
      title: "RESUPPLY MISSION ARRIVES",
      text: "A new resupply pod has arrived from Earth.\n\nIt doesn't contain quite as much food or water as you had\nrequested, but the Provisioning Department reminds you that it's\nbeen a difficult quarter, and to be grateful for what you get.",
      resolutions: [
         {
            text: "I am grateful!",
            outcomes: [["set-mouse-context", "inspect"], [ "add-resource", 500, "food" ], [ "add-resource", 500, "water" ], [ "add-resource", 1000, "oxygen" ], ["add-money", 300000] ]
         }
      ]
   },
   {
      id: "hard-resupply",
      title: "RESUPPLY MISSION ARRIVES",
      text: "A new supply pod has arrived from Earth.\n\nThe launch was almost scrapped due to budgetary concerns,\nand the Logistics Department wasn't able to send very much stuff.\n\nTry and be more self-sufficient, yeah?",
      resolutions: [
         {
            text: "Ooh, we're trying!",
            outcomes: [["set-mouse-context", "inspect"], [ "add-resource", 400, "food" ], [ "add-resource", 400, "water" ], [ "add-resource", 1000, "oxygen" ], ["add-money", 200000] ]
         }
      ]
   }
];

// BLOCKTIONARY!!!!
export type BlockData = {
    type: number,
    name: string,
    color: string,
    resource: string,
    hp: number,
    yield: number
};

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
        name: "Clear Ice",
        color: constants.BLUE_ICE,
        resource: "water",
        hp: 200,
        yield: 10
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
        yield: 4
     },
     {
         type: 8,
         name: "Crystal",
         color: constants.BLUEGREEN_CRYSTAL,
         resource: "minerals",
         hp: 1000,
         yield: 10
     },
     {
      type: 9,
      name: "Regolith",
      color: constants.GRAY_DARK,
      resource: "water",
      hp: 100,
      yield: 1
     },
     {
      type: 10,
      name: "Brine Mud",
      color: constants.BROWN_BRINE,
      resource: "water",
      hp: 100,
      yield: 6
     },
     {
      type: 11,
      name: "Dirty Ice",
      color: constants.BLUE_DIRTY,
      resource: "water",
      hp: 150,
      yield: 5
     },
     {
      type: 12,
      name: "Salt Flats",
      color: constants.GRAY_WHITE,
      resource: "water",
      hp: 250,
      yield: 0
     },
     {
      type: 13,
      name: "Frozen Rock",
      color: constants.GRAY_LIGHTISH,
      resource: "minerals",
      hp: 300,
      yield: 0
     }
];