const express = require('express');
const pool = require('./config/databse');
const path = require('path');
const routes = require('./router/routes');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

app.use('/api',routes);


// API endpoint
app.post('/api/submit-hours', async (req, res) => {
  try {
    const studentID = 1; // TODO: replace with real login

    const {
      hours,
      minutes,
      date_volunteered,
      extern_sup_email,
      extern_sup_name,
      description,
      organization
    } = req.body;

    const totalHours = parseInt(hours) + parseInt(minutes) / 60;

    const query = `
      INSERT INTO VolunteerHourSubmission
        (StudentID, Hours, DateVolunteered, ExternSupEmail, ExternSupStatus, ExternSupComments, GuidanceCounsellorFlag)
      VALUES ($1, $2, $3, $4, 'Pending', $5, FALSE)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      studentID,
      totalHours,
      date_volunteered,
      extern_sup_email,
      description,
    ]);

    res.status(201).json({ success: true, submission: result.rows[0] });
  } catch (err) {
    console.error('Error inserting submission:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

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
