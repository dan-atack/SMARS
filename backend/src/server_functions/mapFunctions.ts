import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import assert from "assert";
import { constants } from "../constants";

// Standardize name of the database (and collection):
const dbName = 'smars'
const collectionName = 'maps'

// Template for new map (terrain) info:

type MapInfo = {
    // If no id is provided, mongo makes one..?
    name: string,
    type: string,   // There will be a few types (glacial, highland, riverbed) to allow map category selection
    terrain: number[][] // A list of lists of numbers??
}

// Called by visiting the server's map endpoint for a given map type:
const getMap = async (req: Request, res: Response) => {
    const { type } = req.params;
    const dbQuery = { type: type }
    const client = new MongoClient(constants.DB_URL_STRING, {});
    try {
        await client.connect();
        console.log("Database connection established");
        const db = client.db(dbName);
        await db
            .collection(collectionName)
            .find(dbQuery) // Find all for a given type
            .toArray((err, result) => {
                if (result != null) {
                    // If there are maps for a given type, see how many there are:
                    console.log(`Found ${result.length} maps for type ${type}:`);
                    const rando = Math.floor(Math.random() * result.length);
                    console.log(`Randomly selecting map at index position ${rando}`);
                    res.status(200).json({ status: 200, mapInfo: result[rando]})
                    client.close();
                    console.log("Closing database client");
                } else {
                    console.log(`No maps found for type ${type}`);
                    client.close();
                    console.log("Closing database client");
                }
            })
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getMap,
}