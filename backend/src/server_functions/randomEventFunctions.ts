import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { constants } from "../constants";

// Standardize name of the database:
const dbName = 'smars';
const collectionName = 'random_events';

// Copied from the frontend's Modal.ts file
export type Resolution = {
    text: string,                   // Words on the button
    outcomes: [string, number | string, string?][]    // A tuple consisting of a type (string for Engine's switch case) a value (string or a number), and optionally, a third value to specify the type of resource to be added/subtracted from a module
}

export type EventData = {
    id: string,                 // Modals are identified with a unique string ID to make them easier to sort through
    title: string,
    text: string,
    resolutions: Resolution[]
 }

// The RandomEventData class is the unit that will be stored in the database; in addition to the event data it has two fields to allow for more specific random events
export type RandomEventData = {
    karma: string       // Either 'good' or 'bad'   (to help with more specific, semi-random event picking)
    magnitude: number   // From 1 to 10             (to help with more specific, semi-random event picking)
    data: EventData     // Engine readable event object
}

const handleRandomEvent = async (req: Request, res: Response) => {
    const values = req.body;
    const karma: string = values[0];
    const magnitude: number = values[1];
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
                    // If Karma and magnitude values are present, do targeted search of the db; if not simply return random event with magnitude 1
                    if (karma && typeof magnitude === "number") {
                        const aligned = result.filter((ev) => ev.karma === karma);
                        const resultsByMagnitude = aligned.filter((ev) => ev.magnitude <= magnitude);
                        const rando = Math.floor(Math.random() * resultsByMagnitude.length);
                        // Get only events with equal or lower karma than the request
                        console.log(`${karma} events found with acceptable magnitude (${magnitude} or lower): ${resultsByMagnitude.length}`);
                        res.status(200).json({ status: 200, ev: resultsByMagnitude[rando]});
                        client.close();
                    } else {
                        // If karma and magnitude are not sent in the request, randomly select a low-magnitude event
                        const resultsByMagnitude = result.filter((ev) => ev.magnitude <= 1);
                        const rando = Math.floor(Math.random() * resultsByMagnitude.length);
                        res.status(200).json({ status: 200, ev: resultsByMagnitude[rando]});
                        client.close();
                    }
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