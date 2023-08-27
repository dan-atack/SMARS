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
                const a = timeA.hour === 12 ? 0 : timeA.hour;
                const b = timeB.hour === 12 ? 0 : timeB.hour;
                if (a > b) {
                    return timeA;
                } else if (b > a) {
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

// Compares two different Smartian times; the assumption is that it will be the 'current' time vs. another, older time stamp
export const getSmartianTimeDelta = (currentTime: GameTime, otherTime: GameTime) => {
    // Start by comparing each component of the two times to check for deltas
    const year = currentTime.year - otherTime.year;
    const sol = currentTime.sol - otherTime.sol;
    // Convert AM/PM cycle to integers: 1 = current PM vs other AM; 0 = both are the same; -1 = Current AM vs Other PM
    const currentCycle = currentTime.cycle === "PM" ? 1 : 0;
    const otherCycle = otherTime.cycle === "PM" ? 1 : 0;
    const cycle = currentCycle - otherCycle;
    const hour = (currentTime.hour === 12 ? 0 : currentTime.hour) - (otherTime.hour === 12 ? 0 : otherTime.hour);
    const minute = currentTime.minute - otherTime.minute;
    const delta = minute + (hour * 60 ) + (cycle * 720) + (sol * 1440) + (year * 5760)
    return delta;
}

export const playSound = (id: string) => {
    try {
        const sound = document.getElementById(id);
        // const sound: HTMLAudioElement = new Audio(`../sounds/${id}`);
        if (sound) {
            //@ts-ignore
            sound.play();
        }
    } catch {
        console.log(`ERROR: Sound file not found for ${id}`);
    }
}

// Stops a sound file but keeps its playback at the current location so it can be resumed the next time it's played
export const pauseSound = (id: string) => {
    try {
        const sound = document.getElementById(id);
        if (sound) {
            //@ts-ignore
            sound.pause();
        }
    } catch {
        console.log(`ERROR: Was unable to pause sound ${id}`);
    }
}

// Stops a sound file and re-loads it so it will start from the beginning next time it's played
export const stopSound = (id: string) => {
    try {
        const sound = document.getElementById(id);
        if (sound) {
            //@ts-ignore
            sound.pause();
            //@ts-ignore
            sound.currentTime = 0;
        }
    } catch {
        console.log(`ERROR: Was unable to stop sound ${id}`);
    }
}