/* SETUP .env FILE */
import { config } from "dotenv";
config();

import fs from "fs";

import express from "express";
import { Resend } from "resend";
import { fileURLToPath } from "url";
import path from "path";

// These two lines are the magic fix for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import mqtt from "mqtt";
import { v4 as uuid } from "uuid";
import {
  insertMeasurement,
  getMeasurements,
  insertSubscription,
  refreshTokens,
  createToken,
  getSubscriptions,
  deleteSubscription,
  updateSubscription,
  generateFakeData,
} from "./db.js";
import { aesCipher } from "./crypto.js";

/* Express JS settings */
const port = process.env.PORT;
const app = express();
app.use(express.static(path.join(__dirname, "dist")));
app.use('/models', express.static(process.env.MODEL_PATH)) // Needs to be inserted into the Railway Volume
app.use(express.json());



/* Nodemailer Settings */
const resend = new Resend(process.env.RESEND_API_KEY);

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
  const id = uuid();
  const [water_1, water_2, air, humidity] = message.toString().split(",");
  insertMeasurement(id, water_1, water_2, air, humidity);
});

client.on("connect", () => {
  client.subscribe("walter/sensors/all", (err) => {
    if (err) {
      console.log(`Failed to subscribe to MQTT ${err}`);
    }
  });
});

/* Subscription Endpoints */
app.put("/resubscribe", async (req, res) => {
  const resubscriptionRequest = req.body;
  if (
    resubscriptionRequest == null ||
    resubscriptionRequest.token == null ||
    resubscriptionRequest.id == null ||
    resubscriptionRequest.weekly == null ||
    resubscriptionRequest.min == null ||
    resubscriptionRequest.max == null
  ) {
    res.status(400).json({ success: false, message: "Invalid Request Body" });
    return;
  }
  if (resubscriptionRequest.token == "supersecretpassword") {
    // TODO replace with password logic
    if (
      updateSubscription(
        resubscriptionRequest.id,
        resubscriptionRequest.weekly,
        resubscriptionRequest.min,
        resubscriptionRequest.max,
      )
    ) {
      res.status(200).json({
        success: true,
        message: `Successfully modified subscription with ID: ${resubscriptionRequest.id}`,
      });
      return;
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to update subscription with ID: ${resubscriptionRequest.id}`,
      });
      return;
    }
  }
});

app.delete("/unsubscribe", async (req, res) => {
  /* Master Password || Token linked to Email that wants to be deleted.  */
  const unsubscriptionRequest = req.body;
  if (
    unsubscriptionRequest == null ||
    unsubscriptionRequest.token == null ||
    unsubscriptionRequest.id == null
  ) {
    res.status(400).json({ success: false, message: "Invalid Request Body" });
    return;
  }
  if (unsubscriptionRequest.token == "supersecretpassword") {
    // TODO Replace with actual decryption logic.
    if (deleteSubscription(unsubscriptionRequest.id)) {
      res.status(200).json({
        sucess: true,
        message: `Successfully deleted subscription with ID ${unsubscriptionRequest.id}`,
      });
      return;
    } else {
      res.status(400).json({
        success: false,
        message: `Failed to delete subscription with ID ${unsubscriptionRequest.id}`,
      });
      return;
    }
  }
});

app.post("/subscribe", async (req, res) => {
  const subscriptionRequest = req.body;
  if (subscriptionRequest == null || subscriptionRequest.email == null) {
    res.status(400).json({ success: false, message: "Invalid Request Body" });
    return;
  }
  if (
    !subscriptionRequest.email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    )
  ) {
    res.status(400).json({ success: false, message: "Invalid Email Address" });
    return;
  }
  if (
    !insertSubscription(
      uuid(),
      aesCipher.encrypt(subscriptionRequest.email),
      aesCipher.hash(subscriptionRequest.email),
      subscriptionRequest.weekly,
      subscriptionRequest.min,
      subscriptionRequest.max,
    )
  ) {
    res.status(500).json({ success: false, message: "Database Failure" });
    return;
  }

  try {
    /*
    TODO Design Emails
    const emailHtml = fs.readFileSync("emails/Confirmation.html", { encoding: "utf-8" })

    resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Weather is coming your way!",
      html: emailHtml
    })
     */
    res.status(200).json({ success: true, message: "Sent an email!" });
  } catch (error) {
    console.error(`Failed to send an email ${error}`);
    res.status(500).json({ success: false, message: "Email delivery failed." });
  }
});

/* Token Endpoints */
app.post("/subscribe/manage", async (req, res) => {
  const manageRequest = req.body;
  if (manageRequest == null || manageRequest.email == null) {
    res.status(400).json({ success: false, message: "Invalid Request Body" });
    return;
  }
  if (
    !manageRequest.email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    )
  ) {
    res.status(400).json({ success: false, message: "Invalid Email Address" });
    return;
  }
  // Will now refresh tokens, create a token, and send this token to the user.


  refreshTokens();

  const token = aesCipher.getToken().toString("hex");

  createToken(token, aesCipher.hash(manageRequest.email));

  const emailHtml = fs.readFileSync("emails/Manage.html", { encoding: "utf8" }).replace("{token}", token)

  resend.emails.send({
    from: "onboarding@resend.dev",
    to: manageRequest.email,
    subject: "Manage your Weatherbuoy Subscriptions",
    html: emailHtml
  })

  res.status(200).json({success: true, message: "Sent an Email!" })


})

app.get("/subscribe/manage", async (req, res) => {
  if (req.query.key == null) {
    res.status(400).json({ success: false, message: "Invalid Request Parameters" });
    return;
  }
  console.log(getSubscriptions(req.query.key))
  res.status(200).json({success: true, message: "Valid Request Parameters"})
})

/* Chart Data + Chart Accuracy */
app.get("/api/data", async (req, res) => {
  const measurementData = getMeasurements();
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

app.get("/api/filter-value", (req, res) => {
  if (process.env.FILTER_VALUE) {
    res.json({ value: process.env.FILTER_VALUE });
  } else {
    res.json({ value: 100 });
  }
});

/*
app.get("/api/fake", (req, res) => {
  console.log("Generating FAKE DATA!");
  generateFakeData();
})
 */


app.listen(port, () => {
  console.log("Listening on port ", port);
});
