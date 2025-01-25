const { Worker } = require('worker_threads');
const path = require('path');
const Search = require('../models/searchModel'); // Import the Search model

let activeWorker = null;

const toggleSearch = async (req, res) => {
  const { rangeStart, rangeEnd, targetHash, minStep, maxStep } = req.body;

  // Validate required parameters
  if (!rangeStart || !rangeEnd || !targetHash || !minStep || !maxStep) {
    console.error('Missing required parameters.');
    return res.status(400).json({ type: 'error', message: 'Missing required parameters.' });
  }

  // Avoid multiple simultaneous searches
  if (activeWorker) {
    console.error('A search is already in progress.');
    return res.status(400).json({ type: 'error', message: 'A search is already in progress.' });
  }

  // Create a new search documen
  const search = new Search({
    rangeStart,
    rangeEnd,
    targetHash,
    status: 'in-progress'
  });

  try {
    await search.save(); // Save the search document to the database
  } catch (error) {
    console.error('Failed to save search data:', error);
    return res.status(500).json({ type: 'error', message: 'Failed to save search data.', error });
  }

  try {
    console.log('Initializing worker with data:', { rangeStart, rangeEnd, targetHash, minStep, maxStep });
    activeWorker = new Worker(path.join(__dirname, '../workers/worker.js'), {
      workerData: { rangeStart, rangeEnd, targetHash, minStep, maxStep },
    });
  } catch (error) {
    console.error('Failed to initialize worker:', error);
    return res.status(500).json({ type: 'error', message: 'Failed to initialize worker.', error });
  }

  let responseSent = false; // Flag to avoid multiple responses

  const handleResponse = async (type, message) => {
    if (!responseSent) {
      responseSent = true;

      if (type === 'found') {
        search.result = message.privateKey;
        search.status = 'concluded';
        await search.save();
        res.json({ type: 'found', message: 'Search completed.', privateKey: message.privateKey });
      } else if (type === 'finished') {
        search.status = 'concluded';
        await search.save();
        res.json({ type: 'finished', message: 'Search completed without finding the private key.' });
      } else if (type === 'error') {
        res.status(500).json({ type: 'error', message: 'Worker error.', error: message.error });
      } else if (type === 'exit') {
        res.status(500).json({ type: 'error', message });
      }

      if (activeWorker) {
        activeWorker.terminate();
        activeWorker = null;
      }
    }
  };

  activeWorker.on('message', async (message) => {
    
    if (message.type === 'update') {
      process.stdout.write(`${message.message}\r`); // Log progress
    } else if (message.type === 'found') {
      console.log('Private Key found: ', message.privateKey);
      await handleResponse('found', message);
    } else if (message.type === 'finished') {
      console.log('Search completed without finding the private key.');
      await handleResponse('finished', message);
    }
  });

  activeWorker.on('error', (error) => {
    console.error('Worker error:', error);
    handleResponse('error', { error });
  });

  activeWorker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
      handleResponse('exit', `Worker stopped with exit code ${code}`);
    } else {
      console.log('Worker exited successfully.');
      activeWorker = null;
    }
  });

  console.log('Search started.');
  res.json({ type: 'started', message: 'Search started.' });
};

module.exports = { toggleSearch };
