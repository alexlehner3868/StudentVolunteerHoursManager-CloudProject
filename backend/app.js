const express = require('express');
const pool = require('./config/database');
const path = require('path');
const routes = require('./router/routes');
const app = express();
const port = 3000;

app.use(express.json());


app.use('/api',routes);


// End point to get monthly hours submitted by student by status
app.get('/api/volunteer-hours/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const query =
     ` SELECT
        TO_CHAR(datevolunteered, 'YYYY-MM') AS month,
        CASE
          WHEN externsupstatus = 'Pending' THEN 'waiting_supervisor'
          WHEN externsupstatus = 'Approved' AND (guidancecounsellorapproved IS NULL OR guidancecounsellorapproved = 'Pending')
            THEN 'waiting_gc'
          WHEN externsupstatus = 'Approved' AND guidancecounsellorapproved = 'Accepted'
            THEN 'approved'
          WHEN externsupstatus = 'Rejected' OR guidancecounsellorapproved = 'Rejected'
            THEN 'rejected'
        END AS status,
        SUM(hours) AS hours FROM volunteerhoursubmission WHERE studentid = $1 GROUP BY month, status ORDER BY month;`;

    // Send query to database and get result 
    const result = await pool.query(query, [studentId]);

    // Send result to frontend
    res.json(result.rows);

  } catch (err) {
    console.error('Error Getting Monthly View:', err);
    res.status(500).json({ error: err.message });
  }
});

// End point to return total hours for a student by status
app.get('/api/volunteer-summary/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const query = 
      `SELECT SUM(CASE WHEN externsupstatus = 'Approved' AND guidancecounsellorapproved = 'Accepted'
        THEN hours ELSE 0 END) AS approved_hours, SUM(hours) AS total_submitted FROM volunteerhoursubmission WHERE studentid = $1;`;

    // Send to database and get result 
    const result = await pool.query(query, [studentId]);
    // Send result to frontend 
    res.json(result.rows[0]);

  } catch (err) {
    console.error('Error Getting Agg Summary:', err);
    res.status(500).json({ error: err.message });
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
