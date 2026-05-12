const API_URL = "http://127.0.0.1:8000";

async function loadCompletedTasks() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const list = document.getElementById("completed-list");

  try {
    const response = await fetch(`${API_URL}/tasks/completed/${user.id}`);
    const data = await response.json();

    if (!data.success || data.tasks.length === 0) {
      list.innerHTML = `
                <div class="empty-state">
                    <p>📭 No completed tasks yet!</p>
                    <p>Go to <a href="index.html">Dashboard</a> and mark some tasks as done.</p>
                </div>
            `;
      return;
    }

    list.innerHTML = "";
    data.tasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card completed";

      const deadline = new Date(task.deadline);
      const badgeClass = `badge-${task.task_type.toLowerCase()}`;

      card.innerHTML = `
                <div class="task-info">
                    <h4>
                        ${task.task_name}
                        <span class="task-type-badge ${badgeClass}">${task.task_type}</span>
                    </h4>
                    <p>📚 ${task.course_name} &nbsp;•&nbsp; 📅 Due: ${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString()}</p>
                    <p>⏱ Estimated: ${task.estimated_time} hours</p>
                </div>
                <div class="task-actions">
                    <button style="background-color:#1E8E3E; cursor:default;" disabled>✔ Done</button>
                </div>
            `;

      list.appendChild(card);
    });
  } catch (error) {
    list.innerHTML = `
            <div class="error-message" style="display:block;">
                ⚠️ Unable to load completed tasks. Please try again.
                <button onclick="loadCompletedTasks()" class="retry-btn">🔄 Refresh</button>
            </div>
        `;
  }
}

loadCompletedTasks();
