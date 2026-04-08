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
 
 
 
// SHOW / HIDE PASSWORD
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
 
// TOAST POPUPS
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
// CONFIG
const API_BASE = "";
 
// SAVE AUTH
function saveAuth(token, user) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("authUser", JSON.stringify(user));
}
 
function clearAuth() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
}
 
// LOGIN
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
 
// REGISTER
const registerForm = document.getElementById("registerForm");
 
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
 
    const email    = document.getElementById("regEmail").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;
 
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error", 2000);
      return;
    }
 
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
 
logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    LogOut();
  });
}
 
function LogOut() {
  clearAuth();
  window.location.href = "login.html";
  showToast("You have been logged out.", "info", 1200);
}
 
changePWbtn = document.getElementById("changePWbtn");
if (changePWbtn) {
  changePWbtn.addEventListener("click", () => {
    window.location.href = "changePW.html";
  });
}
 
function getToken() {
  return localStorage.getItem("authToken");
}
 
function setMsg(el, text, color = "white") {
  if (!el) return;
  el.textContent = text;
  el.style.color = color;
}
 
// CHANGE PASSWORD
const changePWForm = document.getElementById("changePWForm");
 
if (changePWForm) {
  changePWForm.addEventListener("submit", async (e) => {
    e.preventDefault();
 
    const currentPassword    = document.getElementById("currentPassword").value;
    const newPassword        = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;
 
    if (newPassword !== confirmNewPassword) {
      showToast("New passwords do not match", "error", 2000);
      return;
    }
 
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
const welcomeText = document.getElementById("welcomeText");
 
if (welcomeText) {
  const user = JSON.parse(localStorage.getItem("authUser") || "{}");
 
  if (user.username) {
    welcomeText.innerHTML = `Welcome to <strong>24Air Radar</strong>, ${user.username}.`;
  } else {
    welcomeText.textContent = "Welcome to 24Air Radar.";
  }
}
 
// FORGOT PASSWORD
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
 
// PROFILE PICTURE
const avatarWrap  = document.getElementById("avatarWrap");
const avatarInput = document.getElementById("avatarInput");
const avatarImg   = document.getElementById("avatarImg");
const avatarIcon  = document.getElementById("avatarIcon");
 
async function loadAvatar() {
  if (!avatarImg) return;
 
  // First try the locally cached value (instant, no flicker)
  const user = JSON.parse(localStorage.getItem("authUser") || "{}");
  if (user.profilePic) {
    avatarImg.src = `/uploads/${user.profilePic}`;
    avatarImg.style.display = "block";
    if (avatarIcon) avatarIcon.style.display = "none";
  }
 
  // Then fetch fresh data from the server to catch any updates
  try {
    const res = await fetch(`${API_BASE}/api/user/me`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) return;
    const data = await res.json();
 
    if (data.profilePic) {
      // Update cache so next page load is instant
      const cached = JSON.parse(localStorage.getItem("authUser") || "{}");
      cached.profilePic = data.profilePic;
      localStorage.setItem("authUser", JSON.stringify(cached));
 
      avatarImg.src = `/uploads/${data.profilePic}`;
      avatarImg.style.display = "block";
      if (avatarIcon) avatarIcon.style.display = "none";
    }
  } catch {
    // Network error — silently keep whatever was cached
  }
}
 
loadAvatar();
 
// Open file picker when avatar is clicked
if (avatarWrap && avatarInput) {
  avatarWrap.addEventListener("click", () => avatarInput.click());
}
 
// Upload immediately after a file is chosen
if (avatarInput) {
  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;
 
    const formData = new FormData();
    formData.append("avatar", file);
 
    showToast("Uploading profile picture...", "info", 1500);
 
    try {
      const res = await fetch(`${API_BASE}/api/user/avatar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
 
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
 
      // Update localStorage so the new pic persists across pages
      const user = JSON.parse(localStorage.getItem("authUser") || "{}");
      user.profilePic = data.filename;
      localStorage.setItem("authUser", JSON.stringify(user));
 
      // Refresh avatar display immediately
      avatarImg.src = `/uploads/${data.filename}`;
      avatarImg.style.display = "block";
      if (avatarIcon) avatarIcon.style.display = "none";
 
      showToast("Profile picture updated!", "success", 2000);
    } catch (err) {
      showToast(err.message, "error", 2500);
    }
 
    // Reset input so the same file can be re-selected if needed
    avatarInput.value = "";
  });
}
 
//LEGAL MODAL (TOS / PRIVACY) 
 
const TOS_CONTENT = `
<h3>1. Introduction</h3>
<p>Welcome to 24Air Radar, a web-based air traffic monitoring application. By accessing or using this application, you agree to comply with and be bound by these Terms of Service. If you do not agree with these terms, you should not use the application.</p>
<h3>2. Description of the Service</h3>
<p>24Air Radar is an educational web application that allows users to monitor air traffic using an interactive map interface. The system retrieves aviation data from publicly available APIs and displays aircraft information such as aircraft identifiers, aircraft location, flight information, and air traffic patterns. The service is intended for educational, analytical, and informational purposes only.</p>
<h3>3. User Accounts</h3>
<p>To access certain features of the application, users may create an account. When creating an account, users must provide accurate information and keep their login credentials secure. Users must not share their accounts with other individuals. Users are responsible for all activities that occur under their account.</p>
<h3>4. Acceptable Use</h3>
<p>Users agree not to use the application to violate any applicable laws or regulations, attempt unauthorized access to the system, disrupt or damage system functionality, or post harmful, offensive, or illegal content in the community section. System administrators reserve the right to remove content or suspend accounts that violates these rules.</p>
<h3>5. Community Content</h3>
<p>The application includes a community section where users may create posts, comment on posts, and interact with other users. Users are responsible for any content they publish. The system administrators may remove content that violates community guidelines, contains harmful or inappropriate material, or violates intellectual property rights.</p>
<h3>6. External Data Sources</h3>
<p>24Air Radar uses third-party public APIs to retrieve air traffic data. Because the application relies on external data providers, data accuracy cannot be guaranteed. Temporary outages or delays may occur, and aircraft information may not always be up to date.</p>
<h3>7. Limitation of Liability</h3>
<p>The information provided by 24Air Radar is for informational and educational purposes only. The developers are not responsible for errors or inaccuracies in flight data, service interruptions caused by third-party APIs, or any damages resulting from the use of the application.</p>
<h3>8. Service Availability</h3>
<p>The system may occasionally be unavailable due to maintenance, server issues, or API outages. Continuous or uninterrupted service cannot be guaranteed.</p>
<h3>9. Changes to the Terms</h3>
<p>These Terms of Service may be updated or modified when necessary. Users are responsible for reviewing the terms periodically. Continued use of the application indicates acceptance of the updated terms.</p>
<h3>10. Contact</h3>
<p>For questions regarding these Terms of Service, users may contact the project developer.</p>
`;
 
const PRIVACY_CONTENT = `
<h3>1. Introduction</h3>
<p>This Privacy Policy explains how 24Air Radar collects, uses, and protects user information when using the application. User privacy is important, and this policy describes how personal data is handled within the system.</p>
<h3>2. Information We Collect</h3>
<p>When using the application, the system may collect certain information. When registering an account, users may provide information such as an email address, username, and password. Passwords are stored securely within the system. If users interact with community features, the system may store posts, comments, uploaded images, and interactions such as likes. The system may also collect limited technical information including browser type, device type, and access timestamps to help improve performance and reliability.</p>
<h3>3. How Information Is Used</h3>
<p>Collected information may be used to create and manage user accounts, enable community interactions, maintain system functionality, improve application performance, and diagnose technical issues. Personal data is not sold or shared with third parties for marketing purposes.</p>
<h3>4. External APIs</h3>
<p>The application retrieves air traffic data from external public APIs. These third-party services may have their own privacy policies and data practices. 24Air Radar does not control how third-party services process their data.</p>
<h3>5. Data Security</h3>
<p>Reasonable security measures are implemented to protect user information. These measures include secure password storage, controlled database access, and protection of API keys on the server side. However, no internet system can be guaranteed to be completely secure.</p>
<h3>6. Data Retention</h3>
<p>User information is stored for as long as the account remains active or as required to maintain system functionality. Users may request account deletion where applicable.</p>
<h3>7. User Rights</h3>
<p>Users have the right to access their account information, update account details, and request account deletion if they no longer wish to use the service.</p>
<h3>8. Changes to this Policy</h3>
<p>This Privacy Policy may be updated periodically to reflect changes in system functionality or improvements. Users are encouraged to review this policy regularly.</p>
<h3>9. Contact</h3>
<p>If users have questions about this Privacy Policy, they may contact the project developer.</p>
`;
 
function buildLegalModal() {
  if (document.getElementById("legalModalBackdrop")) return;
 
  const backdrop = document.createElement("div");
  backdrop.id = "legalModalBackdrop";
  backdrop.className = "legal-modal-backdrop";
  backdrop.innerHTML = `
    <div class="legal-modal" role="dialog" aria-modal="true">
      <div class="legal-modal-header">
        <h2 id="legalModalTitle">Terms of Service</h2>
        <button class="legal-modal-close" id="legalModalClose" aria-label="Close">&times;</button>
      </div>
      <div class="legal-modal-body" id="legalModalBody"></div>
    </div>
  `;
 
  document.body.appendChild(backdrop);
 
  // Close on backdrop click
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeLegalModal();
  });
 
  // Close button
  document.getElementById("legalModalClose").addEventListener("click", closeLegalModal);
 
  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLegalModal();
  });
}
 
function openLegalModal(type) {
  buildLegalModal();
  const backdrop = document.getElementById("legalModalBackdrop");
  const title    = document.getElementById("legalModalTitle");
  const body     = document.getElementById("legalModalBody");
 
  if (type === "tos") {
    title.textContent = "Terms of Service";
    body.innerHTML = TOS_CONTENT;
  } else {
    title.textContent = "Privacy Policy";
    body.innerHTML = PRIVACY_CONTENT;
  }
 
  body.scrollTop = 0;
  backdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}
 
function closeLegalModal() {
  const backdrop = document.getElementById("legalModalBackdrop");
  if (backdrop) backdrop.classList.remove("open");
  document.body.style.overflow = "";
}
 
// Wire up any .legal-link elements already in the DOM
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-legal]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openLegalModal(el.dataset.legal);
    });
  });
});