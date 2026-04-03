/* 
File: script.js
Project: 24Air Radar
Author: Muhammad Faiq Imran
Last Modified: 15/03/2026

Description:
  This file contains the JavaScript code for the 24Air Radar application, handling user interactions, 
  authentication, and communication with the backend API. It includes functionality for showing/hiding passwords,
  displaying toast notifications, managing user sessions, and connecting to the backend for login, registration,
  and user settings updates.

Dependencies:
  - Node.js 
  - Express.js 
*/

const mobileQuery = window.matchMedia("(max-width: 600px)");

function updateBackButtons() {

  document.querySelectorAll("a.back").forEach(link => {

    // Save original text if not already saved
    if (!link.dataset.originalText) {
      link.dataset.originalText = link.innerHTML;
    }

    if (mobileQuery.matches) {
      link.innerHTML = "<i class='bx bx-arrow-back'></i>";
    } else {
      link.innerHTML = link.dataset.originalText;
    }

  });

}

// Run once
updateBackButtons();

// Run when screen changes
mobileQuery.addEventListener("change", updateBackButtons);



// ================== SHOW / HIDE PASSWORD ==================
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);

      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "Hide";
      } else {
        input.type = "password";
        btn.textContent = "Show";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", setupPasswordToggles);

// ================== TOAST POPUPS ==================
function getToastContainer() {
  let container = document.getElementById("toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  return container;
}

function showToast(message, type = "info", duration = 2500) {
  const container = getToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hide");

    setTimeout(() => {
      toast.remove();
    }, 250);
  }, duration);
}

// Protects pages that require authentication

const protectedPages = ["map.html", "settings.html", "changePW.html", "community.html"];

if (protectedPages.some(p => window.location.pathname.includes(p))) {
  if (!localStorage.getItem("authToken")) {
    window.location.href = "login.html";
  }
}

// Frontend to Backend Connection
// ================== CONFIG ==================
const API_BASE = "http://localhost:5000";

// ================== SAVE AUTH ==================
function saveAuth(token, user) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("authUser", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
}

// ================== LOGIN ==================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    showToast("Logging in...", "info", 1200);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      saveAuth(data.token, data.user);

      showToast("Login successful!", "success", 1200);

      setTimeout(() => {
        window.location.href = "map.html";
      }, 800);

    } catch (err) {
      showToast(err.message, "error", 1200);
    }
  });
}

// ================== REGISTER ==================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("regEmail").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value;

    showToast("Creating account...", "info", 1200);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      showToast("Registration successful! Redirecting...", "success", 1200);

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);

    } catch (err) {
      showToast(err.message, "error", 1200);
    }
  });
}

// ================== LOGOUT ==================
function LogOut() {
  clearAuth();
  window.location.href = "login.html";
  showToast("You have been logged out.", "info", 1200);
}

function getToken() {
  return localStorage.getItem("authToken");
}

function setMsg(el, text, color = "white") {
  if (!el) return;
  el.textContent = text;
  el.style.color = color;
}

const changePWForm = document.getElementById("changePWForm");

if (changePWForm) {
  changePWForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    showToast("Updating password...", "info", 1200);

    try {
      const res = await fetch(`${API_BASE}/api/user/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Password update failed");

      showToast("Password updated. Please login again.", "success", 1200);

      // force re-login for safety
      localStorage.clear();
      setTimeout(() => (window.location.href = "login.html"), 1200);
    } catch (err) {
      showToast(err.message, "error", 1200);
    }
  });
}

// Dynamic Welcome Text in Settings
// ================== DYNAMIC WELCOME ==================
const welcomeText = document.getElementById("welcomeText");

if (welcomeText) {
  const user = JSON.parse(localStorage.getItem("authUser") || "{}");

  if (user.username) {
    welcomeText.innerHTML = `Welcome to <strong>24Air Radar</strong>, ${user.username}.`;
  } else {
    welcomeText.textContent = "Welcome to 24Air Radar.";
  }
}

// ================== FORGOT PASSWORD ==================
const forgotPWForm = document.getElementById("forgotPWForm");

if (forgotPWForm) {
  forgotPWForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("forgotPWEmail").value.trim();

    showToast("Sending reset link...", "info", 1200);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }

      showToast("If that email exists, a reset link has been sent.", "success", 2000);

      // Helpful for local demo/testing
      if (data.resetLink) {
        console.log("RESET LINK:", data.resetLink);
      }
    } catch (err) {
      showToast(err.message, "error", 2000);
    }
  });
}

// Reset Password
const resetPWForm = document.getElementById("resetPWForm");

if (resetPWForm) {
  resetPWForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error", 2000);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      showToast("Reset token is missing", "error", 2000);
      return;
    }

    showToast("Resetting password...", "info", 1200);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      showToast("Password reset successful. Redirecting...", "success", 1500);

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    } catch (err) {
      showToast(err.message, "error", 2000);
    }
  });
}