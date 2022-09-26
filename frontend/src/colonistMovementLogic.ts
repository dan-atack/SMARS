import Colonist from "./colonist";
import Infrastructure from "./infrastructure";
import Map from "./map";

export const findElevatorToGround = (x: number, y: number, floorId: number, map: Map, infra: Infrastructure) => {
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
        }
    } else {
        console.log(`Error: No floor found for ID ${floorId}`);
        return null;    // Returning a null from this, or any other helper, will tell the colonist to rethink their plans
    }
}