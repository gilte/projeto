const mongoose = require('mongoose');

// Define the schema for the search model
const searchSchema = new mongoose.Schema({
  rangeStart: {
    type: String, // Example: '1000'
    required: true
  },
  rangeEnd: {
    type: String, // Example: '2000'
    required: true
  },
  targetHash: {
    type: String, // Target hash
    required: true
  },
  result: {
    type: String, // The found private key
    default: null
  },
  status: {
    type: String, // Search status: 'in-progress', 'concluded', etc.
    default: 'in-progress'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the search model
const Search = mongoose.model('Search', searchSchema);

module.exports = Search;
