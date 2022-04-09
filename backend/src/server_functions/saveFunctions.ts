import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import assert from "assert";

// Standardize name of the database:
const dbName = 'smars'
const collectionName = 'saved_games'

// Template for new save game info:

type SaveInfo = {
    game_name: string           // Save game name
    username: string            // Name of the username associated with this save
    time: Date                  // Timestamp for the save file
    game_time: {                // The time on SMARS
        minute: number,
        hour: number,
        cycle: string,
        sol: number,
        year: number
    }
    difficulty: string          // Easy, medium or hard - values will be inserted into switch cases throughout the game
    map_type: string            // From the game's initial settings
    terrain: number[][]         // The 'map' consists of terrain plus structures plus sprites
    random_events: boolean      // From the game's initial settings
    modules: {                  // Store only a minimal amount of data on the individual modules
        name: string,
        x: number,
        y: number
    }[]
    connectors: {               // Connector data's shape will eventually change, but for now it's basically the same as a module
        name: string,
        x: number,
        y: number
    }[]
    // units: any          // TODO: Fill in the blanks here big time before going much further with save files!
    // resources: any      // TODO: Ditto; probably need a sub-object which is a dictionary of resource names to numbers.
    // techs: any          // TODO: Again, a list of some kind of object that requires a well thought-out sub-type
}

const handleSave = async (req: Request, res: Response) => {
    const { saveData } = req.body;
    const client = new MongoClient("mongodb://localhost:27017", {});
    try {
        await client.connect();
        console.log("Connected to database.");
        const db = client.db(dbName);
        const insert = await db.collection(collectionName).insertOne(saveData);
        assert.equal(insert.acknowledged, true);
        console.log(`Save file created for ${saveData.username}`);
        res.status(201).json({ message: `Save file created for ${saveData.username} at ${saveData.time.toString()}` });
        console.log("Closing database connection.");
        client.close();
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: `Error encountered while trying to process save for ${saveData.username}` });
    }
}

module.exports = {
    handleSave
}