// File: aircraftPoller.js
// Project: 24Air Radar
// Author: Muhammad Faiq Imran
// 

// Description:
//    This file manages generating and sending password reset emails for the 24Air Radar application.
// 
// Dependencies:
//  - nodemailer for sending emails (password reset links)

import nodemailer from "nodemailer";

export async function sendResetEmail(to, resetLink) {
  // If mail env vars are missing, just log link for demo
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log("RESET LINK:", resetLink);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });
  try { 
    await transporter.sendMail({
      from: `"24Air Radar" <${process.env.MAIL_USER}>`,
      to,
      subject: "Reset your 24Air Radar password",
      html: `
        <p>You requested a password reset for 24Air Radar.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link expires in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `
    });
  } catch (err) {
    console.error("Error sending reset email:", err);
  }
}