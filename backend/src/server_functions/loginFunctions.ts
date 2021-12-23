import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import assert from "assert";

// Standardize name of the database:
const dbName = 'smars'
const collectionName = 'users'

// Template for new user info:

type UserInfo = {
    username: string,
    password: string,
    dateJoined: Date,
    lastSession: Date | null,
    saves: Array<[]>,
}

// Find an existing username in the DB and allow login to proceed if it's there and the password matches:
const handleLogin = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    // Create database query: an object that will uniquely match an entry in the database (can we use username instead of _id??)
    const dbQuery = { username: username }
    const client = new MongoClient("mongodb://localhost:27017", {});
    try {
        await client.connect();
        console.log("Connected to database...");
        const db = client.db(dbName);  // Use SMARS database
        await db
            .collection(collectionName)  // Users collection
            // Look for the user with the username that is in the request body:
            .findOne(dbQuery, (err, result) => {
                if (result) {
                    // Check if password matches DB entry:
                    if (result.password === password) {
                        res.status(200).json({ status: 200, data: 'Login successful' })
                    } else {
                        res.status(403).json({ status: 403, data: 'Password does not match username'})
                    }
                } else {
                    res.status(404).json({ status: 404, data: `Username ${username} not found.` })
                }
            })
    } catch (err) {
        console.log(err)
    }
}

// Before writing a new username to the DB, find out if it exists already, and only write to the DB if the name is available:
const handleSignup = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const doc: UserInfo = {
        username: username,
        password: password,
        dateJoined: new Date(),
        lastSession: null,
        saves: [],
    }
    const dbQuery = {username: username};   // to check if username already exists
    let usernameAvailable = true;  // We'll check if the username is already in the DB and change this to false if so.

    const client = new MongoClient("mongodb://localhost:27017", {});
    try {
        console.log("Connecting to database...");
        await client.connect();
        const db = client.db(dbName);
        await db
            .collection(collectionName)
            // Search for the username in the db; if it can't be found, move on to next step - otherwise respond that name is taken.
            .findOne(dbQuery, async (err, result) => {
                if (result) {
                    console.log(`Username ${username} already exists in database.`);
                    res.status(409).json({ status: 409, data: "Username already exists"})
                    usernameAvailable = false;  // Only allow operation if username is not already taken.
                } else {
                    // Initiate DB write operation only if the username does not exist already:
                    const insert = await db.collection(collectionName).insertOne(doc);
                    assert.equal(true, insert.acknowledged);
                    console.log(`New user entry created for ${username}`);
                    res.status(201).json({ status: 201, data: `User ${username} registered successfully!`})
                }
            });
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    handleLogin,
    handleSignup,
}