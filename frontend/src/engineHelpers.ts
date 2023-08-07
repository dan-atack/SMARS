// This file contains functions used by the Engine specifically for dealing with legacy load issues, or to help with calculations involving the game's "Smars" time

import { GameTime } from "./saveGame";
import { Resource } from "./economyData";

// Legacy resource data format (do not feel sorry for it)
type Resources = {
    money: [string, number],    // Each value is a tuple, representing the display symbol, and the quantity... YUCK!!
    oxygen: [string, number],
    water: [string, number],
    food: [string, number],
    power: [string, number],
    equipment: [string, number],
    minerals: [string, number]
}

// Takes save data that uses the old data format (shown above) and returns it in the new format
export const convertResourceData = (resources: Resources) => {
    let reformatted: Resource[] = [];   // The new format is much bettor
    Object.keys(resources).forEach((res) => {
        // @ts-ignore
        reformatted.push([res, resources[res][1]])
    })
    return reformatted;
}

// Compares two different gametime objects and returns the LATER of the two
export const compareGameTimes = (timeA: GameTime, timeB: GameTime) => {
    // Start by comparing the game year
    if (timeA.year > timeB.year) {
        return timeA
    } else if (timeB.year > timeA.year) {
        return timeB;
    } else {    // If the year is the same for both, proceed to compare the date (Sol)
        if (timeA.sol > timeB.sol) {
            return timeA;
        } else if (timeB.sol > timeA.sol) {
            return timeB;
        } else {    // If the date (Sol) is the same, proceed to compare the AM/PM cycles
            if (timeA.cycle === "PM" && timeB.cycle === "AM") {
                return timeA;
            } else if (timeB.cycle === "PM" && timeA.cycle === "AM") {
                return timeB;
            } else {    // If the cycle is the same, proceed to compare the hour (making an exception for 12 since it's actually the lowest)
                if (timeA.hour > timeB.hour && timeA.hour !== 12) {
                    return timeA;
                } else if (timeB.hour > timeA.hour && timeB.hour !== 12) {
                    return timeB;
                } else {    // Finally, if the hours are also the same, compare by the minute
                    if (timeA.minute > timeB.minute) {
                        return timeA
                    } else if (timeB.minute > timeA.minute) {
                        return timeB
                    } else {
                        console.log("Warning: Both times have the same exact time stamp.");
                        return timeA;   // Return time A by default in case of a draw
                    }
                }
            }
        }
    }
}