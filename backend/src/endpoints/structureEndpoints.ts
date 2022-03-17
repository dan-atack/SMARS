import express from "express";

const router = express.Router();

// Import building fetch function:

const { getStructures, getStructureTypes } = require('../server_functions/structureFunctions');

router.get('/api/:category/:type', getStructures);
router.get('/api/:category', getStructureTypes);

module.exports = router;