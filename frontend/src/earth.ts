// In-game view for displaying the tech tree
import P5 from "p5";
import View from "./view";
import Button from "./button";
import { constants } from "./constants";

export default class Earth extends View {
    // Earth Relations page Types:
    _earthDate: Date;
    _dateRemainder: number;
    _nextLaunchDate: Date;              // Keep track of next launch and landing dates
    _nextLandingDate: Date;
    _flightEnRoute: boolean;            // Track whether or not there is currently a flight incoming
    _colonistsEnRoute: number           // The anticipated / actual number of colonists on the next flight
    // Formatting points
    _leftIndent: number;
    _sunCenterX: number;
    _sunCenterY: number;
    _marsCenterX: number;
    _marsCenterY: number;
    _earthCenterX: number;
    _earthCenterY: number;

    constructor(changeView: (newView: string) => void) {
        super(changeView);
        this._earthDate = new Date("January 1, 2030");       // Game starts on new year's day, 2030
        this._dateRemainder = 0;                             // Keep track of the remainder when adding days
        // Set next launch date to t-preflight interval time, and next landing to t-hohmann transfer duration
        this._nextLaunchDate = new Date("January 1, 2030");
        this._nextLaunchDate.setDate(this._nextLaunchDate.getDate() + constants.PREFLIGHT_PREPARATION_TIME);
        this._nextLandingDate = new Date("January 1, 2030");
        this._nextLandingDate.setDate(this._nextLandingDate.getDate() + constants.HOHMANN_TRANSFER_INTERVAL);
        this._flightEnRoute = false;    // At the start of the game no flight is underway. You are on your own for now.
        this._colonistsEnRoute = 2;     // The value is 'anticipated' until a launch occurs, then it gets locked in
        // Model Solar System coords (tODO: Replace with a proper system)
        this._leftIndent = 64;
        this._sunCenterX = 540;
        this._sunCenterY = 480;
        this._marsCenterX = 640;
        this._marsCenterY = 640;
        this._earthCenterX = 560;
        this._earthCenterY = 640
    }

    // SECTION 0 - SETUP (View component requirement)

    setup = () => {
        this.currentView = true;
    }
    
    // SECTION 1 - TOP LEVEL UPDATER (RUNS ONCE PER EARTH WEEK \ GAME HOUR)

    // Takes one parameter: the number of colonists to go on the next launch
    handleWeeklyUpdates = (colonists: number) => {
        if (!(this._flightEnRoute)) {      // Only allow if the rocket is not already en route!
            console.log(`Updating immigration target to ${colonists} for next launch.`);
            this.setColonists(colonists);
        } else {
            console.log(`Cannot update immigration target to ${colonists} while rocket is in flight!`);
        }
        this.updateEarthDate();
        const ev = this.checkEventDatesForUpdate();
        this.setNextEventDate(ev);  // If either a launch or a landing has occurred, schedule the next one
    }

    // SECTION 2 - LOADING SAVE DATA

    // Optionally load the date data from a saved game, if it's there
    loadSavedDate = (earthDates?: { date: Date, remainder: number, nextLaunch: Date, nextLanding: Date }) => {
        console.log(earthDates);
        // Only load complete earth data (including launch and landing date info)
        if (earthDates && earthDates.nextLaunch) {
            const date = new Date(earthDates.date);
            const launch = new Date(earthDates.nextLaunch);
            const landing = new Date(earthDates.nextLanding);
            this._earthDate = date;
            this._nextLaunchDate = launch;
            this._nextLandingDate = landing;
            this._dateRemainder = earthDates.remainder;
        } else {
            console.log("Legacy save loaded. Earth date data not retreivable.");
        }
    }

    // Optionally load the current flight data from a saved game
    loadSavedFlightData = (data?: { en_route: boolean, colonists: number }) => {
        if (data) {
            this.setColonists(data.colonists);
            if (data.en_route) {
                this._flightEnRoute = data.en_route;
            }
        } else {
            console.log("Colonists en route data not found. Using default value.");
        }
    }

    // SECTION 3 - UPDATING THE CURRENT DATE

    // Adds 7.15 days to the Earth date for every game hour that passes
    updateEarthDate = () => {
        const addDays = constants.EARTH_DAY_HUNDREDTHS_PER_HOUR;
        // Date remainder value must be divided by 100 since we only use integers (ie 7.15 is passed to this function as 715)
        this._dateRemainder += addDays % 100;      // Add the remainder first
        if (this._dateRemainder >= 100) {
            this._earthDate.setDate(this._earthDate.getDate() + addDays / 100 + 1);
            this._dateRemainder = this._dateRemainder % 100;    // If remainder is bigger than 100, add one then get the remainder's remainder
        } else {
            this._earthDate.setDate(this._earthDate.getDate() + addDays / 100 );
        }
    }

    // SECTION 4 - SCHEDULING IMPORTANT EVENTS

    // Runs every game hour to check if either the next launch / landing date has arrived and returns an event object
    checkEventDatesForUpdate = () => {
        let ev = {
            launch: false,
            landing: false
        }
        // Check if launch date has arrived and set flight to true if so
        if (this._earthDate > this._nextLaunchDate) {
            console.log("A new rocket has been launched from Earth.");
            ev.launch = true;
            this._flightEnRoute = true;
        // Check if landing date has arrived and set flight to false if so
        } else if (this._earthDate > this._nextLandingDate) {
            console.log("A new rocket has been landed on SMARS!");
            ev.landing = true;
            this._flightEnRoute = false;
        }
        return ev;
    }

    // SECTION 5 - SETTER FUNCTIONS

    // Update the number of colonists on the current ship - even if it has launched (to permit loading save data)
    setColonists = (colonists: number) => {
        this._colonistsEnRoute = colonists;
    }

    // Called by the event checker whenever the launch / landing date is surpassed by the current date
    setNextEventDate = (ev: { launch: boolean, landing: boolean }) => {
        // Using the current date, schedule the next launch / landing date
        if (ev.launch) {
            this._nextLaunchDate.setDate((this._nextLaunchDate.getDate() + constants.HOHMANN_TRANSFER_INTERVAL));
        } else if (ev.landing) {
            this._nextLandingDate.setDate((this._nextLandingDate.getDate() + constants.HOHMANN_TRANSFER_INTERVAL));
        }
    }

    render = (p5: P5) => {
        p5.background(constants.APP_BACKGROUND);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text("Earth Relations", constants.SCREEN_WIDTH / 2, 64);
        p5.textAlign(p5.LEFT);
        p5.textSize(24);
        p5.text(`Earth Date: ${this._earthDate.toISOString().slice(0, 10)}`, 64, 256);
        if (this._flightEnRoute) {
            p5.text(`Next mission landing date: ${this._nextLandingDate.toISOString().slice(0, 10)}`, 64, 320);
        } else {
            p5.text(`Next mission launch date: ${this._nextLaunchDate.toISOString().slice(0, 10)}`, 64, 320);
        }
        p5.text(`Number of new colonists ${this._flightEnRoute ? ""  : "anticipated "}on ${this._flightEnRoute ? "current" : "next"} flight: ${this._colonistsEnRoute}`, 64, 384);
        this._buttons.forEach((button) => {
            button.render(p5);
        })
    }

}