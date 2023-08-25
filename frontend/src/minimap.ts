// The pre-game (And in-game??) minimap module:
import P5 from "p5"
import { constants } from "./constants";
import { Coords } from "./connector";

export default class Minimap {
    // Minimap class types
    _x: number;
    _y: number;
    _w: number;                     // Use default value of 256 width for now
    _h: number;                     // Use default value of 128 height for now
    _label: string;                 // Either 'Map Preview' or 'Minimap' depending on whether it's part of the New Game screen or the Sidebar
    _terrain: number[];
    _landingSiteCoords: Coords | null;  // Shows the base's location, without getting too bogged down with specifics like individual modules
    _columnsPerPixel: number;       // Width in pixels to display for each map column
    _currentScreenWidth: number;    // Width in pixels of the box representing the current slice of the map being shown in the world area
    _currentScreenPosition: number; // Left edge of the current screen box (only for in-game display; not needed for pre-game map preview)
    setHorizontalOffset: (x: number) => void;   // Passed from the Engine to allow clicks to set the screen's location in the world

    constructor(x: number, y: number, label: string, setHorizontalOffset: (x: number) => void) {
        this._x = x;
        this._y = y;
        this._w = 256;
        this._h = 128;
        this._label = label;
        this._terrain = [];                 // Wait for terrain data to be loaded by the setup method
        this._landingSiteCoords = null;     // Wait to receive the landing site data
        this._columnsPerPixel = 1;          // Default value of 1 pixel per map column
        this._currentScreenWidth = 16;      // Default placeholder value
        this._currentScreenPosition = 0;    // Default to right edge of the map
        this.setHorizontalOffset = setHorizontalOffset;
    }

    // Takes the map terrain data from the NewGameSetup / Map component and converts it to a topography-like list of elevation numbers
    setup = (terrain: number[][], landingSite?: Coords) => {
        this._terrain = [];         // Reset terrain every time setup is called
        terrain.forEach((col) => {
            this._terrain.push(col.length);
        })
        this.determineDisplayWidth();
        if (landingSite && landingSite.x !== 0) this.setLandingSite(landingSite) // Store the landing site coordinates if they are provided
    }

    // Coords are given as column values so we must convert them to pixel locations
    setLandingSite = (landingSite: Coords) => {
        const x = Math.floor(landingSite.x / this._columnsPerPixel);    // Convert column coordinates to pixel location
        const y = Math.floor(constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - landingSite.y - 8) * 2;
        const pixelCoords: Coords = { x: x, y: y};
        this._landingSiteCoords = pixelCoords;
    }

    // Determines how many lines to render (or skip) based on the map's width, and how wide the 'current screen' box shall be
    determineDisplayWidth = () => {
        this._columnsPerPixel = this._terrain.length / this._w;
        const screenWidthInColumns = (constants.SCREEN_WIDTH - constants.SIDEBAR_WIDTH) / constants.BLOCK_WIDTH;
        this._currentScreenWidth = Math.floor(screenWidthInColumns / this._columnsPerPixel);  // Needs to be an integer
    }

    // X represents the Engine's horizontal offset, a raw pixel value which must be converted to a grid location
    updateScreenPosition = (x: number) => {
        const gridX = Math.floor(x / constants.BLOCK_WIDTH);
        this._currentScreenPosition = Math.floor(gridX / this._columnsPerPixel);
    }

    // Used to update terrain / infra displays after the game has started
    updateTerrain = (terrain: number[][]) => {
        //
    }

    // Takes mouse click coordinates (which can be non-integers, btw) and sets Engine horizontal offset value - allowing click based navigation
    handleClick = (mouseX: number) => {
        // Assuming X will be the midpoint, calculate the column representing the left edge of the screen's new location
        const column = Math.floor((mouseX - this._x) * this._columnsPerPixel);
        const screenWidth = (constants.SCREEN_WIDTH - constants.SIDEBAR_WIDTH) / constants.BLOCK_WIDTH; // In terms of columns
        const leftEdge = Math.max(column - screenWidth / 2, 0); // Still in columns; ensure left edge is not passed
        // Convert to pixels
        const maxRight = this._terrain.length * constants.BLOCK_WIDTH - (screenWidth * constants.BLOCK_WIDTH);    // Calculate max offset in px
        const offset = Math.min(leftEdge * constants.BLOCK_WIDTH, maxRight);
        this.setHorizontalOffset(offset);
    }

    render = (p5: P5) => {
        p5.stroke(constants.GREEN_DARK);
        p5.fill(constants.APP_BACKGROUND);
        p5.rect(this._x - 2, this._y - this._h - 2, this._w + 3, this._h + 4);      // Add a tiny buffer to the edges of the container
        p5.fill(constants.GREEN_TERMINAL);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(24);
        p5.text(this._label, this._x + (this._w / 2), this._y - this._h * 1.25);
        p5.stroke(constants.GREEN_MINIMAP);
        // Start rendering columns as lines:
        let p = 0;  // Keep track of which pixel is being rendered
        this._terrain.forEach((column, idx) => {
            if (idx >= p) {
                const x = Math.floor(this._x + idx / this._columnsPerPixel);
                p5.line(x, this._y, x, this._y - (column * 2));
                p += this._columnsPerPixel;
            }   
        });
        // Render the current screen's location box except for the new game setup screen
        if (this._label !== "Map Preview") {
            if (this._landingSiteCoords) {      // Show the base's landing zone if applicable
                p5.strokeWeight(0);
                p5.fill(constants.YELLOW_TEXT);
                p5.ellipse(this._x + this._landingSiteCoords.x, this._y - this._landingSiteCoords.y, 12);
            }
            p5.noFill();
            p5.strokeWeight(2);
            p5.stroke(constants.EGGSHELL);
            p5.rect(this._x + this._currentScreenPosition, this._y - this._h, this._currentScreenWidth, this._h);
        }
    }
}