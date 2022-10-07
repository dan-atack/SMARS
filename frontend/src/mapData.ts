// The MapData class handles all of the data processing for the Map class, without any of the rendering tasks

import P5 from 'p5';
import { constants } from "./constants";
import Block from "./block";
import { Coords } from './connectorData';

export type MapZone = {         // If the map contains obstacles for colonist movement, it will be broken into 'zones'
    id: string;                 // You gotta have an ID for everything now...
    leftEdge: Coords;           // Both edges' positions are given, so that colonists can tell which zone they are standing on
    rightEdge: Coords;
}

export default class MapData {
    // Map data types:
    _mapData: number[][];
    _horizontalOffset: number;  // Value is in pixels
    _maxOffset: number;         // Farthest scroll distance, in pixels
    _columns: Block[][];
    _topography: number[];      // A list of the y-value at the surface elevation for every column.
    _zones: MapZone[];          // List of the edge points of the various zones on the map (if there are more than 1)
    _expanded: boolean          // Sometimes the map occupies the whole screen

    constructor() {
        this._mapData = [];     // Map data is recieved by setup function
        this._horizontalOffset = 0;
        this._maxOffset = 0;    // Determined during setup routine
        this._columns = [];
        this._topography = [];  // Gets filled in when the map data is loaded
        this._zones = [];       // Filled in after the topography analysis
        this._expanded = true;  // By default the map is expanded
    }

    
    //  NOTE TO FUTURE SELF: When terrain is destroyed or modified, make sure the this._mapData is updated as well since that is where the save data is stored.

    // Initial terrain setup (Blockland style but with array for columns list as well as for blocks within a column)
    setup = (p5: P5, mapData: number[][]) => {
        this._mapData = mapData;
        if (this._expanded) {
            this._maxOffset = mapData.length * constants.BLOCK_WIDTH - constants.SCREEN_WIDTH;
        } else {
            this._maxOffset = mapData.length * constants.BLOCK_WIDTH - constants.WORLD_VIEW_WIDTH;
        }
        this._mapData.forEach((column, idx) => {
            this._columns.push([]);
            column.forEach((blockType, jdx) => {
                if (blockType != 0) {  // Ignore 'empty' blocks (ensures easy compatibility with BlockLand map editor!)
                    const x = idx;
                    const y = (constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH) - jdx - 1;
                    const protoBlock = new Block(p5, x, y, blockType);
                    this._columns[idx].push(protoBlock);
                }
            })
        });
        this.updateTopographyAndZones();
    }

    setExpanded = (expanded: boolean) => {
        this._expanded = expanded;
        if (expanded) {
            this._maxOffset = this._mapData.length * constants.BLOCK_WIDTH - constants.SCREEN_WIDTH;
        } else {
            this._maxOffset = this._mapData.length * constants.BLOCK_WIDTH - constants.WORLD_VIEW_WIDTH;
        }
    }

    // For a given stretch of columns, do they all have the same height? Returns true for yes, false for no
    determineFlatness = (start: number, stop: number) => {  // Start at, stop before
        // Ensure this works with numbers going from lower to higher, or vice versa
        const ascending = start < stop;
        let height = 0; // Set this value with the first column to be tested; if any other column is different, return false
        for (let i = start; ascending ? i < stop : i > stop; ascending ? i++ : i--) {
            // Ensure column selection is not outside the map edges:
            if (i >= 0 && i < this._mapData.length) {
                // Set the first column as the measure to compare against
                if (i === start) {
                    height = this._mapData[i].length;
                } else {
                    if (this._mapData[i].length != height) {
                        // Area is not flat
                        // TODO: Upgrade this method's return to include failure messages
                        return false;
                    }
                }
            } else {
                // Placement is out of bounds
                // TODO: Upgrade this method's return to include failure messages
                return false;
            }
        }
        return true;    // If the method gets this far without returning false, the terrain is level
    }

    // Top-level terrain zone/topography determinator
    updateTopographyAndZones = () => {
        this.determineTopography();
        this.determineZones();
    }
    
    // Runs when the terrain is loaded (And again if it ever gets changed?!) to produce a list of elevation values for each column
    determineTopography = () => {
        this._topography = [];  // Reset value every time calculation is made
        if (this._mapData.length > 0) {
            this._mapData.forEach((col) => {
                // Y = the elevation of the highest block (higher numbers representing lower altitude, of course)
                const y = constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - col.length;
                this._topography.push(y);
            })
            // console.log(this._topography);
        } else {
            console.log("Error: Could not find topography for map - map data missing.");
        }
    }

    // Runs right after the topography analysis, to determine if there are parts of the map where elevation changes are too steep for colonists to climb, and determines where the borders are.
    determineZones = () => {
        this._zones = [];   // Reset value every time calculation is made
        if (this._topography.length > 0) {
            let i = 0;                          // Go through each column
            let alt = this._topography[i];      // Prepare to keep measure of the topography deltas between columns
            let z: MapZone = this.createNewZone(i, alt);
            while (i < this._topography.length) {
                const deltaAlt = this._topography[i] - alt; // Get delta by comparing current column's height to the previous
                if (Math.abs(deltaAlt) > 2) {   // When the delta is greater than 2 that means you just passed into a new zone
                    z.rightEdge.x = i - 1;       // Fill in the right edge info for the previous zone first
                    z.rightEdge.y = alt;         // Use the altitude from the previous column here
                    this._zones.push(z);        // Add the zone to the zones list before creating a new one
                    // Reset z and give it the right side coords for the next zone
                    z = this.createNewZone(i, this._topography[i]);
                }
                // Be sure to close the last zone
                if (i === this._topography.length - 1) {
                    z.rightEdge.x = i;
                    z.rightEdge.y = this._topography[i];
                    this._zones.push(z);
                }
                alt = this._topography[i];  // Set altitude to compare to next column
                i++;
            }
            // console.log(this._zones);
        } else {
            console.log("Error: Could not determine map zones - topography data missing.");
        }
    }

    // Creates a Zone - can optionally take two arguments for the x and y value of the new zone's left edge
    createNewZone = (x: number, y: number) => {
        let z: MapZone = {
            id: x.toString() + "0" + y.toString(),  // Make a unique ID string from the x and y values!
            leftEdge: { x: x , y : y},              // Use the x and y values here if provided
            rightEdge: {x: 0, y: 0}
        }
        return z;
    }

    // Takes two sets of coordinates and determines if they are A) both on the surface and B) both in the same Zone
    walkableFromLocation = (startX: number, startY: number, destX: number, destY: number) => {
        if (this._topography[startX] === startY + 1) {  // The correct starting height should be one unit above the surface level
            const zStart = this._zones.find(function(zone) {
                return zone.leftEdge.x <= startX && zone.rightEdge.x >= startX
            });
            const zFinish = this._zones.find(function(zone) {
                return zone.leftEdge.x <= destX && zone.rightEdge.x >= destX
            });
            if (zStart === zFinish && destY + 1 === this._topography[destX]) {
                return true     // Return true if start and destination are in the same zone, and destination is at ground level
            } else if (zStart === zFinish) {
                // console.log(`Elevation ${destY} not reachable at destination ${destX}`);
                return false;
            } else {
                // console.log(`Column ${startX} is in different zone than column ${destX}`);
                return false;
            }
        } else {
            console.log(`Error: Provided start location (${startX}, ${startY}) is not on surface level.`);
            return false;
        }
    }

    // Returns the zone ID for a set of coordinates on the map's surface
    getZoneIdForCoordinates = (coords: Coords) => {
        if (this._topography[coords.x] === coords.y + 1) {   // Valid height is one above surface level
            const zone = this._zones.find(function(z) {
                return z.leftEdge.x <= coords.x && z.rightEdge.x >= coords.x
            });
            if (zone !== undefined) {
                return zone.id;
            } else {
                console.log(`Error: No zone found for X coordinate ${coords.x}`);
                return "";
            }
        } else {
            // console.log(`Coordinates ${coords.x}, ${coords.y} are not at surface level.`);
            return "";
        }

    }

}