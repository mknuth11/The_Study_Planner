const API_URL = "http://127.0.0.1:8000";

async function handleAddTask() {
    clearTaskErrors();

    const courseName = document.getElementById("course-name").value.trim();
    const taskName = document.getElementById("task-name").value.trim();
    const taskType = document.getElementById("task-type").value;
    const deadline = document.getElementById("deadline").value;
    const estimatedTime = document.getElementById("estimated-time").value;
    const notes = document.getElementById("notes").value.trim();

    // Validation
    let hasError = false;

    if (!courseName) {
        showTaskFieldError("course-name-error", "Course name is required");
        hasError = true;
    }
    if (!taskName) {
        showTaskFieldError("task-name-error", "Task name is required");
        hasError = true;
    }
    if (!taskType) {
        showTaskFieldError("task-type-error", "Please select a task type");
        hasError = true;
    }
    if (!deadline) {
        showTaskFieldError("deadline-error", "Please select a deadline");
        hasError = true;
    }
    if (!estimatedTime || estimatedTime <= 0) {
        showTaskFieldError("estimated-time-error", "Please enter a valid estimated time");
        hasError = true;
    }

    const deadlineDate = new Date(deadline);
    const now = new Date();
    if (deadlineDate < now) {
        showTaskFieldError("deadline-error", "Deadline cannot be in the past");
        hasError = true;
    }

    if (hasError) return;

    // Get logged in user
    const user = JSON.parse(localStorage.getItem("user"));

    showLoader("add-task-btn", "Saving task...");

    try {
        const response = await fetch(`${API_URL}/tasks/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: user.id,
                course_name: courseName,
                task_name: taskName,
                task_type: taskType,
                deadline: new Date(deadline).toISOString(),
                estimated_time: parseFloat(estimatedTime),
                notes: notes || null
            })
        });

        const data = await response.json();

        if (data.success) {
            // TE5 - Show success message
            showTaskSuccess("Task added successfully! Redirecting to dashboard...");
            // Clear form
            document.getElementById("course-name").value = "";
            document.getElementById("task-name").value = "";
            document.getElementById("task-type").value = "";
            document.getElementById("deadline").value = "";
            document.getElementById("estimated-time").value = "";
            document.getElementById("notes").value = "";
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        } else {
            // TE4 - Show error with retry button
            showTaskErrorWithRetry(data.message);
        }

    } catch (error) {
        // TE4 - Connection failure error
        showTaskErrorWithRetry("Unable to connect to the server. Please check your connection and try again.");
    } finally {
        hideLoader("add-task-btn", "Add Task");
    }
}

// TE4 - Show error with retry button
function showTaskErrorWithRetry(message) {
    const el = document.getElementById("error-message");
    el.innerHTML = `
        ⚠️ ${message} 
        <button onclick="handleAddTask()" class="retry-btn">Try Again</button>
    `;
    el.style.display = "block";
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 500);
}

// ===== HELPERS =====
function showTaskFieldError(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.style.display = "block";
}

function showTaskError(message) {
    const el = document.getElementById("error-message");
    el.innerHTML = `⚠️ ${message}`;
    el.style.display = "block";
}

function showTaskSuccess(message) {
    const el = document.getElementById("success-message");
    el.innerHTML = `✅ ${message}`;
    el.style.display = "block";
}

function clearTaskErrors() {
    document.querySelectorAll(".field-error").forEach(e => {
        e.textContent = "";
        e.style.display = "none";
    });
    const error = document.getElementById("error-message");
    if (error) error.style.display = "none";
    const success = document.getElementById("success-message");
    if (success) success.style.display = "none";
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