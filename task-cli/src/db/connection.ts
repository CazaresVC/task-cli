import Database from 'better-sqlite3';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

export function getDefaultDbPath(): string {
  const dir = path.join(os.homedir(), '.task-cli');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'tasks.db');
}

export function createDatabase(dbPath?: string): Database.Database {
  const resolvedPath = dbPath ?? getDefaultDbPath();
  const db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}
