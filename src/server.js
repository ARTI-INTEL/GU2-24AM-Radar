// File: server.js
// Project: 24Air Radar
// Author: Muhammad Faiq Imran
// Last Modified: 07/04/2026
 
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
import { startNewsPoller } from "./jobs/newsPoller.js";
import { logInfo, logError, requestLogger } from "./utils/logger.js";
 
// ─── Background jobs ──────────────────────────────────────────────────────────
startAircraftPoller();
startNewsPoller();
 
const app = express();
 
// ─── HTTP request logger (must be first middleware) ───────────────────────────
app.use(requestLogger);
 
// ─── Security ─────────────────────────────────────────────────────────────────
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
                      "http://localhost:5500",
                      "https://*.tile.openstreetmap.org",
                      "https://*.basemaps.cartocdn.com",
                      "https://tile.openweathermap.org"
                    ],
        "connect-src": [
          "'self'",
          "https://unpkg.com",
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
 
// ─── Path helpers ─────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
 
// ─── Static file serving ──────────────────────────────────────────────────────
app.use("/html",    express.static(path.join(__dirname, "../public/html")));
app.use("/scripts", express.static(path.join(__dirname, "../public/scripts")));
app.use("/styles",  express.static(path.join(__dirname, "../public/styles")));
app.use("/images",  express.static(path.join(__dirname, "../public/images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
 
// ─── SEO / Crawler files ──────────────────────────────────────────────────────
 
// robots.txt — tells crawlers which pages to index / skip
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.sendFile(path.join(__dirname, "../public/robots.txt"));
});
 
// sitemap.xml — lists all publicly indexable URLs
app.get("/sitemap.xml", (_req, res) => {
  res.type("application/xml");
  res.sendFile(path.join(__dirname, "../public/sitemap.xml"));
});
 
// ─── Root ─────────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/index.html"));
});
 
// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (e) {
    logError(e, "Health");
    res.status(500).json({ ok: false, db: "error", error: String(e.message || e) });
  }
});
 
// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",      authRouter);
app.use("/api/user",      userRouter);
app.use("/api/airports",  airportsRouter);
app.use("/api/aircraft",  aircraftRouter);
app.use("/api/community", communityRoutes);
 
// ─── Periodic DB cleanup: stale aircraft (older than 5 min) ──────────────────
setInterval(async () => {
  try {
    const [result] = await pool.query(
      `DELETE FROM aircraft_latest
       WHERE updated_at < (NOW() - INTERVAL 5 MINUTE)`
    );
    logInfo(
      `Aircraft cleanup removed ${result.affectedRows} stale rows`,
      "Cleanup"
    );
  } catch (err) {
    logError(err, "Cleanup");
  }
}, 15 * 60 * 1000);
 
// ─── Periodic DB cleanup: past positions (older than 12 h) ───────────────────
setInterval(async () => {
  try {
    const [result] = await pool.query(
      `DELETE FROM aircraft_positions
       WHERE time < (NOW() - INTERVAL 12 HOUR)`
    );
    logInfo(
      `Past-positions cleanup removed ${result.affectedRows} rows`,
      "Cleanup"
    );
  } catch (err) {
    logError(err, "Cleanup");
  }
}, 15 * 60 * 1000);
 
// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  logInfo(`404 — ${req.method} ${req.originalUrl}`, "Router");
  res.status(404).sendFile(path.join(__dirname, "../public/html/404.html"));
});
 
// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  logError(err, "Express");
  res.status(500).json({ message: "Internal server error" });
});
 
// ─── Start ────────────────────────────────────────────────────────────────────
const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  logInfo(`24Air Radar server running on http://localhost:${port}`, "Server");
});