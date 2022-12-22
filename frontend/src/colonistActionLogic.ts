import { Color } from "p5";
import { ColonistAction } from "./colonistData";
import { Coords } from "./connector";
import { Resource } from "./economyData";
import Floor from "./floor";
import Infrastructure from "./infrastructure";
import { Elevator } from "./infrastructureData";
import Module from "./module";

// TOP LEVEL METHODS

// Creates a full action stack for either the 'eat' or 'drink' colonist goals
export const createConsumeActionStack = (colonistCoords: Coords, colonistStandingOn: string | number, resource: Resource, infra: Infrastructure) => {
    // 0 - Determine action verb from the resource type (NOTE: This will need an upgrade when newer resources are added)
    const verb = resource[0] === "water" ? "drink" : "eat";
    let stack: ColonistAction[] = [];
    let stackComplete = false;  // Signal to stop adding actions (since we use a lot of forEach loops - is there a better way??)
    // 1 - Get the full list of modules containing the desired resource
    const modules = infra.findModulesWithResource(resource, true);
    if (modules.length > 0) {
        modules.forEach((mod) => {
            // 2 - Check if each module is occupied, and add the consume action here if it isn't
            if (!(stackComplete) && mod._crewPresent.length < mod._moduleInfo.crewCapacity) {
                // Have colonists enter at different ends of the module if it is partially occupied when they get there
                const coords = { x: mod._x, y: mod._y + mod._height - 1}
                stack.push(addAction(verb, coords, resource[1], mod._id));    // Duration = 480 minutes = 8 hours' sleep
                // 3 - Then, find out if it is on the same surface as the colonist
                stack = stack.concat(getPathToModule(infra, mod._id, coords, colonistStandingOn, colonistCoords));
                // 4- If stack has only one action at this point and zones do not match, the module is inaccessible
                const floor = infra._data.getFloorFromModuleId(mod._id);
                if (floor) {
                    if (stack.length === 1 && !(determineIfColonistIsOnSameSurface(floor, colonistStandingOn))) {
                        stack = [];
                    } else {
                        stackComplete = true;
                    }
                } else {
                    console.log(`Error: Floor data not found for module ${mod._id}`);
                }
            }
        })
    }
    // 5 - If we still have an empty stack by now, try to go to ground
    if (stack.length === 0) {
        stack = goToGround(colonistCoords, colonistStandingOn, infra);
    }
    // 6 - Finally, return the action stack for the colonist to start using it
    return stack;
}

// Creates the action stack to fulfill the 'get-rest' goal which, unlike 'eat' or 'drink', does not consume any resources
export const createRestActionStack = (colonistCoords: Coords, standingOnId: string | number, infra: Infrastructure) => {
    let stack: ColonistAction[] = [];
    let stackComplete = false;
    // 1 - Find all modules with the name 'Crew Quarters' (TODO: As more types of sleeping module are added, find a better way)
    const mods = infra._modules.filter((mod) => mod._moduleInfo.name === "Crew Quarters");
    if (mods.length > 0) {
        mods.forEach((mod) => {
            // 2 - Check if each module is occupied, and add the 'rest' action here if it isn't
            if (!(stackComplete) && mod._crewPresent.length < mod._moduleInfo.crewCapacity) {
                // Have colonists enter at different ends of the module if it is partially occupied when they get there
                const coords = { x: mod._x + (mod._crewPresent.length * 2) + 1, y: mod._y + mod._height - 1}
                stack.push(addAction("rest", coords, 480, mod._id));    // Duration = 480 minutes = 8 hours' sleep
                // 3 - Then, find out if it is on the same surface as the colonist
                stack = stack.concat(getPathToModule(infra, mod._id, coords, standingOnId, colonistCoords));
                // 4- If stack has only 'rest' action at this point and zones do not match, the module is inaccessible
                const floor = infra._data.getFloorFromModuleId(mod._id);
                if (floor) {
                    // console.log(`Warning: No path found to module ${mod._id}`);
                    if (stack.length === 1 && !(determineIfColonistIsOnSameSurface(floor, standingOnId))) {
                        stack = [];
                        goToGround(colonistCoords, standingOnId, infra);   // EXPERIMENTAL: Try going to the ground floor if no stack can be made
                    } else {
                        stackComplete = true;
                    }
                } else {
                    console.log(`Error: Floor data not found for module ${mod._id}`);
                }
            }
        })
    }
    // 5 - If we still have an empty stack by now, try to go to ground
    if (stack.length === 0) {
        stack = goToGround(colonistCoords, standingOnId, infra);
    }
    return stack;
}

// Reusable function to check if a module's floor is accessible (via same surface or single ladder) and return an action stack that gets to that module (if possible)
export const getPathToModule = (infra: Infrastructure, modId: number, modCoords: Coords, standingOn: string | number, colCoords: Coords) => {
    let stack: ColonistAction[] = [];
    // 1 - A - Find the module's floor
    const destFloor = infra._data.getFloorFromModuleId(modId);
    // 1 - B - Find the colonist's floor
    const startFloor = infra._data.getFloorFromCoords(colCoords);
    if (destFloor) {
        // 2 - A - Destination is on same surface as colonist
        if (determineIfColonistIsOnSameSurface(destFloor, standingOn)) {
            if (colCoords.x !== modCoords.x) {
                stack.push(addAction("move", modCoords)); // If colonist is not already at the module, add move action
            }
        } else if (destFloor._connectors.length > 0){
        // 2 - B - Destination is on different surface (floor) and said floor has at least one elevator/ladder attached 
            // For each elevator, check if it reaches the colonist's standingOnId
            let solved = false;
            destFloor._connectors.forEach((elevId) => {
                if (!solved) {
                    const elevator = infra._data.getElevatorFromId(elevId);
                    // Determine 2 possible success criteria for an elevator to recommend itself:
                    // 3 - A - The elevator reaches the ground in the same map zone as the colonist
                    const grounded = elevator && elevator.groundZoneId === standingOn;
                    // 3 - B - One of the floors the elevator reaches has the same ID as what the colonist is standing on
                    const floors = infra._data.getFloorsFromElevatorId(elevId);
                    const reachesFloor = elevator && floors.find((floor) => floor._id === standingOn as number);
                    if (grounded) {
                        stack = stack.concat(climbLadderFromGroundActions(modCoords, destFloor, elevator));
                        solved = true;
                    } else if (reachesFloor){
                        // If elevator reaches the (non-ground) floor the colonist is on, get on at floor's height (stack complete)
                        stack = stack.concat(climbLadderFromFloorActions(modCoords, destFloor, elevator, colCoords.y));
                        solved = true;
                    }
                }
            })
        } else if (startFloor && startFloor._connectors.length > 0) {
            // 2 - C - Colonist is on a non-ground floor that has an elevator to the ground zone that the module is on
            // For each elevator on the colonist's floor, check if it goes to one of the target floor's ground zones
            let solved = false;
            startFloor._connectors.forEach((id) => {
                if (!solved) {
                    const elevator = infra._data.getElevatorFromId(id);
                    const reachesZone = elevator && destFloor.getFloorGroundZones().includes(elevator.groundZoneId);
                    if (reachesZone) {
                        // Tell the colonist to climb to the bottom of the ladder before walking to the target module
                        stack = stack.concat(climbLadderFromFloorActions(modCoords, destFloor, elevator, colCoords.y, true));
                        solved = true;
                    }
                }
            })
        }
    } else {
        console.log(`Error: Floor data not found for module ${modId}`);
    }
    return stack;
}

// Creates the action stack to fulfill any kind of production module job (a list which currently includes... farmer... zat is all.)
export const createProductionActionStack = (colonistCoords: Coords, standingOnId: string | number, infra: Infrastructure, job: ColonistAction) => {
    // 1 - Create the stack and add the job data right away, so that it's at the bottom of the stack
    let stack: ColonistAction[] = [];
    stack.push(job);
    // 2 - Since we already have the module ID, we can start by finding out if it's on the same surface
    const floor = infra._data.getFloorFromModuleId(job.buildingId);
    if (floor) {
        // 2A - Destination is on same surface as colonist
        if (determineIfColonistIsOnSameSurface(floor, standingOnId)) {
            if (colonistCoords.x !== job.coords.x) {
                stack.push(addAction("move", job.coords)); // If colonist is not already at the module, add move action
            }
        } else if (floor._connectors.length > 0){
        // 2B - Destination is on different surface (floor) and said floor has at least one elevator/ladder attached 
            // For each elevator, check if it reaches the colonist's standingOnId
            let solved = false;
            floor._connectors.forEach((elevId) => {
                if (!solved) {
                    const elevator = infra._data.getElevatorFromId(elevId);
                    // Determine 2 possible success criteria for an elevator to recommend itself:
                    // Option A - The elevator reaches the ground in the same map zone as the colonist
                    const grounded = elevator && elevator.groundZoneId === standingOnId;
                    // Option B - One of the floors the elevator reaches has the same ID as what the colonist is standing on
                    const floors = infra._data.getFloorsFromElevatorId(elevId);
                    const reachesFloor = elevator && floors.find((floor) => floor._id === standingOnId as number);
                    if (grounded) {
                        stack = stack.concat(climbLadderFromGroundActions(job.coords, floor, elevator));
                        solved = true;
                    } else if (reachesFloor){
                        // If elevator reaches the (non-ground) floor the colonist is on, get on at floor's height (stack complete)
                        stack = stack.concat(climbLadderFromFloorActions(job.coords, floor, elevator, colonistCoords.y));
                        solved = true;
                    }
                }
            })
        }
        // If stack only contains initial production job by this point, try going to the nearest ground zone)
        if (stack.length === 1 && !(determineIfColonistIsOnSameSurface(floor, standingOnId))) {
            stack = goToGround(colonistCoords, standingOnId, infra);
        }
    } else {
        console.log(`Error: Floor data not found for module ${job.buildingId}`);
    }
    // 3 - Return the action stack for the colonist to start using it
    return stack;
}

// Action stack creator for mining: Since mining is always on a ground zone, just get to the ground and go to the mining zone!
export const createMiningActionStack = (job: ColonistAction, colonistCoords: Coords, colonistStandingOn: number | string, infra: Infrastructure) => {
    let stack: ColonistAction[] = [job];        // Add the job as the bottom item in the stack
    // If the colonist is not right above the mining zone, tell them to walk to it
    if (colonistCoords.x !== job.coords.x) {
        stack.push(addAction("move", job.coords));
    }
    if (typeof colonistStandingOn !== "string") {
        // Colonist is not standing on the ground, tell them to go to the ground before beginning movement to the mining location
        stack = stack.concat(goToGround(colonistCoords, colonistStandingOn, infra))
    }
    return stack;
}

// Action stack creation expeditor for when the colonist has to walk across the map, then climb a ladder, then possibly move again
export const climbLadderFromGroundActions = (modCoords: Coords, floor: Floor, elevator: Elevator) => {
    const stack: ColonistAction[] = [];
    // Only add the first (chronologically last) 'move' if the module is at a different x coordinate than the ladder
    if (modCoords.x !== elevator.x) {
        stack.push(addAction("move", { x: modCoords.x, y: modCoords.y }));
    }
    stack.push(addAction("climb", { x: elevator.x, y: floor._elevation - 1 }, 0, elevator.id));
    stack.push(addAction("move", { x: elevator.x, y: elevator.bottom }));
    return stack;
}

// Action stack creation expeditor for when the colonist is on a non-ground floor, and has to climb a ladder to another floor OR to the bottom of the ladder (if groundFloor is true, climb down to the bottom instead of the destination floor's altitude)
export const climbLadderFromFloorActions = (modCoords: Coords, floor: Floor, elevator: Elevator, y: number, groundFloor?: boolean) => {
    const stack: ColonistAction[] = [];
    if (modCoords.x !== elevator.x) {
        stack.push(addAction("move", { x: modCoords.x, y: modCoords.y }));
    }
    const ladderExitHeight = groundFloor ? elevator.bottom - 1 : floor._elevation - 1;
    stack.push(addAction("climb", { x: elevator.x, y: ladderExitHeight }, 0, elevator.id));
    stack.push(addAction("move", { x: elevator.x, y: y }));
    return stack;
}

// To be called if no proper stack was made; tells the colonist to take the nearest ladder to the ground, if possible
export const goToGround = (colonistCoords: Coords, colonistStandingOn: string | number, infra: Infrastructure) => {
    const stack: ColonistAction[] = [];
    // Only execute if the colonist is on a non-ground floor
    const floor = infra._data.getFloorFromCoords(colonistCoords);
    if (floor && floor._groundFloorZones.length === 0) {
        // console.log(`Going to ground from floor at (${colonistCoords.x}, ${colonistCoords.y}).`);
        let solved = false;
        floor._connectors.forEach((id) => {
            const elevator = infra._data.getElevatorFromId(id);
            if (elevator && elevator.groundZoneId && !(solved)) {
                solved = true;
                // Tell the colonist to move to the ladder (if necessary) and climb it - add to stack in reverse order
                stack.push(addAction("climb", { x: elevator.x, y: elevator.bottom - 1}, 0, elevator.id))
                if (colonistCoords.x !== elevator.x) {
                    stack.push(addAction("move", { x: elevator.x, y: floor._elevation }));
                }
            }
        })
    } else {
        // console.log(`Cannot go to ground. No floor at (${colonistCoords.x}, ${colonistCoords.y}).`);
    }
    return stack;
}

// Returns an elevator or a null if no acceptable elevator is found
export const findElevatorToGround = (x: number, floorId: number, infra: Infrastructure) => {
    const floor = infra._data.getFloorFromId(floorId);
    if (floor) {
        // Get elevators list for current floor
        const elevators = floor._connectors;
        // In case of multiple ladders, keep track of which one is the closest to the colonist's current location
        let nearest = 100000;   // Absurdly large initial distance
        let nearestId = 0;      // No ID by default
        elevators.forEach((id) => {
            const elevator = infra._data.getElevatorFromId(id);
            // Check if each elevator goes to the ground; if it does, check if it is closer than the previous result
            if (elevator && elevator.groundZoneId !== "") {
                const dist = Math.abs(elevator.x - x);
                if (dist < nearest) {
                    nearest = dist;
                    nearestId = elevator.id;
                }
            }
        })
        // Return the closest elevator's ID, if there is one (otherwise return a null to indicate that no ladder was found)
        if (nearestId !== 0) {
            return infra._data.getElevatorFromId(nearestId);
        } else {
            // console.log(`No ladder found from floor ${floorId} to any ground zones.`);
            return null;
        }
    } else {
        console.log(`Error: No floor found for ID ${floorId}`);
        return null;    // Returning a null from this, or any other helper, will tell the colonist to rethink their plans
    }
}

// If the colonist is on the ground, finds the nearest elevator from his zone to a given floor
export const findElevatorFromGroundToFloor = (floor: Floor, standingOnId: string, coords: Coords, infra: Infrastructure) => {
    const elevatorIDs = floor._connectors;
    if (elevatorIDs.length > 0) {
        // If there are any elevators/ladders, check if any of them has a ground zone
        const groundedElevators: Elevator[] = [];
        elevatorIDs.forEach((id) => {
            const elev = infra._data.getElevatorFromId(id);
            if (elev && elev.groundZoneId.length > 0) {
                groundedElevators.push(elev);
            }
        })
        // If any do, find if any of them has the same ground zone as the colonist
        const suitableLadders = groundedElevators.filter(ladder => ladder.groundZoneId === standingOnId);
        // If only one ladder is available that matches the colonist's ground zone, return it immediately
        if (suitableLadders.length === 1) {
            return suitableLadders[0];
        // Otherwise if there are several ladders found, return the nearest one
        } else if (suitableLadders.length > 1) {
            let nearest = 100000;   // Absurdly large initial distance
            let nearestId = 0;      // No ID by default
            suitableLadders.forEach((elev) => {
                const elevator = infra._data.getElevatorFromId(elev.id);
                // Check if each elevator goes to the ground; if it does, check if it is closer than the previous result
                if (elevator && elevator.groundZoneId !== "") {
                    const dist = Math.abs(elevator.x - coords.x);
                    if (dist < nearest) {
                        nearest = dist;
                        nearestId = elevator.id;
                    }
                }
            })
            return infra._data.getElevatorFromId(nearestId);
        // If no suitable ladder is found, return a null
        } else {
            // console.log(`No ladder matching zone ID ${standingOnId} found.`);
            return null;
        }
    } else {
        // console.log(`No elevator connections found to floor ${floor._id}`);
        return null;
    }
}

// Returns a module ID and coordinates OR a null if no module with the desired resource is found
export const findModulesWithResource = (resource: Resource, currentPosition: Coords, infra: Infrastructure) => {
    const modules = infra.findModulesWithResource(resource, true);
    const nearestModuleId = infra.findModuleNearestToLocation(modules, currentPosition);
    if (nearestModuleId !== 0) {
        const nearestModuleLocation = infra.findModuleLocationFromID(nearestModuleId);
        return { id: nearestModuleId, coords: nearestModuleLocation };
    } else {
        // console.log(`No modules found containing ${resource[0]}`);
        return null;
    }
}

// Returns a list of all the modules that contain a resource and that are on the same floor or ground zone as the colonist
export const findModulesOnSameSurface = (resource: Resource, standingOn: string | number, infra: Infrastructure) => {
    const modules = infra.findModulesWithResource(resource, true);
    const accessibles: Module[] = []; // Keep a list of just the modules that are on the same surface (floor/zone) as the colonist
    modules.forEach((mod) => {
        const floor = infra._data.getFloorFromModuleId(mod._id);
        // Add modules that are: on floor with same ID as colonist is standing on, OR on floor with a ground zone ID that matches
        if (floor && (floor._id === standingOn || floor.getFloorGroundZones().includes(standingOn as string))){
            accessibles.push(mod);
        }
    })
    return accessibles;
}

export const determineIfColonistIsOnSameSurface = (floor: Floor, standingOnId: number | string) => {
    const sameZone = floor._groundFloorZones.find((zone) => zone.id === standingOnId);
    const sameFloor = floor._id === standingOnId;
    if (sameZone || sameFloor) {
        // console.log(`Colonist is on same ${sameZone ? 'map zone' : 'floor'} as destination.`);
        return true;
    } else {
        // console.log(`Colonist is not on same surface as module`);
        return false;
    }
}

// Borrowed from the colonist class... for convenience!
// Adds a new action to the end of the action stack
const addAction = (type: string, location: Coords, duration?: number, buildingId?: number) => {
    const action: ColonistAction = {
        type: type,
        coords: location,
        duration: duration ? duration : 0,
        buildingId: buildingId ? buildingId : 0
    }
    return action;
}