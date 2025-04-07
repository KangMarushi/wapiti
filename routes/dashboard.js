const express = require('express');
const router = express.Router();
const path = require('path');

// Serve the dashboard page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

module.exports = router; 