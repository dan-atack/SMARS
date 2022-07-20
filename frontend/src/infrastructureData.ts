// The InfrastructureData class handles all of the data processing and structure placement determination tasks for the infrastructure class, without any rendering tasks
import { ConnectorInfo, ModuleInfo } from "./server_functions";
import { Coords } from "./connectorData";
import Floor from "./floor";
import { constants } from "./constants";

export default class InfrastructureData {
    // Infra Data class is mostly a calculator for the Infra class to pass values to, so it stores very few of them itself
    _justBuilt: ModuleInfo | ConnectorInfo | null;
    _currentSerial: number;     // A crude but hopefully effective method of ID-ing structures as they're created
    _baseVolume: number[][];    // Works the same as the terrain map, but to keep track of the base's inner area
    _floors: Floor[];           // Floors are a formation of one or more modules, representing walkable surfaces within the base
    _elevators: { id: number, x: number, top: number, bottom: number }[]    // Basic data to keep track of inter-floor connectors

    constructor() {
        this._justBuilt = null;         // When a building has just been added, set this to the building's data
        this._currentSerial = 1000;     // We'll start with a 4-digit number just to make ID's stand out a bit
        this._baseVolume = [];          // Starts with just an array - setup sets its length
        this._floors = [];
        this._elevators = [];
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

    // SERIAL NUMBER UPDATERS

    increaseSerialNumber () {
        this._currentSerial++;
    }

    setSerialNumber (value: number) {
        this._currentSerial = value;
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

    // Top-level Connector endpoint placement validation function - x and y are grid locations
    checkConnectorEndpointPlacement (x: number, y: number, terrain: number[][]) {
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

    // TODO (?) Make a function that performs a more limited feasibility test on connector in-between sections??

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

    // Updates the 'volume map' of the base's structures with a set of coordinates (could be updated to add/remove said coords)
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

    // FLOOR-RELATED METHODS

    // Top-level update method for adding new modules
    addModuleToFloors (moduleId: number, footprint: {floor: number, footprint: number[]}) {
        const fp = footprint.footprint;
        const elev = footprint.floor;
        // Check if an existing floor can be added to; if not, create a new one
        const existingFloors = this.findFloorsAtElevation(elev);
        if (existingFloors.length === 0) {
            // Add a new floor
            this.addNewFloor(elev, fp, moduleId);
        } else {
            // Keep a list of how many floors the new module footprint is adjacent to
            let adjacents: Floor[] = [];
            // Check if new module is adjacent to existing floor edges (for each floor if there are several)
            existingFloors.forEach((floor) => {
                if (floor.checkIfAdjacent(fp)[0]) {
                    adjacents.push(floor);
                }
            })
            if (adjacents.length === 0) {
                // Create a new floor if no existing floor is adjacent
                this.addNewFloor(elev, fp, moduleId);
            } else if (adjacents.length === 1) {
                // Add module ID to existing floor is one is adjacent
                adjacents[0].addModule(moduleId, fp);
            } else if (adjacents.length === 2) {
                // Merge two existing floors if they are both adjacent to the new one (in which case it's right between them)
                this.combineFloors(existingFloors[0]._id, existingFloors[1]._id, moduleId);
            }
        }
    }

    // Top-level method for adding new connectors
    addConnectorToFloors (connectorId: number, start: Coords, stop: Coords) {
        // First, register the connector as an 'elevator' (inter-floor connection)
        const bottom = Math.max(start.y, stop.y);
        const top = Math.min(start.y, stop.y);
        const left = Math.min(start.x, stop.x);
        const right = Math.max(start.x, stop.x);
        this._elevators.push({ id: connectorId, x: start.x, top: top, bottom: bottom });
        // Check for floors intersected by a new connector; add the new connector to their list if they overlap
        this._floors.forEach((floor) => {
            const yMatch = floor._elevation >= top && floor._elevation <= bottom;
            const xMatch = floor._leftSide <= left && floor._rightSide >= right;
            if (yMatch && xMatch) {
                floor._connectors.push(connectorId);
            }
        })
    }

    // Check each existing connector and if it overlaps a newly added floor, add its ID to that floor's connectors list
    addConnectorsToNewFloor (floorId: number, elevation: number, footprint: number[]) {
        this._elevators.forEach((ladder) => {
            if (footprint.includes(ladder.x)) {
                if (ladder.bottom >= elevation && ladder.top <= elevation) {
                    const floor = this._floors.find(con => con._id === floorId);
                    if (floor !== undefined) {
                        floor._connectors.push(ladder.id);
                    }
                }
            }
        })
    }

    // Intermediate-level Floor management methods

    findFloorsAtElevation (elevation: number) {
        return this._floors.filter((floor) => floor._elevation === elevation);
    }

    // Creates a new floor, initially comprised of a single module
    addNewFloor (elevation: number, footprint: number[], moduleId: number) {
        // Always update serial number first
        this.increaseSerialNumber();
        // Sort the footprint to ensure it goes from left to right
        footprint.sort((a,b) => a - b);
        const f = new Floor(this._currentSerial, elevation);
        f.addModule(moduleId, footprint);
        this._floors.push(f);
        this.addConnectorsToNewFloor(this._currentSerial, elevation, footprint);
    }

    // Deletes the second of two floors involved in a merger to avoid data duplication
    deleteFloor (floorId: number) {
        const len = this._floors.length;
        // Filter out a specific ID
        this._floors = this._floors.filter(floor => floor._id != floorId);
        // Log a warning if no floor was found for the given ID, or if multiple floors were deleted
        if (len - this._floors.length > 1) {
            console.log(`Removed ${len - this._floors.length} floors!`);
        } else if (len - this._floors.length < 1) {
            console.log(`Warning: No floor with ID ${floorId} was found for deletion.`)
        }
    }

    // Add all modules and connectors from floor 2 to floor 1 and update left/right edge values, then delete floor 2
    combineFloors (floorId1: number, floorId2: number, moduleId: number) {
        // Find the two floors that will be merged
        const floorA = this._floors.find(floor => floor._id === floorId1);
        const floorB = this._floors.find(floor => floor._id === floorId2);
        if (floorA != undefined && floorB != undefined) {
            floorB._modules.forEach((mod) => {
                floorA._modules.push(mod);  // Add all of floor B's modules to floor A first
            })
            floorA._modules.push(moduleId); // Add the new module's ID to floor A
            if (floorA._leftSide > floorB._leftSide) {  // Recalculate Footprint:
                floorA._leftSide = floorB._leftSide;    // If B has a smaller value, its left side is further left
            }
            if (floorA._rightSide < floorB._rightSide) {
                floorA._rightSide = floorB._rightSide;  // If B has a greater value, its right side is further right
            }
            this.deleteFloor(floorId2);
        } else {
            console.log(`Warning: Floor ${floorA === undefined ? floorId1 : floorId2} could not be found for merger.`);
        }
        
    }
}