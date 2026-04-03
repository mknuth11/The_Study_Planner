const API_URL = "http://127.0.0.1:8000";

// ===== SIGNUP =====
async function handleSignup() {
    // Clear previous errors
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
    if (hasError) return;

    // Send to backend
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById("success-message").style.display = "block";
        } else {
            showError(data.message);
        }

    } catch (error) {
        showError("Unable to connect to the server. Please try again later.");
    }
}

// ===== LOGIN =====
async function handleLogin() {
    clearErrors();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

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

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Save user to localStorage
            localStorage.setItem("user", JSON.stringify(data.user));
            // Redirect to dashboard
            window.location.href = "index.html";
        } else {
            showError(data.message);
        }

    } catch (error) {
        showError("Unable to connect to the server. Please try again later.");
    }
}

// ===== HELPERS =====
function showFieldError(id, message) {
    document.getElementById(id).textContent = message;
    document.getElementById(id).style.color = "red";
}

function showError(message) {
    document.getElementById("error-message").style.display = "block";
    document.getElementById("error-text").textContent = message;
}

function clearErrors() {
    const errors = document.querySelectorAll(".field-error");
    errors.forEach(e => e.textContent = "");
    document.getElementById("error-message").style.display = "none";
    const success = document.getElementById("success-message");
    if (success) success.style.display = "none";
}