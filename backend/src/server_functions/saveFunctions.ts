import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import assert from "assert";

// Standardize name of the database:
const dbName = 'smars'
const collectionName = 'saves'

// Template for new save game info:

type SaveInfo = {
    name: string        // Save game name
    username: string    // Name of the username associated with this save
    time: Date
    difficulty: string  // There will be a few different options, inserted into switch cases throughout the game
    terrain: number[][] // The 'map' consists of terrain plus structures plus sprites
    structures: number[][]  // Subject to change; a list of lists of numbers implies a 'pressurized volume' mindset though, doesn't it?
    units: any          // TODO: Fill in the blanks here big time before going much further with save files!
    resources: any      // TODO: Ditto; probably need a sub-object which is a dictionary of resource names to numbers.
    techs: any          // TODO: Again, a list of some kind of object that requires a well thought-out sub-type
}