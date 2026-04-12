/* SETUP .env FILE */
import { config } from "dotenv";
config()

import express from "express";
import path from "path";

import mqtt from "mqtt";
import { v4 as uuid } from 'uuid'
import { insertMeasurement, getMeasurements } from './database/db.js'

/* Express JS settings */
const port = process.env.PORT;
const app = express();
app.use(express.static(path.join(process.cwd(), "dist")));
app.use(express.json());

/* MQTT Settings */
const host =
  "wss://f8d3fb9160af4f8db5fea6e57850855b.s1.eu.hivemq.cloud:8884/mqtt";
const options = {
  keepalive: 60,
  clientId: "webclient" + Math.random().toString(16).substring(2, 10),
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  // Credentials from your HiveMQ Access Management tab
  username: "WEBSITE",
  password: "med2bve*UQD!qrd!huf",
};
const client = mqtt.connect(host, options);

client.on("message", (topic, message) => {
  const id = uuid()
  const [water_1, water_2, air, humidity] = message.toString().split(",")
  insertMeasurement(id, water_1, water_2, air, humidity);
});

client.on("connect", () => {
  client.subscribe("walter/sensors/all", (err) => {
    if (err) {
      console.log(`Failed to subscribe to MQTT ${err}`)
    }
  });
});

app.get("/alert", (req, res) => {
  const email = req.query.email ? req.query.email : null;
  console.log(email);
  res.send(
    "<h3> Alert Creation is not setup yet, please come back later. </h3>",
  );
});

app.get("/api/data", async (req, res) => {
  const measurementData = await getMeasurements();
  const timestamps = measurementData.map(
    (measurement) => measurement.timestamp,
  );
  const water = measurementData.map(
    (measurement) => (measurement.water_1 + measurement.water_2) / 2,
  );
  const air = measurementData.map((measurement) => measurement.air);
  const humidity = measurementData.map((measurement) => measurement.humidity);
  res.json({ measurements: { water, air, humidity }, timestamps });
});

app.listen(port, () => {
  console.log("Listening on port ", port);
});








