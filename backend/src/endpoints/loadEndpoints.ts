import express from "express";

const router = express.Router();

// Import load game middleware functions:

const { loadGamesForUser, loadGameData } = require("../server_functions/loadFunctions");

router.get('/api/load-games/:username', loadGamesForUser);
router.get('/api/load/:id', loadGameData);

module.exports = router;