// File: server.js
// Project: 24Air Radar
// Author: Muhammad Faiq Imran
// Last Modified: 15/03/2026

// Description:
//  This file sets up the Express server for the 24Air Radar application. 
//  It configures middleware for security (Helmet), CORS, and JSON parsing. 
//  It defines routes for authentication, user management, airports, and aircraft data. 
//  The server also serves static files from the public directory and includes a health check endpoint. 
// 
// Dependencies:
//  - mysql2
//  - dotenv
//  - express
//  - cors
//  - helmet
//  - Path
//  - multer
//  - Other backend Files(Routes, middleware, jobs and Database)

import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import { authRouter } from "./routes/auth.routes.js";
import { pool } from "./db.js";
import { userRouter } from "./routes/user.routes.js";
import { airportsRouter } from "./routes/airports.routes.js";
import { aircraftRouter } from "./routes/aircraft.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { startAircraftPoller } from "./jobs/aircraftPoller.js";
import communityRoutes from "./routes/community.routes.js";

startAircraftPoller();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "https://unpkg.com"],
        "style-src": ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        "img-src": [
          "'self'",
          "data:",
          "blob:",
          "https://*.tile.openstreetmap.org",
          "https://*.basemaps.cartocdn.com",
          "https://tile.openweathermap.org"
        ],
        "connect-src": [
          "'self'",
          "https://tile.openweathermap.org",
          "https://*.basemaps.cartocdn.com",
          "https://*.tile.openstreetmap.org"
        ],
        "worker-src": ["'self'", "blob:"]
      }
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/html", express.static(path.join(__dirname, "../../html")));
app.use("/scripts", express.static(path.join(__dirname, "../../scripts")));
app.use("/styles", express.static(path.join(__dirname, "../../styles")));
app.use("/images", express.static(path.join(__dirname, "../../images")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../html/index.html"));
});

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "error", error: String(e.message || e) });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/airports", airportsRouter);
app.use("/api/aircraft", aircraftRouter);
app.use("/api/community", communityRoutes);
app.use("/uploads", express.static("uploads"));

// DB CLEANUP - remove aircraft not updated in the last 5 minutes
setInterval(async () => {
  try {
    const [result] = await pool.query(
      `DELETE FROM aircraft_latest
       WHERE updated_at < (NOW() - INTERVAL 5 MINUTE)`
    );

    console.log(
      `Aircraft cleanup: removed ${result.affectedRows} old aircraft at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} - ${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
    );
  } catch (err) {
    console.error("Aircraft cleanup failed:", err.message);
  }
}, 15 * 60 * 1000);

// Past positions cleanup (older than 12h)
setInterval(async () => {
  try {
    await pool.query(`
      DELETE FROM aircraft_positions
      WHERE time < (NOW() - INTERVAL 12 HOUR)
    `);
    console.log(
      `Past positions cleanup completed at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} - ${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
    );
  } catch (err) {
    console.error("Past positions cleanup failed:", err.message);
  }
}, 15 * 60 * 1000);

// 404 page for unknown frontend routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../../html/404.html"));
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`Running on ${port}`));