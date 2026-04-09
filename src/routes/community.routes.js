// File: community.routes.js
// Project: 24Air Radar
// Author: Muhammad Faiq Imran
// Last Modified: 15/03/2026

// Description:
  //   This file manages community-related API routes for the 24Air Radar application.
  //   It includes endpoints for creating posts, liking posts, and adding comments.
// 
// Dependencies:
//  - express
//  - multer

import express from "express";
import multer from "multer";
import { pool } from "../db.js";
import path from "path";

const router = express.Router();

// The storage config
const storage = multer.diskStorage({
  destination: "src/uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `post-img-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Create Post
router.post("/post", upload.single("image"), async (req, res) => {
  try {

    const { content, user_id } = req.body;
    const image = req.file ? req.file.filename : null;

    const sql =
      "INSERT INTO posts (user_id, content, image_url) VALUES (?,?,?)";

    await pool.query(sql, [user_id, content, image]);

    res.json({ message: "Post created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

/* GET POSTS */

router.get("/posts", async (req, res) => {

  const sql = `
    SELECT 
      posts.*,
      user.Username,
      user.UserProfile,
      (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id) as likes
    FROM posts
    JOIN user ON posts.user_id = user.UserID
    ORDER BY posts.created_at DESC
  `;

  const [posts] = await pool.query(sql);

  res.json(posts);

});

/* LIKE POST */

router.post("/like", async (req, res) => {
  try {
    const { post_id, user_id } = req.body;

    const sql =
      "INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?,?)";

    await pool.query(sql, [post_id, user_id]);

    res.json({ message: "Liked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to like post" });
  }
});

/* COMMENT */

router.post("/comment", async (req, res) => {
  try {
    const { post_id, user_id, comment } = req.body;

    const sql =
      "INSERT INTO comments (post_id, user_id, comment) VALUES (?,?,?)";

    await pool.query(sql, [post_id, user_id, comment]);

    res.json({ message: "Comment added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

/* GET COMMENTS */

router.get("/comments/:postId", async (req, res) => {

  const sql = `
    SELECT 
      comments.comment,
      comments.created_at,
      user.Username
    FROM comments
    JOIN user ON comments.user_id = user.UserID
    WHERE comments.post_id = ?
    ORDER BY comments.created_at ASC
  `;

  const [comments] = await pool.query(sql, [req.params.postId]);

  res.json(comments);

});

export default router;