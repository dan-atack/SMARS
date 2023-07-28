// The Infrastructure class is the disembodied list of your buildings, and can call building methods.
import P5 from "p5";
import InfrastructureData from "./infrastructureData";
import Module, { ResourceRequest } from "./module";
import Connector from "./connector";
import { ConnectorInfo, ModuleInfo } from "./server_functions";
import { constants } from "./constants";
import { Resource } from "./economyData";
import { Coords } from "./connector";
import { MapZone } from "./map";
import Map from "./map";

export default class Infrastructure {
    // Infrastructure class types:
    _data: InfrastructureData;  // Unlike other data classes, Infra data will not hold the modules/connectors lists themselves, but will be passed data about their coordinates, etc so that it can perform checks on potential locations' validity
    _modules: Module[]; 
    _connectors: Connector[];
    _horizontalOffset: number;  // Value is in pixels
    _highlightedModule: Module | null;
    _highlightedConnector: Connector | null;    // Infra class controls structure highlighting

    // Map width is passed to the data class at construction to help with base volume calculations
    constructor() {
        this._data = new InfrastructureData();
        this._modules = [];
        this._connectors = [];
        this._horizontalOffset = 0;
        this._highlightedModule = null;  // By default no structures are highlighted
        this._highlightedConnector = null;
    }

    setup = (mapWidth: number) => {
        this._data.setup(mapWidth)
    }

    // SECTION 1 - ADDING MODULES AND CONNECTORS

    // Args: x and y coords and the moduleInfo, plus now the map topography and zone data for ground floor determination. Serial is optional (used for loading modules from a save file)
    addModule = (x: number, y: number, moduleInfo: ModuleInfo, topography: number[], mapZones: MapZone[], serial?: number) => {
        // Whenever a serial number is to be used, update it BEFORE passing it to a constructor:
        this._data.increaseSerialNumber();  // Use the serial if there is one
        const m = new Module(serial ? serial : this._data._currentSerial, x, y, moduleInfo);
        this._modules.push(m);
        // Update base volume data
        const area = this._data.calculateModuleArea(moduleInfo, x, y);
        this._data.updateBaseVolume(area);
        // Update base floor data
        const footprint = this._data.calculateModuleFootprint(area);
        this._data.addModuleToFloors(m._id, footprint, topography, mapZones);
    }

    // Args: start and stop coords, and the connectorInfo. Serial is optional for loading connectors from a save file
    addConnector = (start: Coords, stop: Coords, connectorInfo: ConnectorInfo, map: Map, serial?: number) => {
        this._data.increaseSerialNumber();      // Use the serial if there is one
        const c = new Connector(serial ? serial : this._data._currentSerial, start, stop, connectorInfo)
        this._connectors.push(c);
        // Update base floor data only if connector is of the transport type
        if (connectorInfo.type === "transport") {
            // Determine if the ladder/elevator touches a ground zone
            const bottom = Math.max(start.y, stop.y);   // Bottom has higher y value
            const coords: Coords = { x: start.x, y: bottom };
            const zoneId = map.getZoneIdForCoordinates(coords);
            // Add the zone ID regardless of whether it's found (adds "" if connector is not grounded)
            this._data.addConnectorToFloors(c._id, start, stop, zoneId);
            c.setGroundZoneId(zoneId);
        }
        // Update Serial number generator if its current serial is lower than the serial being loaded
        if (serial && serial > this._data._currentSerial) {
            this._data.setSerialNumber(serial + 1);
        }
    }

    // SECTION 2 - REMOVING MODULES AND CONNECTORS

    removeModule = () => {
        console.log("Removing module.");
    }

    removeConnector = () => {
        console.log("Removing connector.");
    }

    // SECTION 3 - VALIDATING MODULE / CONNECTOR PLACEMENT

    // Top level module placement checker: Calls sub-routines from the data class
    checkModulePlacement = (x: number, y: number, moduleInfo: ModuleInfo, terrain: number[][]) => {
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
            return false;
        }
    }

    //  Takes in data for a new module's location and compares it to all of the other existing modules to look for overlaps
    checkOtherModulesForObstructions = (moduleArea: {x: number, y: number}[]) => {
        let clear = true;               // Set to false if there is any overlap between the map and the proposed new module
        let collisions: number[][] = [];
        this._modules.forEach((mod) => {
            // TODO: Improve efficiency by only checking modules with the same X coordinates?
            const modArea = this._data.calculateModuleArea(mod._moduleInfo, mod._x, mod._y);
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
            const modArea = this._data.calculateModuleArea(mod._moduleInfo, mod._x, mod._y);
            const fp: number[] = [];
            modArea.forEach((pair) => {
                if (!fp.includes(pair.x)) {
                    fp.push(pair.x);
                }
            })
            fp.forEach((column) => {
                footprint.forEach((col) => {
                    // Basic column strength check
                    const canSupport = mod._moduleInfo.columnStrength > 0;
                    if (column === col && mod._y - floor === 1 && canSupport) {
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

    // SECTION 4 - MODULE UPDATER METHODS

    handleHourlyUpdates = (sunlightPercent: number) => {
        // 0 - Produce power modules' outputs
        this.resolveModulePowerGeneration(sunlightPercent);
        // 1- Push outputs from production/power modules
        this.resolveResourceStoragePushes();
        // 2 - Compile, then resolve module resource requests
        const reqs = this.compileModuleResourceRequests();
        this.resolveModuleResourceRequests(reqs);
        // 3 - Deduct maintenance costs
        this.handleModuleMaintenance();
    }

    handleModuleMaintenance = () => {
        this._modules.forEach((mod) => {
            mod.handleMaintenance();
        })
    }

    // SECTION 5 - ECONOMIC / RESOURCE-RELATED METHODS

    // Looks up a module and passes it the given resource data
    addResourcesToModule = (moduleId: number, resource: Resource) => {
        const m = this._modules.find(mod => mod._id === moduleId);
        if (m !== undefined) {
            return m.addResource(resource);
        } else {
            console.log(`Error: Unable to add ${resource[1]} ${resource[0]} to module ${moduleId}. Module ID was not found.`);
        }
        return 0;
    }

    // Does the same thing, but taketh away
    subtractResourceFromModule = (moduleId: number, resource: Resource) => {
        const m = this._modules.find(mod => mod._id === moduleId);
        if (m !== undefined) {
            return m.deductResource(resource);
        } else {
            console.log(`Error: Unable to subtract ${resource[1]} ${resource[0]} from module ${moduleId}. Module ID was not found.`);
            return 0;
        }
    }

    // Tells a given module to complete its production sequence, and punch out the colonist
    resolveModuleProduction = (moduleId: number, colonistId: number) => {
        const mod = this.getModuleFromID(moduleId);
        if (mod) {
            mod.produce();
            mod.punchOut(colonistId);
        } else {
            console.log(`Error: Could not find production data for module ${moduleId}`);
        }
    }

    // Called by the hourly updater to handle modules that generate power autonomously (i.e. with no colonist work action)
    resolveModulePowerGeneration = (sunlightPercent: number) => {
        // Find all Power modules
        const generators = this._modules.filter((mod) => mod._moduleInfo.type === "Power");
        // Call their generation method
        generators.forEach((mod) => {
            mod.generatePower(sunlightPercent);
        })
    }

    compileModuleResourceRequests = () => {
        const reqs: ResourceRequest[] = [];
        this._modules.forEach((mod) => {
            const modReqs = mod.determineResourceRequests();
            modReqs.forEach((req) => {
                reqs.push(req);
            })
        })
        return reqs;
    }

    // Top-level module resource calculator - returns all resource data to the Economy class to amalgamate it
    getAllBaseResources = () => {
        const resources: Resource[] = [];
        this._modules.forEach((mod) => {
            mod._resources.forEach((res) => {
                resources.push(res);
            })
        })
        return resources;
    }

    // Returns array of modules that contain a resource when given a resource tuple (name and quantity sought, in this case)
    // UPDATE: Can optionally be given second argument, lifeSupp, which is a boolean for when a colonist is looking for food/water
    findModulesWithResource = (resource: Resource, lifeSupp?: boolean) => {
        let mods: Module[] = [];  // Prepare to return the list of modules
        this._modules.forEach((mod) => {
            let lifeSupport = mod._moduleInfo.type === "Life Support";
            // If no value for lifeSupp is provided, then ignore Life Support as a criteria (set to be true no matter what)
            if (lifeSupp === undefined) lifeSupport = true;
            const hasCapacity = mod._resourceCapacity().includes(resource[0]);
            const inStock = mod.getResourceQuantity(resource[0]) >= resource[1];   // Compare needed vs available quantity
            if (hasCapacity && inStock && lifeSupport) {
                // console.log(`Module ${mod._data._moduleInfo.name} contains at least ${resource[1]} ${resource[0]}`);
                const r = mod._resources.find((res) => res[0] === resource[0]);
                if (r !== undefined) {
                    mods.push(mod);
                } else {
                    console.log(`Error retrieving resource data for module ${mod._id} (${mod._moduleInfo.name})`);
                    return [];
                }
            }
        });
        return mods;
    }

    // Returns an array of modules that have a given resource among their production outputs
    findModulesWithOutput = (resource: string) => {
        const mods = this._modules.filter((mod) => {
            const outputStrings: string[] = [];
            mod._moduleInfo.productionOutputs?.forEach((res) => outputStrings.push(res[0]));
            return outputStrings.includes(resource);
        });
        return mods;
    }

    // Returns the first module found that has storage space for a given resource; optionally only returns Storage class modules
    findStorageModule = (resource: Resource, storageOnly?: boolean) => {
        // Find all storage modules that can hold the resource
        const storage = this._modules.filter((mod) => mod._moduleInfo.type === "Storage" && mod._resourceCapacity().includes(resource[0]));
        const storageMod = storage.find((mod) => mod.getResourceCapacityAvailable(resource[0]) >= resource[1]);
        // Return the storage module if there is one
        if (storageMod) {
            return storageMod;
        // Else return any module that can hold the given resource, if allowed
        } else if (!(storageOnly) && this._modules.find((m) => m.getResourceCapacityAvailable(resource[0]) >= resource[1])) {
            return this._modules.find((m) => m.getResourceCapacityAvailable(resource[0]) >= resource[1]);
        }
        // If no modules are available return a null
        return null;
    }

    // Handles inter-module resource distribution REQUESTS (i.e. cycles needs/inputs OUT from Storage modules)
    resolveModuleResourceRequests = (reqs: ResourceRequest[]) => {
        reqs.forEach((req) => {
            // 1 Keep track of when the request is satisfied, so that it only gets fulfilled once
            let fulfilled = false;
            // 2 Get modules that A) have the resource, B) aren't the requesting module itself and C) allow resource sharing
            const providers = this._modules.filter((mod) => {
                const hasResource = mod._resourceCapacity().includes(req.resource[0]);
                const notSelf = mod._id !== req.modId;
                const sharing = mod._resourceSharing;
                return (hasResource) && notSelf && sharing;
            });
            // 3 - Initiate transfer if request is not already fulfilled, and provider has at least some of the resource needed
            providers.forEach((mod) => {
                if (!fulfilled && mod.getResourceQuantity(req.resource[0])) {
                    const available = mod.deductResource(req.resource);
                    // Transfer the available amount to the requesting module
                    this.addResourcesToModule(req.modId, [req.resource[0], available]);
                    // console.log(`Transferred ${req.resource[1]} ${req.resource[0]} from ${mod._id} to ${req.modId}`);
                    fulfilled = true;   // Prevent other providers from trying to also answer the call
                }
            })
        })
    }

    // Handles inter-module resource distribution PUSHES (i.e. cycles production outputs INTO storage modules)
    resolveResourceStoragePushes = () => {
        // Find all modules that are in the Production or Power class (i.e. modules with productionOutput resources)
        const pushers = this._modules.filter((mod) => mod._moduleInfo.productionOutputs !== undefined);
        // For each one, for each output, find a Storage class module that can hold its output/s
        pushers.forEach((mod) => {
            mod._moduleInfo.productionOutputs?.forEach((resource) => {
                const storage = this.findStorageModule([resource[0], 1], true);   // Find Storage modules only; at least 1 capacity
                if (storage) {
                    let outputQty = 0;
                    // Only push oxygen if sending module has more than its par (to avoid depressurizing oxygen producers)
                    if (resource[0] === "oxygen") {
                        const supply = mod.getResourceQuantity(resource[0]);
                        const par = Math.ceil(mod.getIndividualResourceCapacity(resource[0]) * mod._resourceAcquiring);
                        const surplus = supply - par;
                        if (surplus > 0) {
                            outputQty = surplus;
                        } else {
                            outputQty = 0;
                        }
                    } else {
                        // For other resources simply try to export everything
                        outputQty = mod.getResourceQuantity(resource[0]);
                    }
                    const storageCapacity = storage.getResourceCapacityAvailable(resource[0]);
                    // Store all output resource quantity if possible; otherwise fill up the container as much as possible
                    let transferred = 0;
                    if (storageCapacity >= outputQty) {
                        transferred = mod.deductResource([resource[0], outputQty]);
                    } else {
                        transferred = mod.deductResource([resource[0], storageCapacity]);
                    }
                    storage.addResource([resource[0], transferred]);
                    // console.log(`Transferred ${transferred} ${resource[0]}\nfrom module ${mod._id}\nto module ${storage._id}`);
                } else {
                    // If no Storage module is available, issue a warning
                    // console.log(`Warning: No module found to store ${resource[0]} from ${mod._moduleInfo.name} ${mod._id}`);
                }
            })
        })
        
    }

    // SECTION 6 - INFRASTRUCTURE INFO API (GETTER FUNCTIONS)

    // Returns the ID of the module nearest to a specific location (v.1 considers X-axis only for proximity calculation)
    findModuleNearestToLocation = (modules: Module[], location: Coords) => {
        let nearestID = 0;              // Prepare to store just the ID of the nearest module
        let distance = 1000000;         // Use an impossibly large value for the default
        modules.forEach((mod) => {
            // Compare each module's coords to the given location (x values only for now)
            const deltaX = Math.abs(mod._x - location.x);
            if (deltaX < distance) {
                distance = deltaX;  // If current module is closer than the previous distance, its delta x is the new value
                nearestID = mod._id;  // And its ID is kept as the default return for this function
            }
        })
        if (nearestID !== 0) {
            return nearestID;
        } else {
            console.log(`Error: No modules found near to coordinates ${location.x}, ${location.y}`);
            return 0;
        }
    }

    // Returns a module's coordinates when given a unique ID
    findModuleLocationFromID = (moduleId: number) => {
        const m = this._modules.find(mod => mod._id === moduleId);
        if (m !== undefined) {
            return { x: m._x, y: m._y + m._height - 1 };  // Add height minus 1 to y value to find floor height
        } else {
            console.log(`Error: Module location data not found for module with ID ${moduleId}`);
            return { x: 0, y: 0 };
        }
    }

    // Returns the module, if there is one, that occupies the given coordinates
    getModuleFromCoords = (coords: Coords) => {
        const module = this._modules.find((mod) => {
            const xRange = mod._x <= coords.x && mod._x + mod._width > coords.x;
            const yRange = mod._y <= coords.y && mod._y + mod._height > coords.y;
            return xRange && yRange;
        })
        if (module) {
            return module;
        } else {
            return null;
        }
    }

    getConnectorFromCoords = (coords: Coords) => {
        const connector = this._connectors.find((con) => {
            const xMatch = con._leftEdge <= coords.x && con._rightEdge >= coords.x;
            const yMatch = con._top <= coords.y && con._bottom >= coords.y;
            return xMatch && yMatch;
        })
        if (connector) {
            return connector;
        } else {
            return null;
        }
    }

    // Returns the whole module when given its ID
    getModuleFromID = (moduleId: number) => {
        const m = this._modules.find(mod => mod._id === moduleId);
        if (m !== undefined) {
            return m;       // Add height minus 1 to y value to find floor height
        } else {
            console.log(`Error: Module data not found for module with ID ${moduleId}`);
            return null;    // Always return a null rather than an undefined in case of an error
        }
    }

    // Highlights the selected structure (if any) and de-highlights all the others (will de-highlight all if no ID is given)
    // If 'module' parameter is false the structure to be highlighted is a Connector
    highlightStructure = (id: number, module: boolean) => {
        // Start by de-highlighting all structures, of both types
        this._highlightedModule = null;
        this._highlightedConnector = null;
        // Structure is a module
        if (module) {
            const mod = this.getModuleFromID(id);
            if (mod) {
                this._highlightedModule = mod;
            }
        // Stucture is a connector
        } else {
            const con = this._connectors.find((con) => con._id === id);
            if (con) {
                this._highlightedConnector = con;
            }
        }
    }

    // SECTION 7 - RENDER ZONE

    render = (p5: P5, horizontalOffset: number) => {
        this._horizontalOffset = horizontalOffset;
        // Only render one screen width's worth, taking horizontal offset into account:
        const leftEdge = Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH);    // Edges are in terms of columns
        const rightEdge = Math.floor(this._horizontalOffset + constants.WORLD_VIEW_WIDTH) / constants.BLOCK_WIDTH;
        this._modules.forEach((module) => {
            if (module._x + module._width >= leftEdge && module._x < rightEdge) {
                module.render(p5, this._horizontalOffset);
                module._isRendered = true;
            } else {
                module._isRendered = false;
            }
        });
        this._connectors.forEach((connector) => {
            // TODO: Check which side is nearest to the left/right sides, using a Connector Data method
            if (connector._rightEdge >= leftEdge && connector._leftEdge < rightEdge) {
                connector.render(p5, this._horizontalOffset);
                connector._isRendered = true;
            } else {
                connector._isRendered = false;
            }
        });
        // Highlight selected structure last, so the highlight is always on the 'top' of the P5 image stack
        if (this._highlightedModule && this._highlightedModule._isRendered) {
            const x = this._highlightedModule._x * constants.BLOCK_WIDTH - this._highlightedModule._xOffset;
            const y = this._highlightedModule._y * constants.BLOCK_WIDTH;
            const w = this._highlightedModule._width * constants.BLOCK_WIDTH;
            const h = this._highlightedModule._height * constants.BLOCK_WIDTH;
            p5.noFill();
            p5.strokeWeight(4);
            p5.stroke(constants.GREEN_TERMINAL);
            p5.rect(x, y, w, h, 4, 4, 4, 4);
        } else if (this._highlightedConnector && this._highlightedConnector._isRendered) {
            // Highlight Connector
            const x = this._highlightedConnector._leftEdge * constants.BLOCK_WIDTH - this._highlightedConnector._xOffset;
            const y = this._highlightedConnector._top * constants.BLOCK_WIDTH;
            const w = this._highlightedConnector._orientation === "vertical" ? constants.BLOCK_WIDTH : (this._highlightedConnector._length + 1) * constants.BLOCK_WIDTH;
            const h = this._highlightedConnector._orientation === "vertical" ? (this._highlightedConnector._length + 1) * constants.BLOCK_WIDTH : constants.BLOCK_WIDTH;
            p5.noFill();
            p5.strokeWeight(4);
            p5.stroke(constants.GREEN_TERMINAL);
            p5.rect(x, y, w, h, 4, 4, 4, 4);
        }
        p5.strokeWeight(2);
        p5.stroke(0);
    }

    reset = () => {
        this._modules = [];
        this._connectors = [];
        this._data._justBuilt = null;
    }

}