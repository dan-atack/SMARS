import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import assert from "assert";
import { constants } from "../constants";

// Standardize name of the database:
const dbName = 'smars';
const collectionName = 'random_events';

// Copied from the frontend's Modal.ts file
export type Resolution = {
    text: string,                   // Words on the button
    outcomes: [string, number | string, number?][]    // A tuple consisting of a type (string for Engine's switch case) a value (string or a number), and optionally, an ID number for a colonist or module as the third value
}

export type EventData = {
    id: string,                 // Modals are identified with a unique string ID to make them easier to sort through
    title: string,
    text: string,
    resolutions: Resolution[]
 }

export type RandomEventData = {
    karma: string       // Either 'good' or 'bad'
    magnitude: number   // From 1 to 10
    data: EventData     //
}

const handleRandomEvent = async (req: Request, res: Response) => {
    // Version one: Just look up a random event in the random events collection and return it
    const client = new MongoClient(constants.DB_URL_STRING, {});
    try {
        await client.connect();
        console.log(`Database connection established. Getting a random event.`);
        const db = client.db(dbName);
        await db
            .collection(collectionName)
            .find() // Find all random events
            .toArray((err, result) => {
                if (result != null) {
                    // If there are maps for a given type, see how many there are and randomly select one
                    const rando = Math.floor(Math.random() * result.length);
                    console.log(`Loading event data for event number ${rando}.`);
                    res.status(200).json({ status: 200, ev: result[rando]})
                    client.close();
                } else {
                    console.log(`ERROR: No random event data found.`);
                    client.close();
                }
            })
    } catch (err) {
        console.log(`ERROR: The following error occurred while trying to load a random event:`);
        console.log(err);
    }
}

module.exports = {
    handleRandomEvent,
}