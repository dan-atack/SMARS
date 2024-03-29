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
import Population from "./population";

export default class Infrastructure {
    // Infrastructure class types:
    _data: InfrastructureData;  // Unlike other data classes, Infra data will not hold the modules/connectors lists themselves, but will be passed data about their coordinates, etc so that it can perform checks on potential locations' validity
    _modules: Module[]; 
    _connectors: Connector[];
    _horizontalOffset: number;                  // Value is in pixels
    _highlightedModule: Module | null;
    _highlightedConnector: Connector | null;    // Infra class controls structure highlighting
    _essentialStructures: string[];             // Essential structures is a list of names of modules that cannot be removed by the player
    _messages: { subject: string, id: number, text: string }[]; // Keep track of messages from individual modules, to pass to the Engine

    // Map width is passed to the data class at construction to help with base volume calculations
    constructor() {
        this._data = new InfrastructureData();
        this._modules = [];
        this._connectors = [];
        this._horizontalOffset = 0;
        this._highlightedModule = null;  // By default no structures are highlighted
        this._highlightedConnector = null;
        this._essentialStructures = [
            "Comms Antenna"
        ];
        this._messages = [];
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
        // Update Serial number generator if its current serial is lower than the serial being loaded
        if (serial && serial > this._data._currentSerial) {
            this._data.setSerialNumber(serial + 1);     // This results in some gaps in the serial number system, but it's better to have gaps than overlaps!
        }
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


    // SECTION 2A: Top level removal methods

    // Returns a message to be displayed to the player regarding the outcome of the removal attempt
    removeModule = (mod: Module, population: Population, map: Map) => {
        // STAGE ONE: Hard Checks
        const removable = this.hardChecksForModuleRemoval(mod, population); // Either true, or a string containing the check/s that failed
        let outcome: { success: boolean, message: string } = { success: true, message: "" };
        if (removable === true) {
            // STAGE TWO: Soft Checks - Rather than a top-level soft checks method, call each of these checks individually
            const moduleEmpty = this.checkIfModuleIsEmpty(mod);                 // Check for resources
            this.checkModuleRemovalWillNotStrand(mod, population);              // Check if removal will strand a colonist
            // TODO: Add a separate notification message / confirmation popup when a soft check is failed
            // Call sub-routines for module removal:
            if (!moduleEmpty) {
                this.purgeResourcesFromRemovedModule(mod);        // Purge resources if they are present
            }
            this.updateBaseVolumeForRemovedModule(mod);                         // Update base volume
            this.updateFloorsForRemovedModule(mod, map);                             // Update floors
            this._modules = this._modules.filter((m) => m._id !== mod._id);     // Filter out the module by its ID
            population.resolveGoalsWhenStructureRemoved(mod._id);               // Tell colonists to forget about it
            outcome.message = `Demolished\n${mod._moduleInfo.name}`;        // Update outcome message if removal is successful
            return outcome;
        } else {
            outcome.success = false;
            outcome.message = removable;
            return outcome;   // If removal is not possible this should be a string telling why it can't be done
        }
    }

    removeConnector = (connector: Connector, population: Population) => {
        // As with the modules, this value will be either a true, or a string containing the reasons why the check/s failed
        const removable = this.checkForConnectorRemoval(connector, population); // Either true, or a string containing the check/s that failed
        let outcome: { success: boolean, message: string } = { success: true, message: "" };
        if (removable === true) {
            // Remove connector from main connectors list
            this._connectors = this._connectors.filter((con) => con._id !== connector._id);
            // Remove connector ID from floors' connector ID lists
            this._data._floors.forEach((floor) => {
                floor._connectors = floor._connectors.filter((id) => id !== connector._id);
            })
            // Remove connector ID from data subclass's elevators list
            this._data._elevators = this._data._elevators.filter((elev) => elev.id !== connector._id);
            // Notify population class of the removal
            population.resolveGoalsWhenStructureRemoved(connector._id);
            outcome.message = `Demolished\n${connector._connectorInfo.name}`;
            return outcome;    // Return the outcome of the removal request
        } else {
            // TODO: Upgrade this to a visible in-game notification
            outcome.message = `Cannot demolish connector # ${connector._id}:\nWait for colonists to disembark`;
            outcome.success = false;
            return outcome;    // Return the putcome of the removal request
        }
    }

    // SECTION 2B - Hard checks for connector/module removal

    checkForConnectorRemoval = (connector: Connector, population: Population) => {
        let removable = true;
        population._colonists.forEach((colonist) => {
            // Check if the colonist's current action's building ID matches the ID of the connector, and if the colonist is currently climbing (and not just walking past)
            if (colonist._data._currentAction?.buildingId === connector._id && colonist._data._currentAction?.type === "climb") {
                removable = false;   // Reject the removal if colonist is climbing the ladder, Monty
            };
        })
        return removable;
    }

    // Calls all of the hard checks together, since a single failure for any of them is sufficient to halt the removal
    hardChecksForModuleRemoval = (mod: Module, pop: Population) => {
        // Perform checks individually - a value of 'true' means the check was passed (no obstruction)
        const notLoadBearing = this.checkForModulesAbove(mod);
        const nonEssential = !(this._essentialStructures.includes(mod._moduleInfo.name));
        const notOccupied = this.checkForColonistOccupancy(mod, pop);
        if (notLoadBearing && nonEssential && notOccupied) {
            return true;    // If all of the checks are passed, give the go-ahead to the top-level removal function
        } else {
            // If any checks fail, tell the top-level removal function not to proceed (and prepare a notification to show to the player)
            return `Unable to demolish module ${mod._id}:${notLoadBearing === false ? "\n- Module supports other structures" : ""}${nonEssential === false ? "\n- Module is Essential structure" : ""}${notOccupied === false ? "\n- Module is occupied" : ""}`;
        }
    }

    // Specifically handles the question of whether there is a module above the one being removed
    checkForModulesAbove = (mod: Module) => {
        let removable = true;
        // Determine module left and right edges for convenience
        const modLeft = mod._x;
        const modRight = mod._x + mod._width;
        // Get a list of other modules whose y value is lower (higher altitude) than this one
        const modulesAbove = this._modules.filter((m) => m._y < mod._y);
        modulesAbove.forEach((m) => {
            // Using each module's x location and its width, find out if it overlaps the target module at any point
            const left = m._x;
            const right = m._x + m._width;
            if (left < modRight && right > modLeft) {
                removable = false;
            }
        })
        return removable;
    }

    // This is a bit more involved than just checking if a module has crew present, as we also need to see if a colonist is walking on the floor provided by a module
    checkForColonistOccupancy = (mod: Module, pop: Population) => {
        let removable = true;
        if (mod._crewPresent.length !== 0) removable = false;   // Check for basic occupancy - if occupied, don't allow removal
        // Advanced check: If the module is on a non-ground floor and a colonist is in front of it, don't allow removal
        const floor = this._data._floors.find((fl) => fl._modules.includes(mod._id));
        if (floor && floor._groundFloorZones.length === 0) {        // Only do this check for non-ground floors
            const colonistsOnFloor = pop._colonists.filter((col) => col._data._standingOnId === floor._id);
            colonistsOnFloor.forEach((col) => {
                if (col._data._x >= mod._x && col._data._x < mod._x + mod._width) removable = false;    // Do not allow removal if colonist is in front of the module
            })
        }
        return removable;
    }

    // SECTION 2C - Soft checks for module removals (both checks are called individually by the top-level removal method rather than being called together like the hard checks are)

    checkIfModuleIsEmpty = (mod: Module) => {
        const capacities = mod._resourceCapacity();
        let isEmpty = true;   // Set to false if any of the resources in the module's capacity list has a quantity greater than 0
        if (capacities.length > 0) {
            capacities.forEach((res) => {
                if (mod.getResourceQuantity(res) > 0) isEmpty = false;
            })
        }
        return isEmpty;
    }

    // Issue a warning if the module is on an occupied, non-ground floor and is the only one with transport connected (such that removing it would strand a colonist)
    checkModuleRemovalWillNotStrand = (mod: Module, pop: Population) => {
        let allClear = true;
        // Find out the floor the module is on, and if it is not on the ground, then proceed to the next level of checks
        const floor = this._data._floors.find((fl) => fl._modules.includes(mod._id));
        if (floor && floor._groundFloorZones.length === 0) {
            // Find out if there are colonists on the floor
            const occupied = pop._colonists.filter((col) => col._data._standingOnId === floor._id).length > 0;
            // Find out if floor's only connectors overlap with the module (even if there are multiple connectors)
            const overlapping = this._data._elevators.filter((el) => floor._connectors.includes(el.id) && (el.x >= mod._x && el.x < mod._x + mod._width)).length;
            const onlyExit = floor._connectors.length === overlapping;
            if (occupied && onlyExit) {
                allClear = false;
                console.log(`Notification: Module ${mod._id}'s removal will strand colonist/s. Removal will proceed but just thought you'd like to know.`);
            }
        }
        return allClear;
    }

    // SECTION 2D - Sub-commands for module removal

    purgeResourcesFromRemovedModule = (mod: Module) => {
        // For each resource in the module, attempt to find another module to use as storage for it and transfer as much as possible to that module
        mod._resources.forEach((res) => {
            const storage = this.findStorageModule(res);
            if (storage) {
                this.transferResources(res, mod, storage);
            } else {
                console.log(`Notification: Resource storage capacity not found for ${res[0]}`);
            }
        })
    }

    updateBaseVolumeForRemovedModule = (mod: Module) => {
        // Get the module's area, then remove all of its coordinate points from the base volume using the data class's helper method
        const area = this._data.calculateModuleArea(mod._moduleInfo, mod._x, mod._y);
        const removed = this._data.removeCoordsFromBaseVolume(area);
        if (removed - area.length === 0) {
            return removed;
        } else {
            console.log(`Warning: Only removed ${removed} out of ${area.length} base volume coordinates for module ${mod._id}`);
            return removed;
        }
    }

    updateFloorsForRemovedModule = (mod: Module, map: Map) => {
        // Calculate the footprint and pass it, along with the ID of the module being removed, to the floor manager
        const area = this._data.calculateModuleArea(mod._moduleInfo, mod._x, mod._y);
        const { footprint } = this._data.calculateModuleFootprint(area);
        const floor = this._data._floors.find((fl) => fl._modules.includes(mod._id));    // Find the floor
        if (floor) {
            // Is the module the only one on that floor? If so, delete the Floor
            if (floor._modules.length === 1) {
                this._data._floors = this._data._floors.filter((fl) => fl._id !== floor._id);
                // Is the module on the left/right edge of a floor that contains other modules? If so, remove its ID and adjust floor's edge
            } else if (footprint[0] === floor._leftSide) {
                floor._modules = floor._modules.filter((id) => id !== mod._id); // Filter out the ID
                floor._leftSide += mod._width;                  // Floor's left edge retreats by the width of the module
            } else if (footprint[footprint.length - 1] === floor._rightSide) {
                floor._modules = floor._modules.filter((id) => id !== mod._id); // Filter out the ID
                floor._rightSide -= mod._width;                  // Floor's right edge retreats by the width of the module
            } else {
                // If the module isn't alone, and it isn't on either edge, then it must be in the middle of a floor
                // If so, remove it and all modules to its right and create a new floor with those modules (splitting the original floor)
                // Split along the removed module: reset the floor's left edge, and get the ID's of all modules to its right and remove them
                floor._rightSide = mod._x - 1;                                      // Reset floor's right edge
                floor._modules = floor._modules.filter((id) => mod._id !== id);     // Remove the ID of the destroyed module
                let newFloorMods: Module[] = [];
                floor._modules.forEach((id) => {
                    const m = this.getModuleFromID(id);
                    if (m && m._x > mod._x) newFloorMods.push(m); 
                });
                if (newFloorMods.length > 0) {      // Add all modules on the right of the removed one to a new Floor
                    newFloorMods.forEach((m) => {
                        floor._modules = floor._modules.filter((id) => id !== m._id);   // Remove ID from the original floor
                        const area = this._data.calculateModuleArea(m._moduleInfo, m._x, m._y);
                        const footprint = this._data.calculateModuleFootprint(area);
                        this._data.addModuleToFloors(m._id, footprint, map._topography, map._zones);
                    })
                } else {
                    console.log(`Warning: No modules found to the right of removed module (${mod._id})`);
                }
            }
            // Lastly, remove connectors from the original floor if they no longer fall within its bounds
            const removeConnectors: Connector[] = this._connectors.filter((con) => floor._connectors.includes(con._id) && con._leftEdge > floor._rightSide)
            removeConnectors.forEach((c) => {
                floor._connectors = floor._connectors.filter((id) => id !== c._id);
            });
        } else {
            console.log(`ERROR: Floor containing module ID ${mod._id} not found during module removal cleanup.`);
        }
        
        
        
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

    // This method will return an array of messages from individual modules, if there are any
    handleMinutelyUpdates = () => {
        // TODO: If there are other minutely updates added later, make the message collection system into its own method
        this._modules.forEach((mod) => {
            if (mod._message) {
                const msg = { subject: mod._message.subject, id: mod._id, text: mod._message.text };
                this._messages.push(msg);
                mod.clearMessage();
            }
        })
        // Reset messages list and return any messages it contained to the Engine
        const messages = this._messages;
        this._messages = [];
        return messages;
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
            // GLASS ONION
            mod._moduleInfo.productionOutputs?.forEach((resource) => {
                // Storage: First try to find a storage module for the entire quantity; then look for storage module for any quantity
                let storage = this.findStorageModule([resource[0], resource[1]], true);     // Find Storage modules with room for full quantity
                if (storage === null) {
                    storage = this.findStorageModule([resource[0], 1], true);     // If full quantity not possible, get any storage space left
                }
                // if (storage === null) {
                //     storage = this.findStorageModule([resource[0], 1]);     // As a last resort, use a non-storage module
                // }
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

    // Reusable function for transferring resources from one module to another
    transferResources = (res: Resource, from: Module, to: Module) => {
        const capacity = to.getResourceCapacityAvailable(res[0]);       // Get capacity for the receiving end
        const quantity = from.getResourceQuantity(res[0]);              // Get the quantity being sent
        let transferred = 0;
        if (capacity > quantity) {
            transferred = from.deductResource(res);                 // Subtract (and prepare to transfer) the whole amount if there is more capacity than quantity
        } else {
            transferred = from.deductResource([res[0], capacity]);  // Otherwise just send the max amount for which capacity exists (and 'spill' the rest)
        }
        // console.log(`Transferring ${transferred} ${res[0]} from module ${from._id} to module ${to._id}`);
        to.addResource([res[0], transferred]);      // Complete the transfer
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
        // Render floors in dev mode only:
        if (process.env.ENVIRONMENT === "dev" || process.env.ENVIRONMENT === "local_dev") {
            this._data._floors.forEach((floor) => {
                // Only render floors that are on-screen
                if (floor._rightSide <= rightEdge || floor._leftSide >= leftEdge) {
                    floor.render(p5, this._horizontalOffset);
                }
            });
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