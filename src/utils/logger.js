// File: logger.js
// Project: 24Air Radar
// Author: Muhammad Faiq Imran
// Last Modified: 07/04/2026
 
// Description:
//   Centralised logging utility for the 24Air Radar application.
//   Writes timestamped entries to daily-rotating log files inside the /logs directory.
//
//   Log files produced:
//     logs/YYYY-MM-DD-access.log  — one line per HTTP request (method, url, status, ms)
//     logs/YYYY-MM-DD-app.log     — general INFO messages (startup, polls, cleanup)
//     logs/YYYY-MM-DD-error.log   — ERROR messages only
//
//   All entries are also mirrored to stdout/stderr so the dev terminal stays useful.
//
// Dependencies:
//   - Node.js built-in: fs, path, url
 
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
 
// ─── Resolve /logs directory relative to this file ───────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
 
// Go up two levels: src/utils → src → project root → logs/
const LOGS_DIR = path.join(__dirname, "../../logs");
 
// Create the directory if it does not already exist (first run)
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}
 
// ─── Helpers ─────────────────────────────────────────────────────────────────
 
/** Returns today's date string: YYYY-MM-DD */
function today() {
  return new Date().toISOString().slice(0, 10);
}
 
/** Returns a full ISO timestamp: 2026-04-07T14:32:00.000Z */
function timestamp() {
  return new Date().toISOString();
}
 
/**
 * Appends a single line to a log file.
 * Uses the async fire-and-forget variant so it never blocks the event loop.
 * @param {string} filename  Basename, e.g. "2026-04-07-app.log"
 * @param {string} line      Text to append (newline is added automatically)
 */
function writeLine(filename, line) {
  const filePath = path.join(LOGS_DIR, filename);
  fs.appendFile(filePath, line + "\n", (err) => {
    if (err) console.error("[logger] Could not write to log file:", err.message);
  });
}
 
// ─── Public API ──────────────────────────────────────────────────────────────
 
/**
 * Log an informational message.
 * Written to:  YYYY-MM-DD-app.log  +  stdout
 *
 * @param {string} message
 * @param {string} [context]  Optional label, e.g. "AircraftPoller"
 */
export function logInfo(message, context = "App") {
  const line = `[${timestamp()}] [INFO] [${context}] ${message}`;
  console.log(line);
  writeLine(`${today()}-app.log`, line);
}
 
/**
 * Log an error message.
 * Written to:  YYYY-MM-DD-error.log  +  YYYY-MM-DD-app.log  +  stderr
 *
 * @param {string|Error} message
 * @param {string} [context]
 */
export function logError(message, context = "App") {
  const text = message instanceof Error
    ? `${message.message}\n  Stack: ${message.stack}`
    : String(message);
 
  const line = `[${timestamp()}] [ERROR] [${context}] ${text}`;
  console.error(line);
  writeLine(`${today()}-error.log`, line);
  writeLine(`${today()}-app.log`,   line);
}
 
/**
 * Express middleware — logs every HTTP request.
 * Written to:  YYYY-MM-DD-access.log  +  stdout
 *
 * Usage in server.js:
 *   import { requestLogger } from "./utils/logger.js";
 *   app.use(requestLogger);
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
 
  res.on("finish", () => {
    const ms      = Date.now() - start;
    const status  = res.statusCode;
    const method  = req.method;
    const url     = req.originalUrl || req.url;
    const ip      = req.ip || req.socket?.remoteAddress || "-";
 
    // Colour-code status in terminal only
    const statusLabel =
      status >= 500 ? `\x1b[31m${status}\x1b[0m` :  // red
      status >= 400 ? `\x1b[33m${status}\x1b[0m` :  // yellow
      status >= 300 ? `\x1b[36m${status}\x1b[0m` :  // cyan
                      `\x1b[32m${status}\x1b[0m`;    // green
 
    // Plain text for the file (no ANSI codes)
    const fileLine  = `[${timestamp()}] [ACCESS] ${method} ${url} ${status} ${ms}ms — ${ip}`;
    const termLine  = `[${timestamp()}] [ACCESS] ${method} ${url} ${statusLabel} ${ms}ms — ${ip}`;
 
    console.log(termLine);
    writeLine(`${today()}-access.log`, fileLine);
 
    // Errors also go to error log
    if (status >= 500) {
      writeLine(`${today()}-error.log`, fileLine);
    }
  });
 
  next();
}