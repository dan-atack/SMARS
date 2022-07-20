import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import assert from "assert";

// Standardize name of the database:
const dbName = 'smars'
const collectionName = 'saved_games'

// Mini-type for convenience:

type Coords = {
    x: number,
    y: number
}

// Template for Resources type (copy from Economy.ts):

export type Resources = {       // ENSURE THIS IS KEPT IN SYNC WITH THE FRONTEND'S ECONOMY DATA FILE
    money: [string, number],    // Each value is a tuple, representing the display symbol, and the quantity
    oxygen: [string, number],
    water: [string, number],
    food: [string, number],
    power: [string, number],
    equipment: [string, number],
    minerals: [string, number]
}

export type Resource = [ string, number ]   // New system: Each individual resource type is represented as a Resource, consisting of the resource's name and quantity (qty can thus be used either as a current quantity, or max capacity, depending on context)

// Template for Colonist Save Info (copy from Colonist.ts):

export type ColonistSaveData = {
    x: number,
    y: number,
    needs: {
        oxygen: number,
        water: number,
        food: number
    },
    goal: string,
    isMoving: boolean,
    movementType: string,
    movementCost: number,
    movementProg: number,
    movementDest: number,
    facing: string
};

// Template for new save game info (copy from SaveGame.ts):

export type SaveInfo = {
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
        type: string,           // Module type info is needed to complete search parameters when re-fetching full data object
        x: number,
        y: number,
        resources: Resource[]
    }[]
    connectors: {               // Connector data's shape will eventually change, but for now it's basically the same as a module
        name: string,
        type: string,
        segments: {start: Coords, stop: Coords}[],  // Connectors all consist of pairs of start/stop coordinates
    }[]
    resources: Resource[];
    colonists: ColonistSaveData[];
    // TODO: Add Technology, Storyline Event Choices, etc.
}

const handleSave = async (req: Request, res: Response) => {
    const saveInfo: SaveInfo = req.body;
    const client = new MongoClient("mongodb://localhost:27017", {});
    try {
        await client.connect();
        console.log("Connected to database.");
        const db = client.db(dbName);
        const insert = await db.collection(collectionName).insertOne(saveInfo);
        assert.equal(insert.acknowledged, true);
        console.log(`Save file created for ${saveInfo.username}`);
        res.status(201).json({ message: `Save file created for ${saveInfo.username} at ${saveInfo.time.toString()}` });
        console.log("Closing database connection.");
        client.close();
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: true, message: `Error encountered while trying to process save for ${saveInfo.username}` });
    }
}

module.exports = {
    handleSave,
}