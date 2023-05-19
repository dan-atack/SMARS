 // Required External Modules

import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
const path = require("path");

// Enable HTTPS:

const fs = require('fs');
const https = require('https');

dotenv.config()

// Required Database Modules

const validateDB = require('./database_functions/validate_database');

// App Variables

if (!process.env.PORT) {
    // Exit on error code 1 if the environment variable for PORT is not loaded:
    console.log("Error: PORT number not found in environment variables.");
    process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);
const ENV: string = process.env.ENVIRONMENT?.toLowerCase() as string || 'dev';

const app = express();

// App Configuration

// Enables and sets defaults for a myriad of small middleware packages that set HTTP response headers. It's VERY important:
app.use(helmet());
// Enables cross-origin request handling across the board (prevents CORS-related errors):
app.use(cors());
// Stands in for the body-parser used in BlockLand; parses incoming requests into JSON format and enables you to access the request BODY:
app.use(express.json());
// Define the path to the public directory and set it as the server's static folder (for non-dev environments only)
if (ENV !== "dev") {
    const publicPath = path.join(__dirname, '../public');
    app.use(express.static(publicPath));
}

// Server Endpoints
app.use(require('./endpoints/loginEndpoints'));
app.use(require('./endpoints/loadEndpoints'));
app.use(require('./endpoints/mapEndpoints'));
app.use(require('./endpoints/structureEndpoints'));
app.use(require('./endpoints/saveEndpoints'));

// Server Activation

// Import TLS certificate and private key (only for staging and production environments)
if (ENV !== 'dev') {
    const serverOptions = {
        cert: fs.readFileSync('certificates/fullchain1.pem'),
        key: fs.readFileSync('certificates/privkey1.pem')
    }
    // Create HTTPS server??
    const server = https.createServer(serverOptions, app);

    server.listen(443, () => {
        console.log(`HTTPS server listening at port 443.`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
        // Validate database connection when server is initialized
        validateDB();
    });
}




