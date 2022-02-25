import express from "express";

const router = express.Router();

// Import building fetch function:

const { getStructures } = require('../server_functions/structureFunctions');

router.get('/api/structures/:type', getStructures);

module.exports = router;