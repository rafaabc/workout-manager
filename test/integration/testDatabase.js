import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '../../src/database/migrations');

export function createTestDatabase() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.exec(sql);
  }

  return db;
}

export function clearTestDatabase(db) {
  db.exec('DELETE FROM workouts');
  db.exec('DELETE FROM goals');
  db.exec('DELETE FROM users');
}
