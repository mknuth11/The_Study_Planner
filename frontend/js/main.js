const API_URL = "http://127.0.0.1:8000";

// Store charts globally so we can destroy and recreate
let hoursChart = null;
let courseChart = null;
let typeChart = null;
let completionChart = null;

// Track completed tasks count
let completedCount = 0;
let totalTasksCount = 0;

async function loadTasks() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const taskList = document.getElementById("task-list");
  taskList.innerHTML = `<p class="empty-message">⏳ Loading your tasks...</p>`;

  try {
    const response = await fetch(`${API_URL}/tasks/${user.id}`);
    if (!response.ok) throw new Error("Server error");

    const data = await response.json();

    if (!data.success || data.tasks.length === 0) {
      taskList.innerHTML = `
                <div class="empty-state">
                    <p>📭 No tasks yet!</p>
                    <p>Click <a href="add-task.html">Add Task</a> to get started.</p>
                </div>
            `;
      document.getElementById("charts-section").style.display = "none";
    } else {
      totalTasksCount = data.tasks.length;
      taskList.innerHTML = "";
      data.tasks.forEach((task) => {
        const taskCard = createTaskCard(task);
        taskList.appendChild(taskCard);
      });
      buildCharts(data.tasks);
    }

    // Always load completed tasks
    await loadCompletedTasks();
  } catch (error) {
    taskList.innerHTML = `
            <div class="error-message" style="display:block;">
                ⚠️ Unable to load your tasks. Please refresh the page or try again later.
                <button onclick="loadTasks()" class="retry-btn">🔄 Refresh</button>
            </div>
        `;
    showFallbackSummary();
  }
}

// VD2-VD5 Build all charts
function buildCharts(tasks) {
  // Check if Chart.js loaded - VD6
  if (typeof Chart === "undefined") {
    showFallbackSummary(tasks);
    return;
  }

  document.getElementById("charts-section").style.display = "block";

  // Destroy existing charts before rebuilding
  if (hoursChart) hoursChart.destroy();
  if (courseChart) courseChart.destroy();
  if (typeChart) typeChart.destroy();
  if (completionChart) completionChart.destroy();

  // VD2 - Total remaining hours chart
  const totalHours = tasks.reduce(
    (sum, t) => sum + parseFloat(t.estimated_time),
    0,
  );
  const completedHours = completedCount;

  hoursChart = new Chart(document.getElementById("hoursChart"), {
    type: "doughnut",
    data: {
      labels: ["Remaining Hours", "Completed Hours"],
      datasets: [
        {
          data: [totalHours, completedHours],
          backgroundColor: ["#1A73E8", "#1E8E3E"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });

  // VD3 - Tasks by course chart
  const courseCounts = {};
  tasks.forEach((t) => {
    courseCounts[t.course_name] = (courseCounts[t.course_name] || 0) + 1;
  });

  const courseColors = [
    "#1A73E8",
    "#9334E6",
    "#D93025",
    "#1E8E3E",
    "#F9AB00",
    "#00ACC1",
  ];

  courseChart = new Chart(document.getElementById("courseChart"), {
    type: "bar",
    data: {
      labels: Object.keys(courseCounts),
      datasets: [
        {
          label: "Tasks",
          data: Object.values(courseCounts),
          backgroundColor: courseColors.slice(
            0,
            Object.keys(courseCounts).length,
          ),
          borderRadius: 6,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
      },
    },
  });

  // VD4 - Tasks by type chart
  const typeCounts = { Homework: 0, Quiz: 0, Test: 0, Project: 0 };
  tasks.forEach((t) => {
    if (typeCounts[t.task_type] !== undefined) typeCounts[t.task_type]++;
  });

  typeChart = new Chart(document.getElementById("typeChart"), {
    type: "pie",
    data: {
      labels: Object.keys(typeCounts),
      datasets: [
        {
          data: Object.values(typeCounts),
          backgroundColor: ["#1A73E8", "#9334E6", "#D93025", "#1E8E3E"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
    },
  });

  // VD5 - Completed vs incomplete chart
  const incomplete = totalTasksCount - completedCount;

  completionChart = new Chart(document.getElementById("completionChart"), {
    type: "doughnut",
    data: {
      labels: ["Incomplete", "Completed"],
      datasets: [
        {
          data: [incomplete, completedCount],
          backgroundColor: ["#D93025", "#1E8E3E"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
    },
  });
}

// VD6 - Fallback text summary if Chart.js fails
function showFallbackSummary(tasks) {
  document.getElementById("charts-section").style.display = "none";
  const fallback = document.getElementById("fallback-summary");
  fallback.style.display = "block";

  if (!tasks) {
    document.getElementById("fallback-grid").innerHTML =
      `<p>Unable to load summary.</p>`;
    return;
  }

  const totalHours = tasks.reduce(
    (sum, t) => sum + parseFloat(t.estimated_time),
    0,
  );
  const courseCounts = {};
  tasks.forEach((t) => {
    courseCounts[t.course_name] = (courseCounts[t.course_name] || 0) + 1;
  });

  document.getElementById("fallback-grid").innerHTML = `
        <div class="fallback-card">⏱ <strong>${totalHours}</strong> total hours remaining</div>
        <div class="fallback-card">📋 <strong>${tasks.length}</strong> incomplete tasks</div>
        <div class="fallback-card">✅ <strong>${completedCount}</strong> completed tasks</div>
        <div class="fallback-card">📚 <strong>${Object.keys(courseCounts).length}</strong> courses</div>
    `;
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

  const highPriority =
    task.task_type === "Test" || task.task_type === "Project"
      ? `<span class="high-priority-label">⚡ High Priority</span>`
      : "";

  const overdueLabel =
    hoursLeft < 0 ? `<span class="overdue-label">🔴 Overdue</span>` : "";

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
            <button id="btn-${task.id}" onclick="markComplete(${task.id}, ${task.estimated_time})">✅ Mark as Done</button>
        </div>
    `;

  return card;
}

async function markComplete(taskId, estimatedTime) {
  const btn = document.getElementById(`btn-${taskId}`);
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Saving...`;

  try {
    const response = await fetch(`${API_URL}/tasks/complete/${taskId}`, {
      method: "PUT",
    });

    const data = await response.json();

    if (data.success) {
      completedCount++;

      const card = btn.closest(".task-card");
      card.classList.remove("urgent", "warning", "overdue");
      card.classList.add("completed");
      btn.innerHTML = "✔ Done!";
      btn.style.backgroundColor = "#1E8E3E";
      btn.disabled = true;

      setTimeout(() => {
        card.style.transition = "opacity 0.5s";
        card.style.opacity = "0";
        setTimeout(() => {
          let completedSection = document.getElementById("completed-section");
          if (!completedSection.querySelector(".completed-title")) {
            completedSection.innerHTML = `<h2 class="completed-title">✅ Completed Tasks</h2>`;
          }
          card.style.opacity = "1";
          completedSection.appendChild(card);
          updateRemainingHours(estimatedTime);
          // Reload charts with updated data
          loadTasks();
        }, 500);
      }, 1000);
    } else {
      btn.disabled = false;
      btn.innerHTML = "✅ Mark as Done";
      showInlineError(btn, "Could not update. Try again.");
    }
  } catch (error) {
    btn.disabled = false;
    btn.innerHTML = "✅ Mark as Done";
    showInlineError(btn, "Connection failed. Try again.");
  }
}

function updateRemainingHours(estimatedTime) {
  const activeTasks = document.querySelectorAll(".task-card:not(.completed)");
  let totalHours = 0;
  activeTasks.forEach((card) => {
    const hoursText = card.querySelector("p:last-child").textContent;
    const hours = parseFloat(
      hoursText.replace("⏱ Estimated: ", "").replace(" hours", ""),
    );
    if (!isNaN(hours)) totalHours += hours;
  });
  console.log("Remaining hours:", totalHours);
}

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

async function loadCompletedTasks() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  try {
    const response = await fetch(`${API_URL}/tasks/completed/${user.id}`);
    const data = await response.json();

    if (!data.success || data.tasks.length === 0) return;

    completedCount = data.tasks.length;

    let completedSection = document.getElementById("completed-section");
    completedSection.innerHTML = `<h2 class="completed-title">✅ Completed Tasks</h2>`;

    data.tasks.forEach((task) => {
      const card = createCompletedCard(task);
      completedSection.appendChild(card);
    });
  } catch (error) {
    console.log("Could not load completed tasks");
  }
}

function createCompletedCard(task) {
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

  return card;
}

loadTasks();
