const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite database file path
const dbPath = path.resolve(__dirname, 'tasks.sqlite');

// Create and connect database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting database:', err.message);
  } else {
    console.log('SQLite DB connected.');

    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
      )
    `);
  }
});

module.exports = db;
