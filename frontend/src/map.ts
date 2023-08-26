// The Map class represents the terrain in the game's world:
import P5 from "p5";
import Block from "./block";
import { Coords } from "./connector";
import { constants } from "./constants";

// Map Zone object shape template
export type MapZone = {         // If the map contains obstacles for colonist movement, it will be broken into 'zones'
    id: string;                 // You gotta have an ID for everything now...
    leftEdge: Coords;           // Both edges' positions are given, so that colonists can tell which zone they are standing on
    rightEdge: Coords;
}

export default class Map {
    // Map types:
    _mapData: number[][];
    _horizontalOffset: number;  // Value is in pixels
    _maxOffset: number;         // Farthest scroll distance, in pixels
    _bedrock: number;           // The highest Y value (Which we must recall is inverted) at which blocks cannot be removed (e.g. by excavating)
    _columns: Block[][];
    _topography: number[];      // A list of the y-value at the surface elevation for every column.
    _zones: MapZone[];          // List of the edge points of the various zones on the map (if there are more than 1)
    _expanded: boolean          // Sometimes the map occupies the whole screen
    _highlightedBlock: Block | null;

    constructor() {
        this._mapData = [];     // Map data is recieved by setup function
        this._horizontalOffset = 0;
        this._maxOffset = 0;    // Determined during setup routine
        this._bedrock = constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - 1;    // The y altitude of the BOTTOM block level (cannot be removed)
        this._columns = [];
        this._topography = [];  // Gets filled in when the map data is loaded
        this._zones = [];       // Filled in after the topography analysis
        this._expanded = true;  // By default the map is expanded
        this._highlightedBlock = null   // By default no blocks are highlighted
    }

    // SECTION 1: INITIAL SETUP & DISPLAY WIDTH SETTING MANAGEMENT

    setup = (mapData: number[][]) => {
        this._mapData = mapData;
        if (this._expanded) {
            this._maxOffset = mapData.length * constants.BLOCK_WIDTH - constants.SCREEN_WIDTH;
        } else {
            this._maxOffset = mapData.length * constants.BLOCK_WIDTH - constants.WORLD_VIEW_WIDTH;
        }
        this._columns = []; // Ensure columns list is empty before filling it
        this._mapData.forEach((column, idx) => {
            this._columns.push([]);
            column.forEach((blockType, jdx) => {
                if (blockType != 0) {  // Ignore 'empty' blocks (ensures easy compatibility with BlockLand map editor!)
                    const x = idx;
                    const y = (constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH) - jdx - 1;
                    const protoBlock = new Block(x, y, blockType);
                    this._columns[idx].push(protoBlock);
                }
            })
        });
        this.updateTopographyAndZones();
    }

    // Adjust the location on the screen of the map's far right edge, depending on whether the sidebar is open
    setExpanded = (expanded: boolean) => {
        this._expanded = expanded;
        if (expanded) {
            this._maxOffset = this._mapData.length * constants.BLOCK_WIDTH - constants.SCREEN_WIDTH;
        } else {
            this._maxOffset = this._mapData.length * constants.BLOCK_WIDTH - constants.WORLD_VIEW_WIDTH;
        }
    }

    // SECTION 2: TOPOGRAPHY AND ZONE BOUNDARY DETERMINATION

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
        } else {
            console.log("ERROR: Could not find topography for map - map data missing.");
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
        } else {
            console.log("ERROR: Could not determine map zones - topography data missing.");
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

    // SECTION 3: TERRAIN CONSTRAINT HELPERS FOR OTHER CLASSES

    // For a given stretch of columns, do they all have the same height? Returns true for yes, false for no
    determineFlatness = (start: number, stop: number) => {
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
                return false;
            } else {
                return false;
            }
        } else {
            console.log(`ERROR: Provided start location (${startX}, ${startY}) is not on surface level.`);
            return false;
        }
    }

    // Takes a set of coordinates for an attempted excavation action and checks if the block at that location can be removed - returning it if so
    isBlockRemovable = (coords: Coords) => {
        let msg = "";   // Prepare a notification to return if the block cannot be removed
        const b = this.getBlockForCoords(coords);
        if (b) {
            const noCliffs = this._columns[b._x + 1].length - this._columns[b._x].length < 2 && this._columns[b._x - 1].length - this._columns[b._x].length < 2;
            if (noCliffs && b._y < this._bedrock && this.isBlockOnSurface(b)) {
                return b;
            } else {
                msg = `Cannot excavate ${b._blockData.name}:${noCliffs ? b._y < this._bedrock ? "\nMust be at surface level" : "\nSite is too deep" : "\nSite is too steep"}`;
                return msg;
            }
            
        } else {
            msg = "Click on a tile\nto excavate it.";
            return msg;
        }
    }

    // SECTION 4: TERRAIN MODIFICATION METHODS

    // Receives a block that has already been approved for removal from the Engine
    removeBlock = (block: Block) => {
        const b = this._columns[block._x].pop(); // Remove the top block from this column and keep it for a moment before eliminating it
        if (b) {
            this._mapData[block._x].pop();      // This is just a number so get rid of it
            this.updateTopographyAndZones();    // Lastly, update the map's topography and zones data
        } else {
            console.log(`ERROR: Block data for block at (${block._x}, ${block._y}) not found.`);
        }
    }

    // SECTION 5: MAP INFO API (GETTER FUNCTIONS)

    // Returns the zone ID for a set of coordinates on the map's surface
    getZoneIdForCoordinates = (coords: Coords) => {
        if (this._topography[coords.x] === coords.y + 1) {   // Valid height is one above surface level
            const zone = this._zones.find(function(z) {
                return z.leftEdge.x <= coords.x && z.rightEdge.x >= coords.x
            });
            if (zone !== undefined) {
                return zone.id;
            } else {
                console.log(`ERROR: No zone found for X coordinate ${coords.x}`);
                return "";
            }
        } else {
            return "";  // Coordinates are not at surface level
        }
    }

    // Returns the Block data for a set of coordinates for the Engine's Inspect tool
    getBlockForCoords = (coords: Coords) => {
        const col = this._columns[coords.x];
        if (col) {
            const block = col.find(bl => bl._y === coords.y);
            if (block) {
                return block;   // Block exists at coordinates
            } else {
                return null;    // No block found
            }
        } else {
            console.log(`ERROR: Column ${coords.x} not located.`);  // Column not found (throw error warning)
            return null;
        };
    }

    // Returns a boolean for whether or not the selected block is at the surface of its column
    isBlockOnSurface = (b: Block) => {
        const col = this._columns[b._x];
        if (col) {
            const top = col[col.length - 1];
            if (top._y === b._y) {
                return true;
            } else {
                return false;
            }
        }
    }

    setHighlightedBlock = (block: Block | null) => {
        this._highlightedBlock = block;
    }

    // The Engine passes the H-offset (V-offset coming soon) value here so that the blocks' positions are updated with every render; if the sidebar is open then compact = true, causing a smaller area of the map to be shown:
    render = (p5: P5, horizontalOffset: number) => {
        this._horizontalOffset = horizontalOffset;
        // Only render one screen width's worth, taking horizontal offset into account:
        const leftEdge = Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH);    // Edges are in terms of columns
        let rightEdge = 0;
        if (this._expanded) {
            rightEdge = (this._horizontalOffset + constants.SCREEN_WIDTH) / constants.BLOCK_WIDTH;
        } else {
            rightEdge = (this._horizontalOffset + constants.WORLD_VIEW_WIDTH) / constants.BLOCK_WIDTH;
        }
        this._columns.forEach((column, idx) => {
            if (idx >= leftEdge && idx < rightEdge)
            column.forEach((block) => {
                block.render(p5, this._horizontalOffset);     // TODO: Pass offset values to the blocks here
            })
        })
    }

}