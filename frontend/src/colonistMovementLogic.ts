import { Coords } from "./connectorData";
import { Resource } from "./economyData";
import Floor from "./floor";
import Infrastructure from "./infrastructure";
import { Elevator } from "./infrastructureData";
import Map from "./map";

// Returns an elevator or a null if no acceptable elevator is found
export const findElevatorToGround = (x: number, floorId: number, map: Map, infra: Infrastructure) => {
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
    const modules = infra.findModulesWithResource(resource);
    const nearestModuleId = infra.findModuleNearestToLocation(modules, currentPosition);
    if (nearestModuleId !== 0) {
        const nearestModuleLocation = infra.findModuleLocationFromID(nearestModuleId);
        return { id: nearestModuleId, coords: nearestModuleLocation };
    } else {
        console.log(`No modules found containing ${resource[0]}`);
        return null;
    }
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