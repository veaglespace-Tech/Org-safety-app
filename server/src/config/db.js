const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'organization_safty',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected Successfully....');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err.message);
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error(`Database '${process.env.DB_NAME}' does not exist. Please create it.`);
    }
  });

module.exports = pool;
