const API_URL = "http://127.0.0.1:8000";

async function handleAddTask() {
    clearTaskErrors();

    // Get all field values
    const courseName = document.getElementById("course-name").value.trim();
    const taskName = document.getElementById("task-name").value.trim();
    const taskType = document.getElementById("task-type").value;
    const deadline = document.getElementById("deadline").value;
    const estimatedTime = document.getElementById("estimated-time").value;
    const notes = document.getElementById("notes").value.trim();

    // Validate fields
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
    if (!estimatedTime) {
        showTaskFieldError("estimated-time-error", "Estimated time is required");
        hasError = true;
    }
    if (estimatedTime <= 0) {
        showTaskFieldError("estimated-time-error", "Estimated time must be greater than 0");
        hasError = true;
    }

  
    const deadlineDate = new Date(deadline);
    const now = new Date();
    if (deadlineDate < now) {
        showTaskFieldError("deadline-error", "Deadline cannot be in the past");
        hasError = true;
    }

    if (hasError) return;

    console.log("Validation passed!");
    console.log({ courseName, taskName, taskType, deadline, estimatedTime, notes });
}


function showTaskFieldError(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.style.display = "block";
}

function showTaskError(message) {
    const el = document.getElementById("error-message");
    el.innerHTML = `⚠️ ${message}`;
    el.style.display = "block";
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 500);
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