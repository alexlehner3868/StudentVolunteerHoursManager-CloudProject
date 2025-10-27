const fs = require('fs');
const { Pool } = require('pg');

// Database connection
const dbPasswordFile = process.env.DB_PASSWORD_FILE || './secrets/db_password.txt';
const dbPassword = fs.readFileSync(dbPasswordFile, 'utf-8').trim();

// create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'student_volunteer',
  user: process.env.DB_USER || 'admin',
  password: dbPassword,
});

// test connection
pool.on('connect',()=>{
    console.log('Database connected successfully');
});

pool.on('error',(err)=>{
    console.log('Database error:',err);
});

module.exports = pool;