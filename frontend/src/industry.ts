// The Industry class is the disembodied list of all the jobs in the colony, and the functions for updating them
import Infrastructure from "./infrastructure";
import Map from "./map";
import { Coords } from "./connector";
import { ColonistAction } from "./colonistData";


export type Role = {
    name: string,
    action: string,
    resourceProduced: string
}

export default class Industry {
    // Industry class types:
    _roles: Role[];   // Each role has a name, and a goal, which is to produce a resource
    _jobs: any; // An unfortunate but necessary use of the any type; the Jobs property is a dictionary of role names to job lists
    _miningLocations: {
        water: Coords[]
    }
    
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
        }
    }

    // Top level updater - called by the Engine class's hourly updater method
    updateJobs = (infra: Infrastructure, map: Map) => {
        this._roles.forEach((role) => {
            this.updateJobsForRole(map, infra, role.name);
        })
    }

    // Updates the jobs for a specific role from its string name
    updateJobsForRole = (map: Map, infra: Infrastructure, roleName: string) => {
        // Find the role based on the given role name string OR role action string (i.e. find the role for 'farm' OR 'farmer')
        const role = this._roles.find((role) => role.name === roleName || role.action === roleName);
        if (role) {
            this._jobs[role.name] = []; // Reset jobs list for this role
            // Check if the role is related to mining
            if (role.name === "miner") {
                this.updateMiningJobs(map);
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

    updateMiningJobs = (map: Map) => {
        console.log("Get me a map! It's time to update them mining jobs.");
    }

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

}