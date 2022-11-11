// The Industry class is the disembodied list of all the jobs in the colony, and the functions for updating them
import P5 from "p5";
import Infrastructure from "./infrastructure";
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
        })
    }

    // Top level updater - called by the Engine class's hourly updater method
    updateJobs = (infra: Infrastructure) => {
        this._roles.forEach((role) => {
            this.updateJobsForRole(infra, role);
        })
        console.log(this._jobs);
    }

    // Updates the jobs for a specific role
    updateJobsForRole = (infra: Infrastructure, role: Role) => {
        // console.log(`Updating jobs for ${role.name}`);
        this._jobs[role.name] = []; // Reset jobs list for this role
        // Find modules that produce the role's resource
        const mods = infra.findModulesWithOutput(role.resourceProduced);
        // console.log(`Found ${mods.length} modules for ${role.name}s to work at.`);
        // For each module check if it A) has enough input resources to produce and B) how many open slots it has
        mods.forEach((mod) => {
            const slots = mod._moduleInfo.crewCapacity - mod._crewPresent;
            const provisioned = mod.hasProductionInputs();
            if (slots > 0 && provisioned) {
                for (let i = 0; i < slots; i++) {
                    const job: ColonistAction = {
                        type: role.action,
                        coords: { x: mod._x + i + 1, y: mod._y + mod._height - 1},
                        duration: 60,   // TODO: Make this depend on some other quantity?
                        buildingId: mod._id
                    };
                    this._jobs[role.name].push(job);
                }
            }
        })
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