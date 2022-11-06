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
        this._roles = [];
        this._jobs = [];
    }

    // Top level updater - called by the Engine class's hourly updater method
    updateJobs = (infra: Infrastructure) => {
        console.log("Updating jobs");
    }

    // Updates the jobs for a specific role
    updateJobForRole = (infra: Infrastructure, role: string) => {
        console.log("Updating individual job");
    }

    // Called by the Colonists when they need a new job
    getJob = (infra: Infrastructure) => {
        console.log("Getting job");
    }

}