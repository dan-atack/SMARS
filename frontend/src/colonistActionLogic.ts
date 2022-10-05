import { ColonistAction } from "./colonistData";
import { Coords } from "./connectorData";
import { Resource } from "./economyData";
import Floor from "./floor";
import Infrastructure from "./infrastructure";
import { Elevator } from "./infrastructureData";
import Map from "./map";
import Module from "./module";

// TOP LEVEL METHODS

// Creates a full action stack for either the 'eat' or 'drink' colonist goals
export const createConsumeActionStack = (colonistCoords: Coords, colonistStandingOn: string | number, resource: Resource, infra: Infrastructure) => {
    // 0 - Determine action verb from the resource type (NOTE: This will need an upgrade when newer resources are added)
    const verb = resource[0] === "water" ? "drink" : "eat";
    let stack: ColonistAction[] = [];
    let stackComplete = false;  // Do we need this??
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
            const floor = infra._data.getFloorFromModuleId(mod._data._id);
            // Does floor have elevators? --> If no, try next module
            // NOTE: Stop checking here if the stackComplete flag is set to true
            if ((!stackComplete) && floor && floor._connectors.length > 0) {
                // If floor has elevators, start a fresh stack (clear out prev attempt) and add initial consume action
                const modCoords = infra.findModuleLocationFromID(mod._data._id);
                stack = [];
                stack.push(addAction(verb, { x: modCoords.x, y: modCoords.y }, resource[1], mod._data._id));
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
                        console.log(`STACK COMPLETE: ${mod._data._moduleInfo.name} ${mod._data._id} found on floor ${floor._id}. Walking across map zone ${elevator.groundZoneId} to climb ladder ${elevId} from (${elevator.x}, ${elevator.bottom}) to (${elevator.x}, ${floor._elevation})`);
                    }
                    // If elevator reaches the (non-ground) floor the colonist is on, get on at floor's height (stack complete)
                    const reachesFloor = infra._data._floors.find((floor) => floor._connectors.includes(colonistStandingOn as number));
                    if ((!stackComplete) && elevator && reachesFloor) {
                        // Only add the second 'move' if the module is at a different x coordinate than the ladder
                        if (modCoords.x !== elevator.x) {
                            stack.push(addAction("move", { x: modCoords.x, y: modCoords.y }));
                        }
                        stack.push(addAction("climb", { x: elevator.x, y: floor._elevation - 1 }, 0, elevator.id));
                        stack.push(addAction("move", { x: elevator.x, y: elevator.bottom }));
                        stackComplete = true;
                        console.log(`STACK COMPLETE: ${mod._data._moduleInfo.name} ${mod._data._id} found on floor ${floor._id}. Walking across floor ${floor._id} to climb ladder ${elevId} from (${elevator.x}, ${elevator.bottom}) to (${elevator.x}, ${floor._elevation})`);
                    }
                })
            }            
        })
    }
    // 4 - Finally, return the action stack for the colonist to start using it
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
        const floor = infra._data.getFloorFromModuleId(mod._data._id);
        // Add modules that are: on floor with same ID as colonist is standing on, OR on floor with a ground zone ID that matches
        if (floor && (floor._id === standingOn || floor.getFloorGroundZones().includes(standingOn as string))){
            accessibles.push(mod);
        }
    })
    return accessibles;
}

export const determineIfColonistIsOnSameSurfaceAsModule = (floor: Floor, standingOnId: number | string) => {
    const sameZone = floor._groundFloorZones.find((zone) => zone.id === standingOnId);
    const sameFloor = floor._id === standingOnId;
    if (sameZone || sameFloor) {
        console.log(`Colonist is on same ${sameZone ? 'map zone' : 'floor'} as resource module`);
        return true;
    } else {
        console.log(`Colonist is not on same surface as resource module`);
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