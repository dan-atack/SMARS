import express from "express";

const router = express.Router();

// Import random event middleware functions:

const { handleRandomEvent } = require("../server_functions/randomEventFunctions");

router.post('/api/random-event', handleRandomEvent);

module.exports = router;