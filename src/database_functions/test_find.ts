import { MongoClient } from "mongodb";
import { Request, Response } from "express";

const getTestData = async (req: Request, res: Response) => {
    const { dbName, collection } = req.params;
    const client = new MongoClient('mongodb://localhost:27017', {});
    await client.connect();
    console.log('connection established!');
    // first param: database name
    const db = client.db(dbName);
  
    // All we want to do here is to use the params to get to the right collection...
    await db
      // second param: collection name:
      .collection(collection)
      // within our collection, find() gets everything in it, then toArray makes it into a list...
      .find()
      .toArray((err, data) => {
        // good practice: if there is an error, tell us there's been an issue, otherwise send back the data as STATUS,
        if (err) {
          console.log('errOR!');
        } else {
          res.status(200).json({ status: 200, names: data });
          // ... and finally close the connection.
          client.close();
          console.log('disconnected!');
        }
      });
  };

module.exports = getTestData;