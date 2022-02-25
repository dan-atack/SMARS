 // Required External Modules

import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";

dotenv.config()

// Required Database Modules

const getTestData = require('./database_functions/test_find');
const getFrontend = require('./database_functions/test_frontend');

// App Variables

if (!process.env.PORT) {
    // Exit on error code 1 if the environment variable for PORT is not loaded:
    process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();

// App Configuration

// Enables and sets defaults for a myriad of small middleware packages that set HTTP response headers. It's VERY important:
app.use(helmet());
// Enables cross-origin request handling across the board (prevents CORS-related errors):
app.use(cors());
// Stands in for the body-parser used in BlockLand; parses incoming requests into JSON format and enables you to access the request BODY:
app.use(express.json());
// // Set the public directory as the server's static 

// Server Endpoints
app.use(require('./endpoints/loginEndpoints'));
app.use(require('./endpoints/mapEndpoints'));
app.use(require('./endpoints/structureEndpoints'))
// Test functions - do we still need 'em?
app.get('/api/:dbName/:collection', getTestData);
// Test endpoint for communication with the frontend:
app.get('/api/test', getFrontend);

// Server Activation

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})