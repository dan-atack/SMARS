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
    // 2 - See if any of them are on the same surface as the colonist - if so, the process is already finished!
    const accessibleNow = findModulesOnSameSurface(resource, colonistStandingOn, infra);
    if (accessibleNow.length > 0) {
        // If any modules are on the same surface as the colonist, pick the closest one and move there (stack complete)
        const nearestId = infra.findModuleNearestToLocation(accessibleNow, colonistCoords);
        const nearestCoords = infra.findModuleLocationFromID(nearestId);
        if (nearestId) {
            // Add eat/drink action
            stack.push(addAction(verb, { x: nearestCoords.x, y: nearestCoords.y }, resource[1], nearestId));
            // Add move action only if the colonist actually needs to move
            if (colonistCoords.x !== nearestCoords.x) {
                stack.push(addAction("move", { x: nearestCoords.x, y: nearestCoords.y }));
            }
            stackComplete = true;
            // console.log(`STACK COMPLETE: Module ${nearestId} found on same surface as colonist: ${colonistStandingOn}`);
        } else {
            console.log(`Error: module ${nearestId} data not found for ${verb} action planning.`);
        }
    // 3 - If however, none of the modules are on the same surface, start checking them for elevator/ladder access
    } else {
        modules.forEach((mod) => {
            // Find floor
            const floor = infra._data.getFloorFromModuleId(mod._id);
            // Does floor have elevators? --> If no, try next module (unless the stackComplete flag is set to true)
            if ((!stackComplete) && floor && floor._connectors.length > 0) {
                // If floor has elevators, start a fresh stack by adding initial consume action
                const modCoords = infra.findModuleLocationFromID(mod._id);
                stack.push(addAction(verb, { x: modCoords.x, y: modCoords.y }, resource[1], mod._id));
                // Then loop thru elevators list
                const elevatorIDs = floor._connectors;
                elevatorIDs.forEach((elevId) => {
                    // Find elevator
                    const elevator  = infra._data.getElevatorFromId(elevId);
                    // If elevator reaches the ground zone the colonist is on, get on at the bottom (stack complete)
                    const grounded = elevator && elevator.groundZoneId === colonistStandingOn;
                    if ((!stackComplete) && grounded) {
                        // Only add the second 'move' if the module is at a different x coordinate than the ladder
                        if (modCoords.x !== elevator.x) {
                            stack.push(addAction("move", { x: modCoords.x, y: modCoords.y }));
                        }
                        stack.push(addAction("climb", { x: elevator.x, y: floor._elevation - 1 }, 0, elevator.id));
                        stack.push(addAction("move", { x: elevator.x, y: elevator.bottom }));
                        stackComplete = true;
                    }
                    // If elevator reaches the (non-ground) floor the colonist is on, get on at floor's height (stack complete)
                    // Better stated, find which floor/s include this elevator's ID, and check each of their ID against the colonist's standingon as a number. So you got it half right.
                    const floors = infra._data.getFloorsFromElevatorId(elevId);
                    const reachesFloor = floors.find((floor) => floor._id === colonistStandingOn as number);
                    if ((!stackComplete) && elevator && reachesFloor) {
                        // Only add the second 'move' if the module is at a different x coordinate than the ladder
                        if (modCoords.x !== elevator.x) {
                            stack.push(addAction("move", { x: modCoords.x, y: modCoords.y }));
                        }
                        stack.push(addAction("climb", { x: elevator.x, y: floor._elevation - 1 }, 0, elevator.id));
                        stack.push(addAction("move", { x: elevator.x, y: colonistCoords.y }));
                        stackComplete = true;
                    }
                })
            }
            // Reset stack length to zero here if it only contains the initial consume action (no connection was found to the target floor)
            if (stack.length === 1) stack = [];
        })
    }
    // 4 - Finally, return the action stack for the colonist to start using it
    return stack;
}

// Creates the action stack to fulfill the 'get-rest' goal which, unlike 'eat' or 'drink', does not consume any resources
export const createRestActionStack = (colonistCoords: Coords, standingOnId: string | number, infra: Infrastructure) => {
    let stack: ColonistAction[] = [];
    let stackComplete = false;
    // 1 - Find all modules with the name 'Crew Quarters' (TODO: As more types of sleeping module are added, find a better way)
    const mods = infra._modules.filter((mod) => mod._moduleInfo.name === "Crew Quarters");
    if (mods.length > 0) {
        console.log(`Found ${mods.length} modules to rest in.`);
        mods.forEach((mod) => {
            // 2 - Check if each module is occupied, and add the 'rest' action here if it isn't
            if (!(stackComplete) && mod._crewPresent.length < mod._moduleInfo.crewCapacity) {
                // Have colonists enter at different ends of the module if it is partially occupied when they get there
                const coords = { x: mod._x + (mod._crewPresent.length * 3), y: mod._y + mod._height - 1}
                stack.push(addAction("rest", coords, 640, mod._id));    // Duration = 480 minutes = 8 hours' sleep
                console.log(stack);
                // 3 - Then, find out if it is on the same surface as the colonist
                stack = stack.concat(getPathToModule(infra, mod._id, coords, standingOnId, colonistCoords));
                console.log(stack);
                // 4- If stack has only 'rest' action at this point and zones do not match, the module is inaccessible
                const floor = infra._data.getFloorFromModuleId(mod._id);
                if (floor) {
                    // console.log(`Warning: No path found to module ${mod._id}`);
                    if (stack.length === 1 && !(determineIfColonistIsOnSameSurface(floor, standingOnId))) {
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
    console.log(stack);
    return stack;
}

// Reusable function to check if a module's floor is accessible (via same surface or single ladder) and return an action stack that gets to that module (if possible)
export const getPathToModule = (infra: Infrastructure, modId: number, modCoords: Coords, standingOn: string | number, colCoords: Coords) => {
    let stack: ColonistAction[] = [];
    // 1 - Find the floor
    const floor = infra._data.getFloorFromModuleId(modId);
    if (floor) {
        // 2 - A - Destination is on same surface as colonist
        if (determineIfColonistIsOnSameSurface(floor, standingOn)) {
            if (colCoords.x !== modCoords.x) {
                console.log("Adding move action");
                stack.push(addAction("move", modCoords)); // If colonist is not already at the module, add move action
            }
        } else if (floor._connectors.length > 0){
        // 2 - B - Destination is on different surface (floor) and said floor has at least one elevator/ladder attached 
            // For each elevator, check if it reaches the colonist's standingOnId
            let solved = false;
            floor._connectors.forEach((elevId) => {
                if (!solved) {
                    const elevator = infra._data.getElevatorFromId(elevId);
                    // Determine 2 possible success criteria for an elevator to recommend itself:
                    // 3 - A - The elevator reaches the ground in the same map zone as the colonist
                    const grounded = elevator && elevator.groundZoneId === standingOn;
                    // 3 - B - One of the floors the elevator reaches has the same ID as what the colonist is standing on
                    const floors = infra._data.getFloorsFromElevatorId(elevId);
                    const reachesFloor = elevator && floors.find((floor) => floor._id === standingOn as number);
                    if (grounded) {
                        stack = stack.concat(climbLadderFromGroundActions(modCoords, floor, elevator));
                        solved = true;
                    } else if (reachesFloor){
                        // If elevator reaches the (non-ground) floor the colonist is on, get on at floor's height (stack complete)
                        stack = stack.concat(climbLadderFromFloorActions(modCoords, floor, elevator, colCoords.y));
                        solved = true;
                    }
                }
            })
        }
    } else {
        console.log(`Error: Floor data not found for module ${modId}`);
    }
    console.log(stack);
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
        // If stack only contains initial production job by this point, set its length to zero (no connection found to job site)
        if (stack.length === 1 && !(determineIfColonistIsOnSameSurface(floor, standingOnId))) {
            console.log(`Warning: Floor ${floor._id} is inaccessible for ${job.type} work.`);
            stack = [];
        }
    } else {
        console.log(`Error: Floor data not found for module ${job.buildingId}`);
    }
    // 3 - Return the action stack for the colonist to start using it
    return stack;
}

// Action stack creation expeditor for when the colonist has to walk across the map, then climb a ladder, then possibly move again
export const climbLadderFromGroundActions = (jobCoords: Coords, floor: Floor, elevator: Elevator) => {
    const stack: ColonistAction[] = [];
    // Only add the first (chronologically last) 'move' if the module is at a different x coordinate than the ladder
    if (jobCoords.x !== elevator.x) {
        stack.push(addAction("move", { x: jobCoords.x, y: jobCoords.y }));
    }
    stack.push(addAction("climb", { x: elevator.x, y: floor._elevation - 1 }, 0, elevator.id));
    stack.push(addAction("move", { x: elevator.x, y: elevator.bottom }));
    return stack;
}

export const climbLadderFromFloorActions = (jobCoords: Coords, floor: Floor, elevator: Elevator, y: number) => {
    const stack: ColonistAction[] = [];
    if (jobCoords.x !== elevator.x) {
        stack.push(addAction("move", { x: jobCoords.x, y: jobCoords.y }));
    }
    stack.push(addAction("climb", { x: elevator.x, y: floor._elevation - 1 }, 0, elevator.id));
    stack.push(addAction("move", { x: elevator.x, y: y }));
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
            console.log(`No ladder found from floor ${floorId} to any ground zones.`);
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
            console.log(`No ladder matching zone ID ${standingOnId} found.`);
            return null;
        }
    } else {
        console.log(`No elevator connections found to floor ${floor._id}`);
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
        console.log(`No modules found containing ${resource[0]}`);
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
        console.log(`Colonist is on same ${sameZone ? 'map zone' : 'floor'} as destination.`);
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