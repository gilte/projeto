require('dotenv').config(); // Load environment variables

const express = require('express'); // Framework Express
const mongoose = require('mongoose'); // ORM for MongoDB
const bodyParser = require('body-parser'); // For parsing JSON
const path = require('path'); // For handling file paths
const searchRoute = require('./src/routes/searchRoute'); // Search route

const app = express();
const PORT = process.env.PORT || 3000; // Define the port for the server

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MONGO_URI is not defined. Please check your .env file.');
} else {
  console.log('Mongo URI:', mongoURI); // Log the mongoURI to check if it's defined

  mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));
}

// Routes
app.use('/api/search', searchRoute);

// Route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
