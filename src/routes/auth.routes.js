// File: auth.routes.js
// Project: 24Air Radar
// Author: Muhammad Faiq Imran
// 

// Description:
//   This file manages authentication-related API routes for the 24Air Radar application.
//   It includes endpoints for user registration and login, handling password hashing and JWT token generation.
// 
// Dependencies:
//  - express
//  - bcryptjs
//  - jsonwebtoken

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import crypto from "crypto";
import { sendResetEmail } from "../utils/mailer.js";


export const authRouter = express.Router();

/**
 * POST /api/auth/register
 * body: { email, username, password }
 */
authRouter.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body ?? {};

    if (!email || !username || !password) {
      return res.status(400).json({ message: "email, username, password required" });
    }

    // basic cleanup
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUsername = String(username).trim();

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if email exists
    const [existing] = await pool.query(
      "SELECT `UserID` FROM `user` WHERE `UserEmail` = ? LIMIT 1",
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // IMPORTANT: hashed passwords need enough column length (recommended VARCHAR(255))
    const hash = await bcrypt.hash(password, 12);


    await pool.query(
      "INSERT INTO `user` (`UserEmail`, `Username`, `Password`) VALUES (?, ?, ?)",
      [cleanEmail, cleanUsername, hash]
    );

    return res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    // If your column is too short, MySQL may throw "Data too long for column 'Password'"
    return res.status(500).json({ message: "Server error", error: String(err.message || err) });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const [rows] = await pool.query(
      "SELECT `UserID`, `UserEmail`, `Username`, `Password`, `UserProfile` FROM `user` WHERE `UserEmail` = ? LIMIT 1",
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.Password);

    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.UserID, email: user.UserEmail, username: user.Username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        userId: user.UserID,
        email: user.UserEmail,
        username: user.Username,
        profilePic: user.UserProfile || null
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: String(err.message || err) });
  }
});

/**
 * POST /api/auth/forgot-password
 * body: { email }
 */
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body ?? {};
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const [rows] = await pool.query(
      "SELECT `UserID`, `UserEmail` FROM `user` WHERE `UserEmail` = ? LIMIT 1",
      [cleanEmail]
    );

    // Always return success-like response so attackers can't discover registered emails
    if (rows.length === 0) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const user = rows[0];

    // Random raw token for link
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store only hashed token in DB
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Expire in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `
      INSERT INTO password_resets (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
      `,
      [user.UserID, tokenHash, expiresAt]
    );

    const resetLink = `${process.env.RESET_LINK_BASE}?token=${rawToken}`;

    await sendResetEmail(user.UserEmail, resetLink);

    // Helpful for local demo/testing
    return res.json({
      message: "If that email exists, a reset link has been sent.",
      resetLink
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: String(err.message || err) });
  }
});

/**
 * POST /api/auth/reset-password
 * body: { token, newPassword }
 */
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body ?? {};

    if (!token || !newPassword) {
      return res.status(400).json({ message: "token and newPassword required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");

    const [rows] = await pool.query(
      `
      SELECT id, user_id, expires_at, used_at
      FROM password_resets
      WHERE token_hash = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const resetRow = rows[0];

    if (resetRow.used_at) {
      return res.status(400).json({ message: "This reset link has already been used" });
    }

    if (new Date(resetRow.expires_at) < new Date()) {
      return res.status(400).json({ message: "Reset link has expired" });
    }

    const hash = await bcrypt.hash(String(newPassword), 12);

    await pool.query(
      "UPDATE `user` SET `Password` = ? WHERE `UserID` = ?",
      [hash, resetRow.user_id]
    );

    await pool.query(
      "UPDATE password_resets SET used_at = NOW() WHERE id = ?",
      [resetRow.id]
    );

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: String(err.message || err) });
  }
});