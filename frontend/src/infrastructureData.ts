// The InfrastructureData class handles all of the data processing and structure placement determination tasks for the infrastructure class, without any rendering tasks
import { ConnectorInfo, ModuleInfo } from "./server_functions";
import { Coords } from "./connector";
import { Resource } from "./economyData";
import Floor from "./floor";
import { constants } from "./constants";
import { MapZone } from "./map";

export type Elevator = { id: number, x: number, top: number, bottom: number, groundZoneId: string }

export default class InfrastructureData {
    // Infra Data class is mostly a calculator for the Infra class to pass values to, so it stores very few of them itself
    _justBuilt: ModuleInfo | ConnectorInfo | null;
    _currentSerial: number;     // A crude but hopefully effective method of ID-ing structures as they're created
    _baseVolume: number[][];    // Works the same as the terrain map, but to keep track of the base's inner area
    _floors: Floor[];           // Floors are a formation of one or more modules, representing walkable surfaces within the base
    _elevators: Elevator[]    // Basic data to keep track of inter-floor connectors
    _moduleResources: Resource[];   // The data that will be passed to the Economy class

    constructor() {
        this._justBuilt = null;         // When a building has just been added, set this to the building's data
        this._currentSerial = 1000;     // We'll start with a 4-digit number just to make ID's stand out a bit
        this._baseVolume = [];          // Starts with just an array - setup sets its length
        this._floors = [];
        this._elevators = [];
        this._moduleResources = [
            ["money", 0],
            ["oxygen", 0],
            ["water", 0],
            ["food", 0],
            ["power", 0],
            ["equipment", 0],
            ["minerals", 0]
        ];
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
    addModuleToFloors (moduleId: number, footprint: {floor: number, footprint: number[]}, topography: number[], mapZones: MapZone[]) {
        const fp = footprint.footprint;
        const elev = footprint.floor;
        // Check if an existing floor can be added to; if not, create a new one
        const existingFloors = this.findFloorsAtElevation(elev);
        if (existingFloors.length === 0) {
            // Add a new floor
            this.addNewFloor(elev, fp, moduleId, topography, mapZones);
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
                this.addNewFloor(elev, fp, moduleId, topography, mapZones);
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
    addConnectorToFloors (connectorId: number, start: Coords, stop: Coords, groundZoneId: string) {
        // First, register the connector as an 'elevator' (inter-floor connection)
        const bottom = Math.max(start.y, stop.y);
        const top = Math.min(start.y, stop.y);
        const left = Math.min(start.x, stop.x);
        const right = Math.max(start.x, stop.x);
        this._elevators.push({ id: connectorId, x: start.x, top: top, bottom: bottom, groundZoneId: groundZoneId });
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
                    const floor = this._floors.find(fl => fl._id === floorId);    // Find the floor and ensure it exists
                    if (floor !== undefined) {
                        floor._connectors.push(ladder.id);
                    }
                }
            }
        })
    }

    // Intermediate-level Floor management methods

    // Returns a list of floors
    findFloorsAtElevation (elevation: number) {
        return this._floors.filter((floor) => floor._elevation === elevation);
    }

    // Creates a new floor, initially comprised of a single module
    addNewFloor (elevation: number, footprint: number[], moduleId: number, topography: number[], mapZones: MapZone[]) {
        // Always update serial number first
        this.increaseSerialNumber();
        // Sort the footprint to ensure it goes from left to right
        footprint.sort((a,b) => a - b);
        const f = new Floor(this._currentSerial, elevation);
        f.addModule(moduleId, footprint);
        this._floors.push(f);
        this.addConnectorsToNewFloor(this._currentSerial, elevation, footprint);
        // Determine if the new module is on the ground, and if so, add the zone info to its floor data
        const groundFloorZones = this.determineFloorGroundZones(topography, mapZones, elevation, footprint);
        if (groundFloorZones.length > 0) {
            f.setGroundFloorZones(groundFloorZones);
        }
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

    // FLOOR INFORMATION GETTERS
    
    // Takes a module ID and returns the floor that contains it
    getFloorFromModuleId (moduleId: number) {
        const floor = this._floors.find((fl) => fl._modules.includes(moduleId));
        if (floor !== undefined) {
            return floor;
        } else {
            console.log(`Error: No floor found containing module with ID ${moduleId}`);
            return null;    // Always return null instead of undefined if the floor is not found
        }
    }

    // Takes the ID for a floor itself and returns that floor
    getFloorFromId (floorId: number) {
        const floor = this._floors.find((fl) => fl._id === floorId);
        if (floor !== undefined) {
            return floor;
        } else {
            console.log(`Error: Floor with ID ${floorId} not found.`);
            return null;
        }
    }

    // Takes a set of coordinates and returns the whole floor (if any) that those coords stand atop of
    getFloorFromCoords (coords: Coords) {
        const floor = this._floors.find((fl) => {
            return fl._elevation === coords.y && fl._leftSide <= coords.x && fl._rightSide >= coords.x;
        })
        if (floor !== undefined) {
            return floor;
        } else {
            console.log(`Coordinates (${coords.x}, ${coords.y}) are not on any floor`);
            return null;
        }
    }

    // Takes an elevator ID and returns all of the Floors that have that ID in their connectors list
    getFloorsFromElevatorId (elevatorId: number) {
        const floors = this._floors.filter((fl) => {
            return fl._connectors.includes(elevatorId);
        })
        return floors;
    }

    // Takes and elevator (ladder) ID and returns the data for that elevator
    getElevatorFromId (elevatorId: number) {
        const elevator = this._elevators.find((el) => el.id === elevatorId);
        if (elevator !== undefined) {
            return elevator;
        } else {
            console.log(`Error: No elevator with ID ${elevatorId} found.`);
            return null;    // Always return null instead of undefined when something is missing
        }
    }

    // Takes an elevator ID and a floor ID and returns a boolean for whether or not they meet
    doesElevatorReachFloor (floorId: number, elevatorId: number) {
        const floor = this._floors.find((fl) => fl._id === floorId);
        const elevator = this._elevators.find((el) => el.id === elevatorId);
        if (floor !== undefined && elevator !== undefined) {
            if (floor._connectors.includes(elevatorId)) {
                return true;
            } else {
                return false;
            }
        } else if (floor !== undefined) {
            console.log(`Error: Could not find elevator with ID ${elevatorId}`);
            return false;
        } else {
            console.log(`Error: Could not find Floor with ID ${floorId}`);
            return false;
        }
    }

    // Determines if a Floor is on the ground when it is created/expanded. A Floor can have 0 to many ground floor zones
    determineFloorGroundZones (topography: number[], mapZones: MapZone[], elevation: number, footprint: number[]) {
        const zones: MapZone[] = [];
        const ids: string[] = [];       // Keep track of IDs of zones added
        // Check each column in the footprint against the topography map
        footprint.forEach((col) => {
            if (topography[col] - 1 === elevation) {  // Floor elevation is one higher (lower!) than topography to be on top of it
                // Find the zone that contains the current column
                const zone = mapZones.find(function(z) {
                    return z.leftEdge.x <= col && z.rightEdge.x >= col
                })
                // If the zones list does not already include this zone, then add it
                if (zone !== undefined && !(ids.includes(zone.id))) {
                    zones.push(zone);
                    ids.push(zone.id);
                }
            }
        })
        return zones;
    }

    // TODO: Consider what happens if a floor is not on the ground level in its own columns (i.e. is over some kind of basement) but is flush with the ground level of the adjacent column/s
    // isFloorFlushWithGround () {
        
        // E.G. Like this:
        //
        //
        //          |    Floor    |
        //----------===============--------
        // Ground   | Lower Floor | Ground   

    // }

    

}