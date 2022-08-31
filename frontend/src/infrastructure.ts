// The Infrastructure class is the disembodied list of your buildings, and can call building methods.
import P5 from "p5";
import InfrastructureData from "./infrastructureData";
import Module from "./module";
import Connector from "./connector";
import { ConnectorInfo, ModuleInfo } from "./server_functions";
import { constants } from "./constants";
import { Resource } from "./economyData";
import { Coords } from "./connectorData";
import { MapZone } from "./mapData";

export default class Infrastructure {
    // Infrastructure class types:
    _data: InfrastructureData;  // Unlike other data classes, Infra data will not hold the modules/connectors lists themselves, but will be passed data about their coordinates, etc so that it can perform checks on potential locations' validity
    _modules: Module[]; 
    _connectors: Connector[];
    _horizontalOffset: number;  // Value is in pixels

    // Map width is passed to the data class at construction to help with base volume calculations
    constructor() {
        this._data = new InfrastructureData();
        this._modules = [];
        this._connectors = [];
        this._horizontalOffset = 0;
    }

    setup(mapWidth: number) {
        this._data.setup(mapWidth)
    }

    // Args: x and y coords and the moduleInfo, plus now the map topography and zone data for ground floor determination. Serial is optional (used for loading modules from a save file)
    addModule (x: number, y: number, moduleInfo: ModuleInfo, topography: number[], mapZones: MapZone[], serial?: number) {
        // Whenever a serial number is to be used, update it BEFORE passing it to a constructor:
        this._data.increaseSerialNumber();  // Use the serial if there is one
        const m = new Module(serial ? serial : this._data._currentSerial, x, y, moduleInfo);
        this._modules.push(m);
        // Update base volume data
        const area = this._data.calculateModuleArea(moduleInfo, x, y);
        this._data.updateBaseVolume(area);
        // Update base floor data
        const footprint = this._data.calculateModuleFootprint(area);
        this._data.addModuleToFloors(m._data._id, footprint, topography, mapZones);
    }

    // Args: start and stop coords, and the connectorInfo. Serial is optional for loading connectors from a save file
    addConnector (start: Coords, stop: Coords, connectorInfo: ConnectorInfo, serial?: number) {
        this._data.increaseSerialNumber();      // Use the serial if there is one
        const c = new Connector(serial ? serial : this._data._currentSerial, start, stop, connectorInfo)
        this._connectors.push(c);
        // Update base floor data only if connector is of the transport type
        if (connectorInfo.type === "transport") {
            this._data.addConnectorToFloors(c._data._id, start, stop);
        }
        // Update Serial number generator if its current serial is lower than the serial being loaded
        if (serial && serial > this._data._currentSerial) {
            this._data.setSerialNumber(serial + 1);
        }
    }

    // Top level module placement checker: Calls sub-routines from the data class
    checkModulePlacement (x: number, y: number, moduleInfo: ModuleInfo, terrain: number[][]) {
        const moduleArea = this._data.calculateModuleArea(moduleInfo, x, y);
        const {floor, footprint} = this._data.calculateModuleFootprint(moduleArea);
        // Check other modules, then the map, for any obstructions:
        const modClear = this.checkOtherModulesForObstructions(moduleArea);
        const mapClear = this._data.checkTerrainForObstructions(moduleArea, terrain);
        // Next, check the existing modules to see if they can support the new one; if they can't, then check the terrain
        const modFloor = this.checkModuleFootprintWithExistingModules(moduleArea);
        let mapFloor: number[] | boolean = [];
        if (modFloor !== true) {
            // If modFloor comes back as anything other than 'true', it will be a list of the columns that aren't supported by an existing module, and we run THAT through the terrain support detector:
            mapFloor = this._data.checkFootprintWithTerrain(floor, modFloor, terrain);
        }
        if (mapClear === true && modClear === true && (modFloor === true || mapFloor === true)) {
            return true;
        } else {
            // If map/module 'clear' value is not equal to true then it is a list of the coordinates that are obstructed
            // console.log(`Module obstructions: ${modClear === true ? 0 : modClear.length}`);
            // console.log(`Map obstructions: ${mapClear === true ? 0 : mapClear.length}`);
            // console.log(`Terrain gaps underneath module: ${mapFloor}`);
            // console.log(`Module gaps underneath module: ${modFloor}`);
            return false;
        }
    }

    //  Takes in data for a new module's location and compares it to all of the other existing modules to look for overlaps
    checkOtherModulesForObstructions (moduleArea: {x: number, y: number}[]) {
        let clear = true;               // Set to false if there is any overlap between the map and the proposed new module
        let collisions: number[][] = [];
        this._modules.forEach((mod) => {
            // TODO: Improve efficiency by only checking modules with the same X coordinates?
            const modArea = this._data.calculateModuleArea(mod._data._moduleInfo, mod._data._x, mod._data._y);
            modArea.forEach((coordPair) => {
                moduleArea.forEach((coords) => {
                    if (coordPair.x === coords.x && coordPair.y === coords.y) {
                        clear = false;
                        collisions.push([coordPair.x, coordPair.y]);
                    }
                })
            })
        })
        // If there is no obstruction we get a 'true' here; otherwise return the coordinates that overlap.
        if (clear) {
            return true;
        } else {
            return collisions;
        }
    }

    // For the integrated footprint check, we'll run this one AND THEN the terrain one, to allow modules to rest on a combination of other modules and clear ground
    checkModuleFootprintWithExistingModules = (moduleArea: {x: number, y: number}[]) => {
        let okay = true;    // This will be reset to false UNLESS every column in the footprint is on top of an existing module
        let supportedColumns: number[] = [];    // Keep track of all columns that ARE supported as we loop thru everything...
        let gaps: number[] = [];    // ... Once all existing modules have been checked, then we can see where the gaps are
        const {floor, footprint} = this._data.calculateModuleFootprint(moduleArea);
        // Check each column of each existing module to see if its 'roof' (y-value) is one level below the 'floor' of the proposed new module
        this._modules.forEach((mod) => {
            const modArea = this._data.calculateModuleArea(mod._data._moduleInfo, mod._data._x, mod._data._y);
            const fp: number[] = [];
            modArea.forEach((pair) => {
                if (!fp.includes(pair.x)) {
                    fp.push(pair.x);
                }
            })
            fp.forEach((column) => {
                footprint.forEach((col) => {
                    // Basic column strength check
                    const canSupport = mod._data._moduleInfo.columnStrength > 0;
                    if (column === col && mod._data._y - floor === 1 && canSupport) {
                        supportedColumns.push(col);
                    }
                })
            })
        })
        // If there are any columns in the new module's footprint that aren't supported, we must go on to check the terrain
        if (!(supportedColumns.length === footprint.length)) {
            okay = false;
            // Update the 'gaps' list to include just the x values that aren't in the supported columns list
            gaps = footprint.filter(x => !supportedColumns.includes(x));
        }
        if (okay) {
            return true // This is the return if the new module is entirely on top of existing modules
        } else {
            // If there are some 'gaps' then return that list, to pass to the terrain footprint checker
            return gaps;
        }
    }

    // ECONOMIC / RESOURCE-RELATED METHODS

    // Looks up a module and passes it the given resource data
    addResourcesToModule (moduleId: number, resource: Resource) {
        const m = this._modules.find(mod => mod._data._id === moduleId);
        if (m !== undefined) {
            m._data.addResource(resource);
        } else {
            console.log(`Unable to add ${resource[1]} ${resource[0]} to module ${moduleId}. Module ID was not found.`);
        }
    }

    // Returns array of modules when given a resource tuple (name and quantity sought, in this case)
    findModulesWithResource (resource: Resource) {
        let mods: Module[] = [];  // Prepare to return the list of modules
        this._modules.forEach((mod) => {
            const hasCapacity = mod._data._resourceCapacity().includes(resource[0]);
            const inStock = mod._data.getResourceQuantity(resource[0]) > resource[1];   // Compare needed vs available quantity
            if (hasCapacity && inStock) {
                // console.log(`Module ${mod._data._moduleInfo.name} contains at least ${resource[1]} ${resource[0]}`);
                const r = mod._data._resources.find((res) => res[0] === resource[0]);
                if (r !== undefined) {
                    mods.push(mod);
                } else {
                    console.log(`Error retrieving resource data for module ${mod._data._id} (${mod._data._moduleInfo.name})`);
                }
            }
        });
        return mods;
    }

    // Returns the ID of the module nearest to a specific location (v.1 considers X-axis only for proximity calculation)
    findModuleNearestToLocation (modules: Module[], location: Coords) {
        let nearestID = 0;              // Prepare to store just the ID of the nearest module
        let distance = 1000000;         // Use an impossibly large value for the default
        modules.forEach((mod) => {
            // Compare each module's coords to the given location (x values only for now)
            const deltaX = Math.abs(mod._data._x - location.x);
            if (deltaX < distance) {
                distance = deltaX;  // If current module is closer than the previous distance, its delta x is the new value
                nearestID = mod._data._id;  // And its ID is kept as the default return for this function
            }
        })
        if (nearestID !== 0) {
            // console.log(`Nearest module for colonist at ${location.x}: ${nearestID}`);
            return nearestID;
        } else{
            console.log(`Error: No modules found near to coordinates ${location.x}, ${location.y}`);
            return 0;
        }
    }

    // Returns a module's coordinates when given a unique ID
    findModuleLocationFromID (moduleId: number) {
        const m = this._modules.find(mod => mod._data._id === moduleId);
        if (m !== undefined) {
            return { x: m._data._x, y: m._data._y + m._data._height };  // Add height to y value to find floor height
        }
    }

    // Top-level module resource calculator - returns all resource data to the Economy class to amalgamate it
    getAllBaseResources = () => {
        const resources: Resource[] = [];
        this._modules.forEach((mod) => {
            mod._data._resources.forEach((res) => {
                resources.push(res);
            })
        })
        return resources;
    }

    // Returns a list of life-support type modules containing a certain resource
    getModulesWithResource = (resource: string) => {
        const modules: Module[] = [];
        this._modules.forEach((module) => {
            // TODO: Separate conditions to increase readability and add a check for the resource quantity as well
            if (module._data._resourceCapacity().includes(resource) && module._data._moduleInfo.type === "Life Support") {
                modules.push(module);
            }
        })
        return modules;
    }

    // Basic oxygen loss calculator
    calculateModulesOxygenLoss = () => {
        const loss_rate = 1;
        return loss_rate * this._modules.length;   
    }

    // Unset missing resources and just built flags:
    resetFlags() {
        this._data._justBuilt = null;
    }

    render(p5: P5, horizontalOffset: number) {
        this._horizontalOffset = horizontalOffset;
        // Only render one screen width's worth, taking horizontal offset into account:
        const leftEdge = Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH);    // Edges are in terms of columns
        const rightEdge = Math.floor(this._horizontalOffset + constants.WORLD_VIEW_WIDTH) / constants.BLOCK_WIDTH;
        this._modules.forEach((module) => {
            if (module._data._x + module._data._width >= leftEdge && module._data._x < rightEdge) {
                module.render(p5, this._horizontalOffset);

                module._data._isRendered = true;
            } else {
                module._data._isRendered = false;
            }
        });
        this._connectors.forEach((connector) => {
            // TODO: Check which side is nearest to the left/right sides, using a Connector Data method
            if (connector._data._rightEdge >= leftEdge && connector._data._leftEdge < rightEdge) {
                connector.render(p5, this._horizontalOffset);
            }
        });
    }

    reset() {
        this._modules = [];
        this._connectors = [];
        this._data._justBuilt = null;
    }

}