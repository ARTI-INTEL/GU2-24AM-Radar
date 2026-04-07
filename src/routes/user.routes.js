// File: user.routes.js
// Project: 24Air Radar
// Author: Muhammad Faiq Imran
// Last Modified: 15/03/2026

// Description:
//   This file manages user-related API routes for the 24Air Radar application. 
//   It includes endpoints for updating the user's username and password.
// 
// Dependencies:
//  - express
//  - bcryptjs
//  - multer

import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const userRouter = express.Router();

// ─── Multer config for profile pictures ───────────────────────────────────────
const profileStorage = multer.diskStorage({
  destination: "src/uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-img-${Date.now()}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
               allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Only image files are allowed"));
  },
});

// ─── PATCH /api/user/avatar ────────────────────────────────────────────────────
userRouter.patch("/avatar", requireAuth, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filename = req.file.filename;

    await pool.query(
      "UPDATE `user` SET `UserProfile` = ? WHERE `UserID` = ?",
      [filename, req.user.userId]
    );

    return res.json({ message: "Profile picture updated", filename });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: String(err.message || err) });
  }
});

// ─── PATCH /api/user/password ─────────────────────────────────────────────────
userRouter.patch("/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword required" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const [rows] = await pool.query(
      "SELECT `Password` FROM `user` WHERE `UserID` = ? LIMIT 1",
      [req.user.userId]
    );

    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(String(currentPassword), rows[0].Password);
    if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

    const hash = await bcrypt.hash(String(newPassword), 12);

    await pool.query(
      "UPDATE `user` SET `Password` = ? WHERE `UserID` = ?",
      [hash, req.user.userId]
    );

    return res.json({ message: "Password updated" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: String(err.message || err) });
  }
});