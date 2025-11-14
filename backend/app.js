const express = require('express');
const pool = require('./config/database');
const path = require('path');
const routes = require('./router/routes');
const app = express();
const port = 3000;

app.use(express.json());

app.use('/api',routes);

// Serve React frontend
const buildPath = path.join(__dirname, 'frontend', 'build');


app.use(express.static(buildPath));
app.get("/api/whoami", (req, res) => {
  res.json({
    hostname: require("os").hostname(),
    time: new Date().toISOString(),
  });
});

// React Router catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend running on port ${port}`);
});

