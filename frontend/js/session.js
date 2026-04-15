// ===== SESSION MANAGEMENT =====

// Get logged in user
function getUser() {
    const user = localStorage.getItem("user");
    if (user) {
        return JSON.parse(user);
    }
    return null;
}

// Check if user is logged in
// If not redirect to login page
function requireLogin() {
    const user = getUser();
    if (!user) {
        window.location.href = "login.html";
    }
    return user;
}

// Logout function
function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// Update navbar to show username and logout button
function updateNavbar() {
    const user = getUser();
    const navLinks = document.querySelector(".nav-links");

    if (user) {
        // Remove login link and add username and logout
        navLinks.innerHTML = `
            <li><a href="index.html">Dashboard</a></li>
            <li><a href="add-task.html">Add Task</a></li>
            <li><a href="completed.html">Completed</a></li>
            <li><span class="nav-username">👤 ${user.username}</span></li>
            <li><a href="#" onclick="logout()" class="nav-logout">Logout</a></li>
        `;
    } else {
        navLinks.innerHTML = `
            <li><a href="index.html">Dashboard</a></li>
            <li><a href="add-task.html">Add Task</a></li>
            <li><a href="completed.html">Completed</a></li>
            <li><a href="login.html">Login</a></li>
            <li><a href="signup.html">Sign Up</a></li>
        `;
    }
}