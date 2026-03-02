import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import { authRouter } from "./routes/auth.routes.js";
import { pool } from "./db.js";
import { userRouter } from "./routes/user.routes.js";
import { airportsRouter } from "./routes/airports.routes.js";
import { aircraftRouter } from "./routes/aircraft.routes.js";

const app = express();

app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map(s => s.trim()) ?? "*",
    credentials: false
  })
);

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "error", error: String(e.message || e) });
  }
});

app.use("/api/auth", authRouter);

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});

app.use("/api/user", userRouter);

app.use("/api/airports", airportsRouter);

app.use("/api/aircraft", aircraftRouter);