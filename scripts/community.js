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

const API = "http://localhost:5000/api/community";

const postsDiv = document.getElementById("posts");

/* LOAD POSTS */

async function loadPosts() {
  try {
    const res = await fetch(`${API}/posts`);
    const posts = await res.json();

    postsDiv.innerHTML = "";

    posts.forEach(post => {
      const postEl = document.createElement("div");

      postEl.className = "post";

      postEl.innerHTML = `
        <p>${post.content}</p>

        ${
          post.image_url
            ? `<img src="http://localhost:5000/uploads/${post.image_url}" width="300">`
            : ""
        }

        <br>

        ❤️ ${post.likes}

        <button onclick="likePost(${post.id})">Like</button>

        <br>

        <input id="comment-${post.id}" placeholder="Comment">

        <button onclick="commentPost(${post.id})">Send</button>

        <div id="comments-${post.id}"></div>

        <hr>
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

    await fetch(`${API}/post`, {
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

    await fetch(`${API}/like`, {
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

    await fetch(`${API}/comment`, {
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

    const res = await fetch(`${API}/comments/${postId}`);
    const comments = await res.json();

    const container = document.getElementById(`comments-${postId}`);

    container.innerHTML = "";

    comments.forEach(c => {
      container.innerHTML += `<p>${c.comment}</p>`;
    });

  } catch (err) {
    console.error("Error loading comments:", err);
  }

}

/* INITIAL LOAD */

loadPosts();