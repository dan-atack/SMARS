// The Industry class is the disembodied list of all the jobs in the colony, and the functions for updating them
import P5 from "p5";
import Infrastructure from "./infrastructure";
import Map from "./map";
import { Coords } from "./connector";
import { ColonistAction } from "./colonistData";
import { constants } from "./constants";


export type Role = {
    name: string,
    action: string,
    resourceProduced: string
}

export type MiningLocations = {
    water: Coords[]
}

export default class Industry {
    // Industry class types:
    _roles: Role[];   // Each role has a name, and a goal, which is to produce a resource
    _jobs: any; // An unfortunate but necessary use of the any type; the Jobs property is a dictionary of role names to job lists
    _miningLocations: MiningLocations;          // Keep track of which blocks can be mined
    _miningCoordinatesInUse: MiningLocations;   // Keep track of which blocks are currently being mined
    
    constructor() {
        this._roles = [
            {
                name: "farmer",             // Role name
                action: "farm",             // Colonist action name
                resourceProduced: "food"    // Resource produced (will send colonists to any module that produces this resource)
            },
            {
                name: "miner",
                action: "mine",
                resourceProduced: "minerals"
            },
            // {
            //     name: "scientist",
            //     resourceProduced: "research"
            // }
        ];
        this._jobs = {};    // Create jobs as empty object, then assign each role's name to be a key, whose value is a list of jobs
        this._roles.forEach((role) => {
            this._jobs[role.name as keyof Object] = [] as ColonistAction[];
        });
        this._miningLocations = {
            water: []
        };
        this._miningCoordinatesInUse = {
            water: []
        }
    }

    // SECTION 0: LOADING SAVED GAME DATA

    // Loads designated mining locations and the coordinates of locations that are currently in use by a colonist
    loadSavedMiningLocations = (locations: MiningLocations, inUse: MiningLocations) => {
        if (locations && inUse) {
            this._miningLocations = locations;
            this._miningCoordinatesInUse = inUse;
        } else {
            console.log("Legacy save detected. Skipping mining location save data.");
        }
    }

    // SECTION 1: JOB UPDATER FUNCTIONS

    // Top level updater - called by the Engine class's hourly updater method
    updateJobs = (infra: Infrastructure) => {
        this._roles.forEach((role) => {
            this.updateJobsForRole(infra, role.name);
        })
    }

    // Updates the jobs for a specific role from its string name
    updateJobsForRole = (infra: Infrastructure, roleName: string) => {
        // Find the role based on the given role name string OR role action string (i.e. find the role for 'farm' OR 'farmer')
        const role = this._roles.find((role) => role.name === roleName || role.action === roleName);
        if (role) {
            this._jobs[role.name] = []; // Reset jobs list for this role
            // Check if the role is related to mining
            if (role.name === "miner") {
                this.updateMiningJobs();
            }
            // Find modules that produce the role's resource
            const mods = infra.findModulesWithOutput(role.resourceProduced);
            // For each module check if it A) has enough input resources to produce and B) how many open slots it has
            mods.forEach((mod) => {
                const slots = mod._moduleInfo.crewCapacity - mod._crewPresent.length;
                const provisioned = mod.hasProductionInputs();
                if (slots > 0 && provisioned) {
                    for (let i = 0; i < slots; i++) {
                        const job: ColonistAction = {
                            type: role.action,
                            coords: { x: mod._x + (i * 2) + 1, y: mod._y + mod._height - 1},
                            duration: 30,   // TODO: Make this depend on some other quantity?
                            buildingId: mod._id
                        };
                        this._jobs[role.name].push(job);
                    }
                }
            })
        } else {
            console.log(`Error: role data for role ${roleName} not found.`);
        }   
    }

    updateMiningJobs = () => {
        this._miningLocations.water.forEach((location) => {
            if (!(this._miningCoordinatesInUse.water.find((loc) => loc.x === location.x && loc.y === location.y))) {
                const job: ColonistAction = {
                    type: "mine",
                    coords: { x: location.x, y: location.y },
                    duration: 30,   // TODO: Make this depend on some other quantity?
                    buildingId: 0   // Not applicable
                };
                this._jobs.miner.push(job);
            }
        })
        // console.log(`Mining jobs: ${this._jobs.miner.length}`);
        // console.log(this._jobs.miner);
    }

    // SECTION 2: MINING FUNCTIONS

    // Adds/removes a block's location to the mining locations list for a given resource type
    addMiningLocation = (coords: Coords, resource: string) => {
        // Find the resource type
        let locs = this._miningLocations[resource as keyof MiningLocations]
        if (locs !== undefined) {
            // Check if coords are already in the locations list for this resource
            const sameColumn = locs.filter((loc) => loc.x === coords.x);
            if (sameColumn.find((loc) => loc.y === coords.y)) {
                // Remove them if they are
                locs = locs.filter((loc) => loc.x !== coords.x || loc.y !== coords.y);
                this._miningLocations[resource as keyof MiningLocations] = locs;
                return false;
            } else {
                // Add them if they are not there
                locs.push(coords);
                return true;
            }
        } else {
            console.log(`Error: Unable to find resource type ${resource}.`);
            return false;
        }        
    }

    // The equivalent of punching in or out of a mining location; returns true or false based on success of the request
    updateMiningLocationStatus = (resource: string, coords: Coords, inUse: boolean) => {
        // Find if the coordinates exist
        const loc = this._miningLocations[resource as keyof MiningLocations].find((c) => c.x === coords.x && c.y === coords.y);
        if (loc) {
            // Find if coordinates are listed as occupied
            const occ = this._miningCoordinatesInUse[resource as keyof MiningLocations].find((c) => c.x === coords.x && c.y === coords.y);
            if (occ) {
                // Coordinates are occupied
                if (inUse) {    // DO NOT allow another punch-in
                    console.log(`Warning: Mining location at (${coords.x}, ${coords.y}) is already occupied.`);
                    return false;
                } else {        // DO allow a punch-out
                    console.log(`Vacating mining location (${coords.x}. ${coords.y}).`);
                    this._miningCoordinatesInUse[resource as keyof MiningLocations] = this._miningCoordinatesInUse[resource as keyof MiningLocations].filter((loc) => loc.x !== coords.x || loc.y !== coords.y);
                    return true;
                }
            } else {
                // Coordinates are not occupied
                if (inUse) {    // DO allow a punch-in
                    console.log(`Occupying mining location (${coords.x}, ${coords.y}).`);
                    this._miningCoordinatesInUse[resource as keyof MiningLocations].push(coords);
                    return true;
                } else {        // DO NOT allow a punch-out
                    console.log(`Warning: Mining location at (${coords.x}, ${coords.y}) is not occupied.`);
                    return false;
                }
            }
        } else {
            console.log(`Error: Mining location at (${coords.x}, ${coords.y}) not found.`);
            return false;
        }
    }

    // TODO: Add methods for occupying and vacating mining locations, to keep track of which spaces are available for new jobs

    // SECTION 3: GIVING OUT JOBS TO COLONISTS

    // Called by the Colonists when they need a new job
    // TODO: Add coordinates argument to allow more efficient job assignments!
    getJob = (role: string) => {
        let job: ColonistAction | null;
        if (typeof this._jobs[role] !== "undefined" && this._jobs[role].length > 0) {
            job = this._jobs[role].pop();
        } else {
            job = null;
        }
        return job;
    }

    render = (p5: P5, xOffset: number) => {
        p5.strokeWeight(2);
        p5.stroke(constants.ALMOST_BLACK);
        this._miningLocations.water.forEach((loc) => {
            // Create a traffic cone over each mining designated block
            const x = loc.x * constants.BLOCK_WIDTH - xOffset;
            const y = loc.y * constants.BLOCK_WIDTH;
            p5.fill(constants.ORANGE_JUMPSUIT);
            p5.quad(x + 4, y, x + 16, y, x + 12, y - 16, x + 8, y - 16);
            p5.fill(constants.EGGSHELL);
            p5.quad(x + 6, y - 5, x + 14, y - 5, x + 12, y - 11, x + 8, y - 11);
        })
    }

}