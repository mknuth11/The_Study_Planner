const API_URL = "http://127.0.0.1:8000";

async function loadTasks() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${user.id}`);
        const data = await response.json();

        const taskList = document.getElementById("task-list");

        if (!data.success || data.tasks.length === 0) {
            taskList.innerHTML = `<p class="empty-message">No tasks yet. Click "Add Task" to get started!</p>`;
            return;
        }

        // Display tasks
        taskList.innerHTML = "";
        data.tasks.forEach(task => {
            const taskCard = createTaskCard(task);
            taskList.appendChild(taskCard);
        });

    } catch (error) {
        document.getElementById("task-list").innerHTML = `
            <div class="error-message" style="display:block;">
                ⚠️ Unable to load your tasks. Please refresh the page or try again later.
                <button onclick="loadTasks()" class="retry-btn">Refresh</button>
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
            <button onclick="markComplete(${task.id})">✅ Mark as Done</button>
        </div>
    `;

    return card;
}

async function markComplete(taskId) {
    console.log("Mark complete clicked for task:", taskId);
}

// Load tasks when page loads
loadTasks();