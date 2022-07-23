// This file contains functions used by the Engine specifically for dealing with legacy load issues

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