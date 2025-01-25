const express = require('express');
const { toggleSearch } = require('../controllers/searchController');

const router = express.Router();

// Route to start or stop the search
router.post('/toggle-search', toggleSearch);

module.exports = router;
