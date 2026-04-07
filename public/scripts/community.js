/* 
File: community.js
Project: 24Air Radar
Author: Muhammad Faiq Imran
Last Modified: 15/03/2026

Description:
  This file contains the JavaScript code for the 24Air Radar application community page, handling user interactions, 
  and communication with the backend API.

Dependencies:
  - Node.js 
  - Express.js 
*/

const postsDiv = document.getElementById("posts");

// Posts timestamp formatter
function formatTime(dateString) {

  const date = new Date(dateString);
  const now = new Date();

  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";

  if (diff < 3600) return Math.floor(diff / 60) + " min ago";

  if (diff < 86400) return Math.floor(diff / 3600) + " hours ago";

  return date.toLocaleDateString() + " " + date.toLocaleTimeString();

}

/* LOAD POSTS */

async function loadPosts() {
  try {
    const res = await fetch(`${API_BASE}/api/community/posts`);
    const posts = await res.json();

    postsDiv.innerHTML = "";

    posts.forEach(post => {
      const postEl = document.createElement("div");

      postEl.className = "post";

      postEl.innerHTML = `

      <div class="post-header">
        <img class="post-avatar"
            src="${post.UserProfile ? `/uploads/${post.UserProfile}` : '../images/default-avatar.png'}"
        <div>
          <div class="post-username">
            ${post.Username}
          </div>
          <div class="post-time">
            ${formatTime(post.created_at)}
          </div>
        </div>
      </div>

      <div class="post-content">
        ${post.content}
      </div>

      ${post.image_url ? `<img class="post-image" src="/uploads/${post.image_url}">` : ""}

      <div class="post-actions">

        <button onclick="likePost(${post.id})">
          ❤️ ${post.likes}
        </button>

      </div>

      <div class="comment-box">

        <input id="comment-${post.id}" placeholder="Write a comment...">

        <button class="primary-btn" onclick="commentPost(${post.id})">
          Comment
        </button>

      </div>

      <div id="comments-${post.id}"></div>

      `;
      postsDiv.appendChild(postEl);

      loadComments(post.id);
    });

  } catch (err) {
    console.error("Error loading posts:", err);
  }
}

/* CREATE POST */

document.getElementById("postForm").addEventListener("submit", async e => {

  e.preventDefault();

  const formData = new FormData(e.target);

  formData.append("user_id", 1); // temporary user

  try {

    await fetch(`${API_BASE}/post`, {
      method: "POST",
      body: formData
    });

    e.target.reset();

    loadPosts();

  } catch (err) {
    console.error("Error creating post:", err);
  }

});

/* LIKE POST */

async function likePost(postId) {

  try {

    await fetch(`${API_BASE}/api/community/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        post_id: postId,
        user_id: 1
      })
    });

    loadPosts();

  } catch (err) {
    console.error("Error liking post:", err);
  }

}

/* COMMENT */

async function commentPost(postId) {

  const comment = document.getElementById(`comment-${postId}`).value;

  try {

    await fetch(`${API_BASE}/api/community/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        post_id: postId,
        user_id: 1,
        comment: comment
      })
    });

    loadComments(postId);

  } catch (err) {
    console.error("Error adding comment:", err);
  }

}

/* LOAD COMMENTS */

async function loadComments(postId) {

  try {

    const res = await fetch(`${API_BASE}/api/community/comments/${postId}`);
    const comments = await res.json();

    const container = document.getElementById(`comments-${postId}`);

    container.innerHTML = "";

    comments.forEach(c => {
      container.innerHTML += `
        <div class="comment">

          <b>${c.Username}</b>: ${c.comment}

          <span class="comment-time">
            ${formatTime(c.created_at)}
          </span>

        </div>`;
    });

  } catch (err) {
    console.error("Error loading comments:", err);
  }

}

async function loadNews() {
  try {
    const res = await fetch(`${API_BASE}/api/community/news`);

    const articles = await res.json();
    console.log("News API response:", articles); // check terminal

    const newsContainer = document.getElementById("news");
    newsContainer.innerHTML = "";

    if (!Array.isArray(articles) || articles.length === 0) {
      newsContainer.innerHTML = "<p>News unavailable.</p>";
      return;
    }

    articles.forEach(article => {
      newsContainer.innerHTML += `
        <div class="news-item">
          <b>${article.title || "No title"}</b>
          <br>
          <a href="${article.url}" target="_blank">Read more</a>
        </div>
      `;
    });

  } catch (err) {
    console.error("News failed:", err);
    document.getElementById("news").innerHTML = "<p>News unavailable.</p>";
  }
}

/* INITIAL LOAD */

loadPosts();
loadNews();