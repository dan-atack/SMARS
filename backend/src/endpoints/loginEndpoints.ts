import express from "express";

const router = express.Router();

// Import login and signup handler functions:

const { handleLogin, handleSignup } = require('../server_functions/loginFunctions');

router.post('/api/login', handleLogin);
router.post('/api/signup', handleSignup);

module.exports = router;