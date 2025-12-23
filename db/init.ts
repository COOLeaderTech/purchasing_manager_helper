import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function initializeDatabase() {
  const dbPath = process.env.DATABASE_PATH || './data/maritime-assistant.db';
  const dbDir = path.dirname(dbPath);

  // Create data directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Open/create database
  const db = new Database(dbPath);

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Load and execute schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  return db;
}

// Database singleton
let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
