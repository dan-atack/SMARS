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

const PORT: number = parseInt(process.env.PORT as string, 10) || 7000;
const HTTPS_PORT: number = parseInt(process.env.HTTPS_PORT as string, 10) || 443;
const ENV: string = process.env.ENVIRONMENT?.toLowerCase() as string || 'local_dev';

const app = express();

// App Configuration

// Enables and sets defaults for a myriad of small middleware packages that set HTTP response headers. It's VERY important:
app.use(helmet());
// Enables cross-origin request handling across the board (prevents CORS-related errors):
app.use(cors());
// Stands in for the body-parser used in BlockLand; parses incoming requests into JSON format and enables you to access the request BODY:
app.use(express.json());
// Define the path to the public directory and set it as the server's static folder
const publicPath = path.join(__dirname, './public');
app.use(express.static(publicPath));

// Server Endpoints
app.use(require('./endpoints/randomEventEndpoints'));
app.use(require('./endpoints/loginEndpoints'));
app.use(require('./endpoints/loadEndpoints'));
app.use(require('./endpoints/mapEndpoints'));
app.use(require('./endpoints/structureEndpoints'));
app.use(require('./endpoints/saveEndpoints'));

// Server Activation

// Import TLS certificate and private key (only for staging and production environments)
if (ENV !== 'local_dev') {
    const serverOptions = {
        cert: fs.readFileSync('certificates/fullchain1.pem'),
        key: fs.readFileSync('certificates/privkey1.pem')
    }
    // Create HTTPS server??
    const server = https.createServer(serverOptions, app);

    server.listen(443, () => {
        console.log(`Server is running in ${ENV} environment.`);
        console.log(`HTTPS server listening at port ${HTTPS_PORT}.`);
        // Validate database connection when server is initialized
        validateDB();
    });
} else {
    app.listen(PORT, () => {
        console.log(`Server is running in ${ENV} environment.`);
        console.log(`Listening on port ${PORT}`);
        // Validate database connection when server is initialized
        validateDB();
    });
}




