import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Railway's container filesystem is writable under /tmp; relative ./data can
// fail or point at a non-persistent path depending on CWD.
const dbPath = process.env.DATABASE_PATH
  || (process.env.NODE_ENV === 'production' ? '/tmp/salesflow.db' : './data/salesflow.db');
const dbDir = path.dirname(dbPath);

if (dbDir && dbDir !== '.' && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Use Node's built-in SQLite (Node >= 22.5). Avoids better-sqlite3 native
// addons, which segfault on Railway when the prebuilt binary does not match
// the runtime Node/glibc image.
const native = new DatabaseSync(dbPath);

function wrapStatement(stmt) {
  return {
    run: (...params) => stmt.run(...params),
    get: (...params) => stmt.get(...params),
    all: (...params) => stmt.all(...params),
  };
}

const db = {
  prepare(sql) {
    return wrapStatement(native.prepare(sql));
  },
  exec(sql) {
    return native.exec(sql);
  },
  pragma(pragma) {
    native.exec(`PRAGMA ${pragma};`);
  },
  transaction(fn) {
    return (...args) => {
      native.exec('BEGIN');
      try {
        const result = fn(...args);
        native.exec('COMMIT');
        return result;
      } catch (err) {
        try { native.exec('ROLLBACK'); } catch { /* ignore */ }
        throw err;
      }
    };
  },
};

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
