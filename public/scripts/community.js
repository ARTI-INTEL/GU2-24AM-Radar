/* 
File: community.js
Project: 24Air Radar
Author: Muhammad Faiq Imran
Last Modified: 07/04/2026
 
Description:
  This file contains the JavaScript code for the 24Air Radar application community page, handling user interactions, 
  and communication with the backend API.
  Inline event handlers have been removed; all interactions use event delegation to comply with CSP.
 
Dependencies:
  - Node.js 
  - Express.js 
*/
 
const postsDiv = document.getElementById("posts");
 
// Get the logged-in user from localStorage (set by script.js on login)
function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem("authUser") || "{}");
  } catch {
    return {};
  }
}
 
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
            alt="${post.Username}'s avatar"
          >
          <div>
            <div class="post-username">${post.Username}</div>
            <div class="post-time">${formatTime(post.created_at)}</div>
          </div>
        </div>
 
        <div class="post-content">${post.content}</div>
 
        ${post.image_url ? `<img class="post-image" src="/uploads/${post.image_url}" alt="Post image">` : ""}
 
        <div class="post-actions">
          <button class="like-btn" data-post-id="${post.id}">
            ❤️ ${post.likes}
          </button>
        </div>
 
        <div class="comment-box">
          <input id="comment-${post.id}" placeholder="Write a comment..." required>
          <button type="submit" class="primary-btn comment-btn" data-post-id="${post.id}">
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
 
/* EVENT DELEGATION — handles like and comment buttons for all posts */
 
postsDiv.addEventListener("click", async (e) => {
 
  // Like button
  const likeBtn = e.target.closest(".like-btn");
  if (likeBtn) {
    const postId = likeBtn.dataset.postId;
    await likePost(postId);
    return;
  }
 
  // Comment button
  const commentBtn = e.target.closest(".comment-btn");
  if (commentBtn) {
    const postId = commentBtn.dataset.postId;
    await commentPost(postId);
  }
 
});
 
/* CREATE POST */
 
document.getElementById("postForm").addEventListener("submit", async e => {
  e.preventDefault();
 
  const { userId } = getAuthUser();
  if (!userId) {
    console.error("Not logged in — cannot create post");
    return;
  }
 
  const formData = new FormData(e.target);
  formData.append("user_id", userId);
  console.log("FormData entries:" + [...formData.entries()]);
 
  try {
    await fetch(`${API_BASE}/api/community/post`, {
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
  const { userId } = getAuthUser();
  if (!userId) return;
 
  try {
    await fetch(`${API_BASE}/api/community/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, user_id: userId })
    });
 
    loadPosts();
 
  } catch (err) {
    console.error("Error liking post:", err);
  }
}
 
/* COMMENT */
 
async function commentPost(postId) {
  const { userId } = getAuthUser();
  if (!userId) return;
 
  const input = document.getElementById(`comment-${postId}`);
  if (!input) return;
 
  const comment = input.value.trim();
  if (!comment) return;
 
  try {
    await fetch(`${API_BASE}/api/community/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, user_id: userId, comment })
    });
 
    input.value = "";
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
    if (!container) return;
 
    container.innerHTML = "";
 
    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <b>${c.Username}</b>: ${c.comment}
        <span class="comment-time">${formatTime(c.created_at)}</span>
      `;
      container.appendChild(div);
    });
 
  } catch (err) {
    console.error("Error loading comments:", err);
  }
}
 
/* LOAD NEWS */
 
async function loadNews() {
  try {
    const res = await fetch(`${API_BASE}/api/community/news`);
    const articles = await res.json();
 
    const newsContainer = document.getElementById("news");
    newsContainer.innerHTML = "";
 
    if (!Array.isArray(articles) || articles.length === 0) {
      newsContainer.innerHTML = "<p>News unavailable.</p>";
      return;
    }
 
    articles.forEach(article => {
      const item = document.createElement("div");
      item.className = "news-item";
      item.innerHTML = `
        <b>${article.title || "No title"}</b><br>
      `;
      newsContainer.appendChild(item);
    });
 
  } catch (err) {
    console.error("News failed:", err);
    document.getElementById("news").innerHTML = "<p>News unavailable.</p>";
  }
}
 
/* INITIAL LOAD */
 
loadPosts();
loadNews();
 