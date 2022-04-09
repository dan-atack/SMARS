import express from "express";

const router = express.Router();

// Import save handler function:

const { handleSave } = require('../server_functions/saveFunctions');

router.post('/api/save', handleSave);

module.exports = router;