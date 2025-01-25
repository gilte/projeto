require('dotenv').config(); // Load environment variables

console.log('Loaded environment variables:', process.env); // Log all environment variables

const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI; // Read the URI from the .env file

if (!mongoURI) {
  console.error('MONGO_URI is not defined. Please check your .env file.');
} else {
  console.log('Mongo URI:', mongoURI); // Log the mongoURI to check if it's defined

  mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));
}