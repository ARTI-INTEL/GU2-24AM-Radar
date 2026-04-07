// File: aircraftPoller.js
// Project: 24Air Radar
// Author: Muhammad Faiq Imran
// Last Modified: 15/03/2026

// Description:
//   This file implements a background job that periodically polls the OpenSky Network API for live aircraft data.
// 
// Dependencies:
//  - opensky-network.org API
//  - mysql2 for database interactions

import { pool } from "../db.js";

const POLL_MS = 7 * 60 * 1000; // 7 minutes

async function fetchAndCacheNews() {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      console.error("NEWS_API_KEY missing in .env");
      return;
    }

    const params = new URLSearchParams({
      'q': 'aviation',
      'language.code': 'en',
      'per_page': '5'
    });

    const response = await fetch(
      `https://api.apitube.io/v1/news/everything?${params}`,
      { headers: { 'X-API-Key': apiKey } }
    );

    if (!response.ok) {
      console.error("APITube fetch failed:", response.status);
      return;
    }

    const data = await response.json();
    const articles = data.results || data.data || data.articles || data.items || [];

    if (!articles.length) {
      console.warn("News poller: no articles returned");
      return;
    }

    // Clear old cache and insert fresh articles
    await pool.query("DELETE FROM news_cache");

    const values = articles.map(a => [
      a.title || "No title",
      a.url || a.link || a.source_url || "#"
    ]);

    await pool.query(
      "INSERT INTO news_cache (title, url) VALUES ?",
      [values]
    );

    console.log(`News cache updated: ${articles.length} articles at ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    console.error("News poller failed:", err.message);
  }
}

export function startNewsPoller() {
  fetchAndCacheNews();
  setInterval(fetchAndCacheNews, POLL_MS);
}