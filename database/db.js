import sqlite3 from 'sqlite3'

// Connect to (or create) the database file
const db = new sqlite3.Database('database/measurements.sqlite');

db.serialize(() => {
  // 1. Create the table
  db.run(`
    CREATE TABLE IF NOT EXISTS measurements (
        id TEXT PRIMARY KEY,
        timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        water_1 REAL,
        water_2 REAL,
        air REAL,
        humidity REAL
    )
  `);

});

const insert_statement = db.prepare(`
  INSERT INTO measurements (id, water_1, water_2, air, humidity) 
  VALUES (?, ?, ?, ?, ?)
`);

export const getMeasurements = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM measurements', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

export const insertMeasurement = (id, water_1, water_2, air, humidity) => {
  insert_statement.run(id, water_1, water_2, air, humidity, (err) => {
    if (err) return console.error(err.message);
    console.log(`Logged a measurement with UUID: ${id} at ${new Date().toISOString()}`);
  });
};