import { Request, Response } from "express";
import { MongoClient, ObjectId } from "mongodb";
import assert from "assert";
import { SaveInfo } from "./saveFunctions"
import { constants } from "../constants";

// Standardize name of the database:
const dbName = 'smars';
const collectionName = 'saves';

const loadGamesForUser = async (req: Request, res: Response) => {
    const { username } = req.params;
    const dbQuery = { username: username };
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
                    console.log(`Found ${result.length} saved games for ${username}:`);
                    // Return only a small portion of each file's data:
                    let saves: any[] = [];
                    result.forEach((save) => {
                        let population = 0;
                        if (save.colonists) {
                            population = save.colonists.length;
                        }
                        const summary = {
                            id: save._id,
                            game_name: save.game_name,
                            game_time: save.game_time,
                            timestamp: save.time,
                            // Properties that might not be in older files start here:
                            population: population,
                        };
                        saves.push(summary);
                    })
                    res.status(200).json({ status: 200, saves: saves})
                    client.close();
                    console.log("Closing database client");
                } else {
                    console.log(`No maps found for type ${username}`);
                    client.close();
                    console.log("Closing database client");
                }
            })
    } catch (err) {
        console.log(err);
    }
}

const loadGameData = async (req: Request, res: Response) => {
    const { id } = req.params;
    const dbQuery = { "_id": new ObjectId(id) };
    const client = new MongoClient(constants.DB_URL_STRING, {});
    try {
        await client.connect();
        console.log("Connected to database. Bleep.");
        const db = client.db(dbName);
        await db.collection(collectionName).findOne(dbQuery, (err, result) => {
            if (result != null) {
                console.log(`Dispatching save data for game ${result.game_name}`);
                res.status(200).json({ status: 200, data: result })
            } else {
                console.log(`Save data not found for game ${id}`);
                res.status(404).json({ status: 404, message: "Save file not found :("});
            }
            client.close();
            console.log("Closing database client.");
        })
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    loadGamesForUser,
    loadGameData
}