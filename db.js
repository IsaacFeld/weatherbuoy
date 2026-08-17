import Database from 'better-sqlite3';
import path from 'path';

// 1. Setup the path (Using 'data' folder for Railway Volume persistence)
const dbPath = path.resolve('database', 'measurements.sqlite');

// 2. Connect to the database
const db = new Database(dbPath);

// 3. Recommended: Enable WAL mode for better performance 
// (prevents "database is locked" errors during high-frequency MQTT writes)
db.pragma('journal_mode = WAL');

// 4. Create the table (No need for .serialize() anymore)
db.exec(`
  CREATE TABLE IF NOT EXISTS measurements (
      id TEXT PRIMARY KEY,
      timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      water_1 REAL,
      water_2 REAL,
      air REAL,
      humidity REAL
  )
`);

// 5. Prepare statements once for reuse
const insertStmt = db.prepare(`
  INSERT INTO measurements (id, water_1, water_2, air, humidity) 
  VALUES (?, ?, ?, ?, ?)
`);

// 6. Exported Functions
export const getMeasurements = () => {
  try {
    // .all() returns an array of objects immediately
    return db.prepare('SELECT * FROM measurements').all();
  } catch (err) {
    console.error("Error fetching measurements:", err);
    return [];
  }
}

export const insertMeasurement = (id, water_1, water_2, air, humidity) => {
  try {
    // .run() executes the prepared statement synchronously
    insertStmt.run(id, water_1, water_2, air, humidity);
    console.log(`Logged UUID: ${id} at ${new Date().toISOString()}`);
  } catch (err) {
    console.error(`Failed to log measurement ${id}:`, err.message);
  }
};