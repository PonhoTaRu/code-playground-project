const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./users.db");

db.serialize(() => {

  db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS play_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    problem_title TEXT,
    difficulty TEXT,
    status TEXT,
    score INTEGER,
    source_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `);

});

module.exports = db;