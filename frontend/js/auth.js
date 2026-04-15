const API_URL = "http://127.0.0.1:8000";

// ===== SIGNUP =====
async function handleSignup() {
    clearErrors();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Frontend validation
    let hasError = false;

    if (!username) {
        showFieldError("username-error", "Username is required");
        hasError = true;
    }
    if (!email) {
        showFieldError("email-error", "Email is required");
        hasError = true;
    }
    if (!password) {
        showFieldError("password-error", "Password is required");
        hasError = true;
    }
    if (password.length < 6) {
        showFieldError("password-error", "Password must be at least 6 characters");
        hasError = true;
    }
    if (hasError) return;

    // Show loader
    showLoader("signup-btn", "Creating account...");

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess("Account created successfully! Redirecting to login...");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            showError(data.message);
        }

    } catch (error) {
        showError("Unable to connect to the server. Please check your connection and try again.");
    } finally {
        hideLoader("signup-btn", "Create Account");
    }
}

// ===== LOGIN =====
async function handleLogin() {
    clearErrors();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Frontend validation
    let hasError = false;

    if (!username) {
        showFieldError("username-error", "Username is required");
        hasError = true;
    }
    if (!password) {
        showFieldError("password-error", "Password is required");
        hasError = true;
    }
    if (hasError) return;

    showLoader("login-btn", "Logging in...");

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        // Handle server errors
        if (!response.ok && response.status !== 422) {
            showError("Server error. Please try again later.");
            return;
        }

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("user", JSON.stringify(data.user));
            showSuccess("Login successful! Redirecting...");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        } else {
            showError(data.message);
        }

    } catch (error) {
        showError("Unable to connect to the server. Please check your connection and try again.");
    } finally {
        hideLoader("login-btn", "Login");
    }
}

// ===== HELPERS =====
function showFieldError(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.style.display = "block";
}

function showError(message) {
    const el = document.getElementById("error-message");
    el.innerHTML = `⚠️ ${message}`;
    el.style.display = "block";
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 500);
}

function showSuccess(message) {
    const el = document.getElementById("success-message");
    el.innerHTML = `✅ ${message}`;
    el.style.display = "block";
}

function showLoader(btnId, loadingText) {
    const btn = document.getElementById(btnId);
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> ${loadingText}`;
}

function hideLoader(btnId, originalText) {
    const btn = document.getElementById(btnId);
    btn.disabled = false;
    btn.innerHTML = originalText;
}

function clearErrors() {
    document.querySelectorAll(".field-error").forEach(e => {
        e.textContent = "";
        e.style.display = "none";
    });
    const error = document.getElementById("error-message");
    if (error) error.style.display = "none";
    const success = document.getElementById("success-message");
    if (success) success.style.display = "none";
}