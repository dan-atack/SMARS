import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { constants } from "../constants";

const dbName = "smars";

// This function's job will be to fetch all of the modules/connectors of a requested type (e.g. test, transport, habitation, etc.)
const getStructures = async (req: Request, res: Response) => {
    // Category = modules/connectors; type = what type of module/connector (e.g. habitation, transport, etc.)
    const { category, type } = req.params;
    const client = new MongoClient(constants.DB_URL_STRING, {});
    try {
        await client.connect();
        console.log(`Database connection established. Getting structure data for ${type} ${category}.`);
        const db = client.db(dbName);
        await db
            .collection(category)
            .find()
            .toArray((err, result) => {
                if (result != null) {
                    // If building category exists, filter the result by type before returning to the front-end:
                    // console.log(`Found ${result.length} structures in ${category} collection. Filtering results by type ${type}`);
                    const resultsByType = result.filter((structure) => {
                        return structure.type.toLowerCase() === type.toLowerCase();
                    })
                    console.log(`Found ${resultsByType.length} results for ${type} ${category}.`);
                    res.status(200).json({ status: 200, data: resultsByType });
                    client.close();
                } else {
                    console.log(`ERROR: No structure data found for ${type} collection.`);
                    res.status(404).json({ status: 404, data: [] })
                    client.close();
                }
            })
    } catch (err) {
        console.log(`ERROR: The following error occurred while trying to find structure data for ${type} ${category}:`);
        console.log(err);
    }
}

// Given the category, type and name of a structure, retrieve its data
const getOneStructure = async (req: Request, res: Response) => {
    // Category = modules/connectors; type = what type of module/connector (e.g. habitation, transport, etc.)
    const { category, type, name } = req.params;
    const dbQuery = { "name": name, "type": type };
    const client = new MongoClient(constants.DB_URL_STRING, {});
    try {
        await client.connect();
        console.log(`Database connection established. Getting structure data for ${name}.`);
        const db = client.db(dbName);
        await db
            .collection(category)
            .findOne(dbQuery, (err, result) => {
                if (result != null) {
                    console.log(`Found ${name} in ${type} ${category}.`);
                    res.status(200).json({ status: 200, data: result });
                    client.close();
                } else {
                    console.log(`ERROR: No results found for ${name} in ${category} collection`);
                    res.status(404).json({ status: 404, data: [] })
                    client.close();
                }
            })
    } catch (err) {
        console.log(`ERROR: The following error occurred while trying to find structure data for ${name}:`);
        console.log(err);
    }
}

const getStructureTypes = async (req: Request, res: Response) => {
    const { category } = req.params;
    const client = new MongoClient(constants.DB_URL_STRING, {});
    // Toggle switch to allow or exclude structures with the 'test' type
    const includeTests = false;
    try {
        await client.connect();
        console.log(`Database connection established. Getting structure types information for ${category}.`);
        const db = client.db(dbName);
        await db
            .collection(category)
            .find()
            .toArray((err, result) => {
                if (result != null) {
                    // If the building CATEGORY exists, make a list of all the different TYPES of structure in that category:
                    let types: string[] = [];
                    // If a structure's type is not already listed, add it to the list of unique types:
                    result.forEach((structure) => {
                        if (!types.includes(structure.type)) {
                            // Only include test structures if toggle switch is set to true
                            if (structure.type == "test") {
                                if (includeTests) types.push(structure.type);
                            } else {
                                types.push(structure.type);
                            }
                        }
                    })
                    console.log(`Returning ${types.length} ${category} types.`);
                    res.status(200).json({
                        status: 200,
                        data: types
                    });
                    client.close();
                } else {
                    console.log(`ERROR: No structure types data found for ${category} collection.`);
                    res.status(404).json({ status: 404, data: [] })
                    client.close();
                }
            })
    } catch (err) {
        console.log(`ERROR: The following error occurred while trying to find structure types data for ${category}:`);
        console.log(err);
    }
}

module.exports = {
    getStructures,
    getStructureTypes,
    getOneStructure
}