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

// React Router catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
