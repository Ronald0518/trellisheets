const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'zones.db');
let db;

function initializeDatabase() {
  db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      folderPath TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#3B82F6',
      zone_style TEXT DEFAULT '{}',
      notes TEXT DEFAULT '',
      description TEXT DEFAULT '',
      is_pinned INTEGER DEFAULT 0,
      pin_order INTEGER DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

function createZone({ name, folderPath, color, zone_style, description = '', notes = '' }) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO zones (name, folderPath, color, zone_style, description, notes) VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(name, folderPath, color, JSON.stringify(zone_style || {}), description, notes, function (err) {
      if (err) return reject(err);
      resolve({ success: true, id: this.lastID });
    });
    stmt.finalize();
  });
}

function loadZones() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM zones ORDER BY is_pinned DESC, pin_order ASC`, [], (err, rows) => {
      if (err) return reject(err);
      resolve({ success: true, zones: rows });
    });
  });
}

function updateZone(id, updates) {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    const stmt = db.prepare(`UPDATE zones SET ${fields}, updatedAt=CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(values, function (err) {
      if (err) return reject(err);
      resolve({ success: this.changes > 0 });
    });
    stmt.finalize();
  });
}

function deleteZone(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM zones WHERE id = ?`, id, function (err) {
      if (err) return reject(err);
      resolve({ success: this.changes > 0 });
    });
  });
}

function updatePinOrder(pinUpdates) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`UPDATE zones SET pin_order = ?, is_pinned = 1 WHERE id = ?`);
    db.serialize(() => {
      pinUpdates.forEach(({ id, pin_order }) => {
        stmt.run(pin_order, id);
      });
      stmt.finalize((err) => {
        if (err) return reject(err);
        resolve({ success: true });
      });
    });
  });
}

module.exports = {
  initializeDatabase,
  createZone,
  loadZones,
  updateZone,
  deleteZone,
  updatePinOrder
};
