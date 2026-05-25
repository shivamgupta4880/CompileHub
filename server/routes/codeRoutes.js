const express = require('express');
const router = express.Router();
const { execute, getLanguages } = require('../controllers/codeController');

// Code execution is public (no auth required) for demo purposes
router.post('/execute', execute);
router.get('/languages', getLanguages);

module.exports = router;
