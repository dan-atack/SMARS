// The Industry class is the disembodied list of all the jobs in the colony, and the functions for updating them
import P5 from "p5";
import Infrastructure from "./infrastructure";
import { Coords } from "./connector";
import { ColonistAction } from "./colonistData";

export default class Industry {
    // Industry class types:
    _roles: { name: string, resourceProduced: string }[];   // Each role has a name, and a goal, which is to produce a resource
    _jobs: ColonistAction[];

    constructor() {
        this._roles = [
            {
                name: "farmer",             // Role name
                resourceProduced: "food"    // Resource produced (will send colonists to any module that produces this resource)
            }
        ];
        this._jobs = [];
    }

    // Top level updater - called by the Engine class's hourly updater method
    updateJobs = (infra: Infrastructure) => {
        console.log("Updating jobs");
        this._roles.forEach((role) => {
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