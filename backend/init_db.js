const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function init() {
  try {
    // 1. Connect without Database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });

    console.log("🔌 Connected to MySQL...");

    // 2. Read SQL File
    const sqlPath = path.join(__dirname, 'setup_db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // 3. Enable multi-statements behavior manually or split
    // mysql2 supports multipleStatements: true in connection config, let's try that or just split
    // Re-connect with multiple statements enabled
    await connection.end();
    
    const multiStmtConnection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    console.log("🚀 Executing Setup Script...");
    await multiStmtConnection.query(sql);
    
    console.log("✅ Database and Tables Created Successfully!");
    console.log("✅ Seed Data Inserted!");
    
    await multiStmtConnection.end();
    process.exit(0);

  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error("👉 Check your Password in .env file!");
    }
    process.exit(1);
  }
}

init();
