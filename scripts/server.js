// LOGIN
async function Login() {
    const emailInput = document.querySelector("input[type='email']");
    const passwordInput = document.querySelector("input[type='password']");

    try {
        const result = await apiLogin(emailInput.value, passwordInput.value);
        alert("Login successful. Welcome " + result.username);
        window.location.href = "map.html";
    } catch (err) {
        alert("Login failed: " + err.message);
    }
}

// REGISTER
async function Register() {
    const inputs = document.querySelectorAll("input");
    const email = inputs[0].value;
    const username = inputs[1].value;
    const password = inputs[2].value;

    try {
        await apiRegister(username, email, password);
        alert("Registration successful. Please login.");
        window.location.href = "login.html";
    } catch (err) {
        alert("Register failed: " + err.message);
    }
}

// Frontend Endpoint API calls

const API_BASE = "http://localhost:8080/api";

// Utility to safely parse JSON
async function handleResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

// ===============================
// AUTH FUNCTIONS
// ===============================

// REGISTER USER
async function apiRegister(username, email, password) {
    const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
    });

    return handleResponse(response);
}

// LOGIN USER
async function apiLogin(usernameOrEmail, password) {
    const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ usernameOrEmail, password })
    });

    const data = await handleResponse(response);

    // Store login session (simple version)
    if (data.username) {
        localStorage.setItem("loggedInUser", data.username);
    }

    return data;
}

// LOGOUT
function apiLogout() {
    localStorage.removeItem("loggedInUser");
}

// ===============================
// SETTINGS / USER FUNCTIONS
// (Optional for later expansion)
// ===============================

async function apiUpdatePassword(newPassword) {
    const response = await fetch(`${API_BASE}/change-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ password: newPassword })
    });

    return handleResponse(response);
}

async function apiUpdateUsername(newUsername) {
    const response = await fetch(`${API_BASE}/change-username`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: newUsername })
    });

    return handleResponse(response);
}