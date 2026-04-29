const API_URL = "http://127.0.0.1:8000";

async function loadTasks() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    // Show loading state
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = `<p class="empty-message">⏳ Loading your tasks...</p>`;

    try {
        const response = await fetch(`${API_URL}/tasks/${user.id}`);

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        // TS3 - Empty state
        if (!data.success || data.tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <p>📭 No tasks yet!</p>
                    <p>Click <a href="add-task.html">Add Task</a> to get started.</p>
                </div>
            `;
            return;
        }

        // Display tasks
        taskList.innerHTML = "";
        data.tasks.forEach(task => {
            const taskCard = createTaskCard(task);
            taskList.appendChild(taskCard);
        });

    } catch (error) {
        // TS3 - Error handling
        taskList.innerHTML = `
            <div class="error-message" style="display:block;">
                ⚠️ Unable to load your tasks. Please refresh the page or try again later.
                <button onclick="loadTasks()" class="retry-btn">🔄 Refresh</button>
            </div>
        `;
    }
}

function createTaskCard(task) {
    const card = document.createElement("div");
    card.className = "task-card";

    const deadline = new Date(task.deadline);
    const now = new Date();
    const hoursLeft = (deadline - now) / (1000 * 60 * 60);

    if (hoursLeft < 0) {
        card.classList.add("overdue");
    } else if (hoursLeft <= 48) {
        card.classList.add("urgent");
    } else if (hoursLeft <= 72) {
        card.classList.add("warning");
    }

    const highPriority = (task.task_type === "Test" || task.task_type === "Project")
        ? `<span class="high-priority-label">⚡ High Priority</span>`
        : "";

    const overdueLabel = hoursLeft < 0
        ? `<span class="overdue-label">🔴 Overdue</span>`
        : "";

    const badgeClass = `badge-${task.task_type.toLowerCase()}`;

    card.innerHTML = `
        <div class="task-info">
            <h4>
                ${task.task_name}
                <span class="task-type-badge ${badgeClass}">${task.task_type}</span>
                ${highPriority}
                ${overdueLabel}
            </h4>
            <p>📚 ${task.course_name} &nbsp;•&nbsp; 📅 Due: ${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString()}</p>
            <p>⏱ Estimated: ${task.estimated_time} hours</p>
        </div>
        <div class="task-actions">
            <button id="btn-${task.id}" onclick="markComplete(${task.id})">✅ Mark as Done</button>
        </div>
    `;

    return card;
}

// MC2 + MC3 + MC4 - Mark complete with frontend update
async function markComplete(taskId) {
    const btn = document.getElementById(`btn-${taskId}`);
    
    // MC4 - Show loader on button
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Saving...`;

    try {
        const response = await fetch(`${API_URL}/tasks/complete/${taskId}`, {
            method: "PUT"
        });

        const data = await response.json();

        if (data.success) {
            // MC2 - Find the card and move to completed section
            const card = btn.closest(".task-card");
            
            // Add completed styling
            card.classList.remove("urgent", "warning", "overdue");
            card.classList.add("completed");

            // Update button
            btn.innerHTML = "✔ Done!";
            btn.style.backgroundColor = "#1E8E3E";
            btn.disabled = true;

            // MC3 - Move card to completed section after 1 second
            setTimeout(() => {
                card.style.transition = "opacity 0.5s";
                card.style.opacity = "0";
                setTimeout(() => {
                    // Move to completed section
                    let completedSection = document.getElementById("completed-section");
                    if (!completedSection) {
                        completedSection = document.createElement("div");
                        completedSection.id = "completed-section";
                        completedSection.innerHTML = `<h2 class="completed-title">✅ Completed Tasks</h2>`;
                        document.querySelector(".main-content").appendChild(completedSection);
                    }
                    card.style.opacity = "1";
                    completedSection.appendChild(card);

                    // MC3 - Update total remaining hours
                    updateRemainingHours();
                }, 500);
            }, 1000);

        } else {
            // MC4 - Error handling
            btn.disabled = false;
            btn.innerHTML = "✅ Mark as Done";
            showInlineError(btn, "Could not update. Try again.");
        }

    } catch (error) {
        // MC4 - Connection failure
        btn.disabled = false;
        btn.innerHTML = "✅ Mark as Done";
        showInlineError(btn, "Connection failed. Try again.");
    }
}

// MC3 - Update remaining hours
function updateRemainingHours() {
    const activeTasks = document.querySelectorAll(".task-card:not(.completed)");
    let totalHours = 0;
    activeTasks.forEach(card => {
        const hoursText = card.querySelector("p:last-child").textContent;
        const hours = parseFloat(hoursText.replace("⏱ Estimated: ", "").replace(" hours", ""));
        if (!isNaN(hours)) totalHours += hours;
    });

    const hoursEl = document.getElementById("total-hours");
    if (hoursEl) hoursEl.textContent = totalHours.toFixed(1) + " hrs remaining";
}

// MC4 - Show inline error next to button
function showInlineError(btn, message) {
    const existing = document.getElementById("inline-error");
    if (existing) existing.remove();

    const err = document.createElement("span");
    err.id = "inline-error";
    err.style.cssText = "color:#D93025; font-size:12px; margin-left:10px;";
    err.textContent = message;
    btn.parentElement.appendChild(err);

    setTimeout(() => err.remove(), 3000);
}

// Load tasks when page loads
loadTasks();