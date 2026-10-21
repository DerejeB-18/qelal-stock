const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security shields and helpers
app.use(helmet());
app.use(cors());
app.use(express.json());

// Our special heartbeat route!
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Turn on the server
app.listen(PORT, () => {
  console.log(`Server is awake and running on port ${PORT}!`);
});