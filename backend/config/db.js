const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'bgmi_auction_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        pool.releaseConnection(connection);
        // console.log("Database connected successfully");
    })
    .catch(err => {
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n\n\x1b[31m%s\x1b[0m', '---------------------------------------------------------------------------------');
            console.error('❌ DATABASE CONNECTION FAILED: ACCESS DENIED');
            console.error('It seems you have a password set for your MySQL "root" user, but it is not in the .env file.');
            console.error('---------------------------------------------------------------------------------');
            console.error('👉 PLEASE OPEN "backend/.env" AND SET "DB_PASSWORD=your_actual_password"');
            console.error('---------------------------------------------------------------------------------\n\n');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('\n\n\x1b[31m%s\x1b[0m', '---------------------------------------------------------------------------------');
            console.error('❌ DATABASE CONNECTION FAILED: DATABASE NOT FOUND');
            console.error('The database "bgmi_auction_db" does not exist.');
            console.error('---------------------------------------------------------------------------------');
            console.error('👉 PLEASE RUN THE SETUP SQL SCRIPT IN YOUR MYSQL WORKBENCH OR CLI');
            console.error('   source backend/setup_db.sql');
            console.error('---------------------------------------------------------------------------------\n\n');
        } else {
            console.error('Database Connection Error:', err);
        }
    });

module.exports = pool;
