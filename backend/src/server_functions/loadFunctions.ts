import { Request, Response } from "express";
import { MongoClient, ObjectId } from "mongodb";
import assert from "assert";
import { SaveInfo } from "./saveFunctions"

// Standardize name of the database:
const dbName = 'smars';
const collectionName = 'saved_games';

const loadGamesForUser = async (req: Request, res: Response) => {
    const { username } = req.params;
    const dbQuery = { username: username };
    const client = new MongoClient("mongodb://localhost:27017", {});
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
                        const summary = {
                            id: save._id,
                            game_name: save.game_name,
                            game_time: save.game_time,
                            timestamp: save.time
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
    const client = new MongoClient("mongodb://localhost:27017", {});
    try {
        await client.connect();
        console.log("Connected to database. Bleep.");
        const db = client.db(dbName);
        await db.collection(collectionName).findOne(dbQuery, (err, result) => {
            if (result != null) {
                res.status(200).json({ status: 200, data: result })
            } else {
                res.status(404).json({ status: 404, message: "Save file not found :("});
            }
        })
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    loadGamesForUser,
    loadGameData
}