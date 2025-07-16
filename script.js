const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const moodImage = document.getElementById('mood-img');
const progressBar = document.getElementById('progress-bar');
const clearBtn = document.getElementById('clear-all');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Handle task submission
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(), // Unique ID
    text: text,
    completed: false,
    date: new Date().toLocaleDateString(),
    priority: 'Low'
  };

  tasks.push(newTask);
  taskInput.value = '';
  saveTasks();
  renderTasks();
});

// Event delegation for toggling and priority
taskList.addEventListener('click', e => {
  const id = parseInt(e.target.dataset.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  if (e.target.classList.contains('toggle-task')) {
    task.completed = !task.completed;
  }

  if (e.target.classList.contains('priority-btn')) {
    task.priority = e.target.dataset.priority;
  }

  saveTasks();
  renderTasks();
});

// Clear all tasks
clearBtn.addEventListener('click', () => {
  tasks = [];
  saveTasks();
  renderTasks();
});

// Render tasks, sorted by completion
function renderTasks() {
  taskList.innerHTML = '';

  const incomplete = tasks.filter(t => !t.completed);
  const complete = tasks.filter(t => t.completed);
  const sorted = [...incomplete, ...complete];

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task';
    if (task.completed) li.classList.add('completed');

    // Priority border color
    if (task.priority === 'High') li.style.borderLeft = '6px solid red';
    else if (task.priority === 'Medium') li.style.borderLeft = '6px solid orange';
    else li.style.borderLeft = '6px solid green';

    li.innerHTML = `
      <div class="task-main">
        <input type="checkbox" class="toggle-task" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
        <span class="task-text">${task.text}</span>
        <small class="task-date">${task.date}</small>
      </div>
      <div class="priority-buttons">
        <button class="priority-btn" data-id="${task.id}" data-priority="High">🔥</button>
        <button class="priority-btn" data-id="${task.id}" data-priority="Medium">⚡</button>
        <button class="priority-btn" data-id="${task.id}" data-priority="Low">🌱</button>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateMood();
  updateProgress();
}

function updateMood() {
  const incompleteCount = tasks.filter(t => !t.completed).length;
  let mood = 'happy';

  if (incompleteCount > 2) mood = 'sad';
  else if (incompleteCount > 0) mood = 'neutral';

  moodImage.src = `assets/chikawa-${mood}.png`;
}

function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const percent = total ? (done / total) * 100 : 0;

  progressBar.style.width = `${percent}%`;

  if (percent === 100) {
    launchConfetti();
  }
}

function launchConfetti() {
  if (window.confetti) {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });
  }
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initial render
renderTasks();
