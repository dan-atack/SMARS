// The Industry class is the disembodied list of all the jobs in the colony, and the functions for updating them
import P5 from "p5";
import Infrastructure from "./infrastructure";
import { Coords } from "./connector";
import { ColonistAction } from "./colonistData";

export default class Industry {
    // Industry class types:
    _roles: { name: string, resourceProduced: string }[];   // Each role has a name, and a goal, which is to produce a resource
    _jobs: any; // An unfortunate but necessary use of the any type; the Jobs property is a dictionary of role names to job lists
    
    constructor() {
        this._roles = [
            {
                name: "farmer",             // Role name
                resourceProduced: "food"    // Resource produced (will send colonists to any module that produces this resource)
            },
            {
                name: "miner",
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
        console.log("Updating jobs");
        this._roles.forEach((role) => {
            // Find modules that produce the role's resource
            const mods = infra.findModulesWithOutput(role.resourceProduced);
            this.updateJobsForRole(infra, role.name);
        })
    }

    // Updates the jobs for a specific role
    updateJobsForRole = (infra: Infrastructure, role: string) => {
        console.log(`Updating jobs for ${role}`);
    }

    // Called by the Colonists when they need a new job
    getJob = (role: string, coords: Coords) => {
        console.log(`Getting ${role} job for colonist at (${coords.x}, ${coords.y})`);
    }

}