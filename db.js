import Database from "better-sqlite3";
import path from "path";
import { v4 as uuid } from "uuid";

// Setup the path
const dbPath = path.resolve("database", "measurements.sqlite");

// Connect to the database
const db = new Database(dbPath);

// Enable WAL mode for better performance
// (prevents "database is locked" errors during high-frequency MQTT writes)
db.pragma("journal_mode = WAL");

// Table Creation
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

db.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      email_enc TEXT,
      email_hash TEXT,
      subscribed TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      weekly BOOLEAN,
      min REAL,
      max REAL
  )`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tokens (
      key TEXT PRIMARY KEY,
      email_hash TEXT,
      created TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )`);

// Prepare statements once for reuse
const insertStmt = db.prepare(`
  INSERT INTO measurements (id, water_1, water_2, air, humidity)
  VALUES (?, ?, ?, ?, ?)
`);
const fakeInsertStmt = db.prepare(`
  INSERT INTO measurements (id, timestamp, water_1, water_2, air, humidity)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const fakeDeleteStmt = db.prepare(`
  DELETE from measurements
  WHERE true`)

const subscribeStmt = db.prepare(`
  INSERT INTO subscriptions (id, email_enc, email_hash, weekly, min, max)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const createTokenStmt = db.prepare(`
  INSERT INTO tokens (key, email_hash)
  VALUES (?, ?)`);

const refreshTokensStmt = db.prepare(`
  DELETE FROM tokens
  WHERE created < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-24 hours')
`);

const getSubscriptionsStmt = db.prepare(`
  SELECT * FROM subscriptions WHERE email_hash = (SELECT email_hash FROM tokens WHERE key = ?)`);

const unsubscribeStmt = db.prepare(`DELETE FROM subscriptions WHERE id = ?`);
const resubscribeStmt = db.prepare(
  `UPDATE subscriptions SET weekly = ?, min = ?, max = ? WHERE id = ?`,
);

// Exported Functions for Backend
export const getMeasurements = () => {
  try {
    // .all() returns an array of objects immediately
    return db.prepare("SELECT * FROM measurements").all();
  } catch (err) {
    console.error("Error fetching measurements:", err);
    return [];
  }
};

export const insertMeasurement = (id, water_1, water_2, air, humidity) => {
  try {
    // .run() executes the prepared statement synchronously
    insertStmt.run(id, water_1, water_2, air, humidity);
    console.log(`◇ Logged UUID: ${id} at ${new Date().toISOString()}`);
  } catch (err) {
    console.error(`! Failed to log measurement ${id}:`, err.message);
  }
};

export const insertSubscription = (
  id,
  email_enc,
  email_hash,
  weekly,
  min,
  max,
) => {
  try {
    subscribeStmt.run(id, email_enc, email_hash, weekly, min, max);
    console.log(
      `◇ (${id}) Subscribed new email at ${new Date().toLocaleDateString()} with mode set to ${weekly ? "WEEKLY" : "RANGE"}. ${!weekly ? `\n MIN: ${min}, \n MAX: ${max}` : ``} \n ◇ Ciphertext: ${email_enc}\n ◇ Hash: ${email_hash}\n`,
    );
    return true;
  } catch (err) {
    console.error(
      `! Failed to insert an email subscription, DUMP: \n Id: ${id} \n Weekly: ${weekly} \n Min: ${min} \n Max: ${max}`,
    );
    console.error(err);
    return false;
  }
};

export const deleteSubscription = (id) => {
  try {
    unsubscribeStmt.run(id);
    console.log(`◇ (${id}) Unsubscription Successful.`);
    return true;
  } catch (err) {
    console.error(`! Failed to unsubscribe subscription with ID: ${id}`);
    console.error(err);
    return false;
  }
};

export const updateSubscription = (id, weekly, min, max) => {
  try {
    resubscribeStmt.run(weekly, min, max, id);
    console.log(`◇ (${id}) Resubscription Successful.`);
    return true;
  } catch (err) {
    console.error(
      `! Failed to resubscribe subscription with the following data, DUMP: \n Id: ${id} \n Weekly: ${weekly} \n Min: ${min} \n Max: ${max}`,
    );
    console.error(err);
    return false;
  }
};

export const createToken = (key, email_hash) => {
  console.log(
    `◇ (${key}) Storing temporary access token with email hash: ${email_hash}`,
  );
  createTokenStmt.run(key, email_hash);
};

export const refreshTokens = () => {
  refreshTokensStmt.run();
};
export const getSubscriptions = (key) => {
  console.log(`◇ Retrieving subscriptions with ${key}`);
  return getSubscriptionsStmt.all(key);
};

export const generateFakeData = () => {
  deleteFakeData()
  console.log(`Generating fake data over the last week!`);
  const totalDurationMs = 7 * 24 * 60 * 60 * 1000;
  let difference = 1000 * 30;
  let startTime = Date.now() - totalDurationMs;

  let totalEntries = totalDurationMs / difference;
  
  for (let i = 0; i < totalEntries; i++) {
    const timestamp = new Date(startTime + i * difference)
    fakeInsertStmt.run(uuid(), timestamp.toISOString(), Math.sin(i/30) * 30, Math.sin(i/30) * 30 + (Math.random() * 4), (Math.cos(i) * 10) + 60, (Math.cos(i) *5) + 80);
  }
}
const deleteFakeData = () => {
  fakeDeleteStmt.run();
}
