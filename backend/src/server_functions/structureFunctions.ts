import { Request, Response } from "express";
import { MongoClient } from "mongodb";

const dbName = "smars";

// This function's job will be to fetch a list of buildings from either the Modules or Connectors collections
const getStructures = async (req: Request, res: Response) => {
    const { type } = req.params;
    const client = new MongoClient("mongodb://localhost:27017", {});
    try {
        await client.connect();
        console.log("Database connection established.");
        const db = client.db(dbName);
        await db
            .collection(type)
            .find()
            .toArray((err, result) => {
                if (result != null) {
                    console.log(`Found ${result.length} structures in ${type} collection.`);
                    res.status(200).json({ status: 200, data: result });
                    client.close();
                    console.log("Closing database collection.");
                } else {
                    console.log(`No results found for ${type} collection.`);
                    res.status(404).json({ status: 404, data: [] })
                    client.close();
                    console.log("Closing database collection.");
                }
            })
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getStructures
}