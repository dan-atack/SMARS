import express from "express";

const router = express.Router();

// Import map-finder functions:

const { getMap } = require('../server_functions/mapFunctions');

router.get('/api/maps/:type', getMap);

module.exports = router;