import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { constants } from "../constants";

// Standardize name of the database (and collection):
const dbName: string = process.env.DB_NAME as string || "smars";    // Use DB called 'smars' by default
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
        console.log(`Database connection established. Getting all map files of type: ${type}.`);
        const db = client.db(dbName);
        await db
            .collection(collectionName)
            .find(dbQuery) // Find all for a given type
            .toArray((err, result) => {
                if (result != null) {
                    // If there are maps for a given type, see how many there are and randomly select one
                    const rando = Math.floor(Math.random() * result.length);
                    console.log(`Loading map data for ${type} map #${rando}.`);
                    res.status(200).json({ status: 200, mapInfo: result[rando]})
                    client.close();
                } else {
                    console.log(`ERROR: No maps found for type ${type}`);
                    client.close();
                }
            })
    } catch (err) {
        console.log(`ERROR: The following error occurred while trying to load a map file of type ${type}:`);
        console.log(err);
    }
}

module.exports = {
    getMap,
}