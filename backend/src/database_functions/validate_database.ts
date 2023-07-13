import { Db, MongoClient } from "mongodb";
import data from "../../databaseSeed.json";
import assert from "assert";
import { constants } from "../constants";

// Define the structure of the database seed file
type SeedData = {
    maps: [],
    modules: [],
    connectors: []
}

// This function runs once when the server is booted up, and checks if the DB is running and has been provisioned
const validateDB = async () => {
    const dbName: string = process.env.DB_NAME as string || "smars";    // Use DB called 'smars' by default
    console.log("Server up. Attempting to validate database connection with mongodb.");
    const client = new MongoClient(constants.DB_URL_STRING, {});
    try {
        await client.connect();
        console.log('Checking database for maps...');
        const db = client.db(dbName);
        const maps = await db.collection("maps").find().toArray();
        if (maps.length > 0) {
            console.log(`Found ${maps.length} maps.`);
        } else {
            await seedDB(db, "maps");
        }
        console.log('Checking database for modules...');
        const modules = await db.collection("modules").find().toArray();
        if (modules.length > 0) {
            console.log(`Found ${modules.length} modules.`);
        } else {
            await seedDB(db, "modules");
        }
        console.log('Checking database for connectors...');
        const connectors = await db.collection("connectors").find().toArray();
        if (connectors.length > 0) {
            console.log(`Found ${connectors.length} connectors.`);
        } else {
            await seedDB(db, "connectors");
        }
        console.log('Checking database for random events...');
        const evs = await db.collection("random_events").find().toArray();
        if (connectors.length > 0) {
            console.log(`Found ${evs.length} random events.`);
        } else {
            await seedDB(db, "connectors");
        }
        await client.close();
          
    } catch (err) {
        console.log(`Error connecting to database: ${err}.\nPlease check that your mongodb service is initialized and listening to port 27017, and restart the SMARS server.`);
    }
    
};

// If any collections are empty, provision them with the data from the seed file
// NOTE: Assumes a db connection is already open
const seedDB = async (db: Db, collection: string) => {
    console.log(`No ${collection} found. Seeding ${collection}...`);
    const items = data[collection as keyof SeedData];
    if (items && items.length > 0) {
        await db.collection(collection).insertMany(items);
    }
    
}

module.exports = validateDB;