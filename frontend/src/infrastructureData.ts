// The InfrastructureData class handles all of the data processing and structure placement determination tasks for the infrastructure class, without any rendering tasks
import { ConnectorInfo, ModuleInfo } from "./server_functions";
import { Coords } from "./connectorData";
import { constants } from "./constants";

export default class InfrastructureData {
    // Infra Data class is mostly a calculator for the Infra class to pass values to, so it stores very few of them itself
    _justBuilt: ModuleInfo | ConnectorInfo | null;
    _baseVolume: number[][];    // Works the same as the terrain map, but to keep track of the base's inner area

    constructor() {
        this._justBuilt = null; // When a building has just been added, set this to the building's data
        this._baseVolume = [];  // Starts with just an array - setup sets its length
    }

    setup (mapWidth: number) {
        if (this._baseVolume.length === 0) {
            for(let i = 0; i < mapWidth; i++) {
                this._baseVolume.push([]);
            }
        } else {
            console.log("WARNING: An attempt has been made to set the base volume but it already has a value.");
        }
    }

    // GENERIC CHECKS - CAN BE USED BY MODULES OR CONNECTORS

    // Takes in data for a new module OR CONNECTOR's location and the game's terrain data and looks for any overlaps
    checkTerrainForObstructions (area: {x: number, y: number}[], terrain: number[][], ) {
        let clear = true;               // Set to false if there is any overlap between the map and the proposed new module
        let collisions: number[][] = [];  // Keep track of the coordinates of any collisions (obstructions) that are detected
        const rightEdge = area[0].x;  // Get x coordinates of the right and left edges of the module
        const leftEdge = area[area.length - 1].x;
        // Check only the map columns that match the module area's x coordinates:
        const cols: number[][] = [];
        for (let i = 0; i < terrain.length; i++) {
            if (i >= rightEdge && i <= leftEdge) {
                cols.push(terrain[i]);
            }
        }
        cols.forEach((column, idx) => {
            area.forEach((coordPair) => {
                // Match each module column with each terrain column
                if (coordPair.x === rightEdge + idx) {
                    // Invert y value from the mouse click
                    const y = constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - coordPair.y - 1;
                    column.forEach((block, jdx) => {
                        if (block && jdx === y) {
                            collisions.push([rightEdge + idx, coordPair.y])
                            clear = false;
                        }
                    })
                }
            })
        })
        // If there is no obstruction we get a 'true' here; otherwise return the coordinates that overlap.
        if (clear) {
            return true;
        } else {
            return collisions;
        }
    }

    checkFootprintWithTerrain (floor: number, footprint: number[], terrain: number[][]) {
        let okay = true;            // Like the other checks, set this to false if there are any gaps under the requested location
        let gaps: number[] = [];  // If there are any gaps, keep track of their locations
        // Compare footprint to map - don't forget to invert the y-value!
        const y = constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - floor - 1;
        terrain.forEach((col, idx) => {
            // Set okay to false and add a gap if the last non-zero number in the list is not exactly y - 1
            if (footprint.includes(idx)) {
                // To make sure you only say there's terrain if there is a block, make sure it's a number and that it's non-zero
                if (typeof col[y - 1] == "number" && col[y - 1] != 0) {
                } else {
                    okay = false;
                    gaps.push(idx);
                }
            } 
        })
        // If there are no gaps we get a 'true' here; otherwise return the coordinates where there is no floor:
        if (okay) {
            return true;
        } else {
            return gaps;
        }
    }

    // MODULE CHECKS

    // Determines if the new building is a module or a connector:
    isModule (building: ModuleInfo | ConnectorInfo): building is ModuleInfo {
        return (building as ModuleInfo).pressurized !== undefined
    }

    // Takes in data for a new module and grid coordinates for its location, returns a list of the grid locations it will occupy
    calculateModuleArea (moduleInfo: ModuleInfo, mouseX: number, mouseY: number) {
        const w = moduleInfo.width;
        const h = moduleInfo.height;
        let coords: {x: number, y: number}[] = [];
        for (let i = 0; i < w; i++) {
            for (let k = 0; k < h; k++)  {
                coords.push({x: i + mouseX, y: k + mouseY});
            }
        }
        return coords;
    }

    // Takes in the moduleArea data (returned from the method above) and returns a two-part array, consisting of: the module's "floor" (a single y value) and its "footprint" (the x value of each column to be occupied)
    calculateModuleFootprint (moduleArea: {x: number, y: number}[]) {
        let floor: number = moduleArea[0].y;
        // Get the highest y value to establish the height of the module's "floor"
        moduleArea.forEach((pair) => {
            if (pair.y > floor) floor = pair.y;
        })
        // Get all unique x values to establish the module's "footprint"
        const footprint: number[] = [];
        moduleArea.forEach((pair) => {
            if (!footprint.includes(pair.x)) {
                footprint.push(pair.x);
            }
        })
        return {
            floor: floor,
            footprint: footprint
        }
    }

    // CONNECTOR CHECKS

    // Top-level Connector INITIAL placement validation function - x and y are grid locations
    checkConnectorInitialPlacement (x: number, y: number, terrain: number[][]) {
        const coords = [{x: x, y: y}];  // Make a list of coordinate pairs, containing the selected location
        const unobstructed = this.checkTerrainForObstructions(coords, terrain);
        const grounded = this.checkFootprintWithTerrain(y, [x], terrain);
        const inside = this.checkIsInsideBase(x, y);
        // If grounded is a list, the Connector is not grounded
        if (unobstructed === true && grounded === true || inside === true) {
            return true;
        } else {
            return false;
        }
    }

    // Checks if a pair of coordinates is inside the base volume
    checkIsInsideBase (x: number, y: number) {
        const col = this._baseVolume[x];
        if (col.includes(y)) {
            return true;
        } else {
            return false;
        }
    }

    // BASE MAPPING METHODS

    // Updates the 'volume map' of the base's structures
    updateBaseVolume (moduleArea: Coords[]) {
        // For each set of coordinates, add the y coordinate to the xth list in the base's volume. Re-sort columns as needed
        moduleArea.forEach((coords) => {
            // Check if coordinate is already present
            if (!(this._baseVolume[coords.x].includes(coords.y))) {
                this._baseVolume[coords.x].push(coords.y);
                this._baseVolume[coords.x].sort((a: number, b: number) => a - b);
            } else {
                console.log(`WARNING: Not adding coords ${coords.x}, ${coords.y} due to overlap with existing volume.`);
            }
        })
    }
}