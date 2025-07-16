const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const moodImage = document.getElementById('mood-img');
const progressBar = document.getElementById('progress-bar');
const clearBtn = document.getElementById('clear-all');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!taskInput.value.trim()) return;

  const newTask = {
    text: taskInput.value.trim(),
    completed: false,
    date: new Date().toLocaleDateString(),
    priority: 'Low'
  };

  tasks.push(newTask);
  taskInput.value = '';
  saveTasks();
  renderTasks();
});

taskList.addEventListener('click', e => {
  const index = e.target.dataset.index;

  if (e.target.classList.contains('toggle-task')) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  }

  if (e.target.classList.contains('priority-btn')) {
    tasks[index].priority = e.target.dataset.priority;
    saveTasks();
    renderTasks();
  }
});

clearBtn.addEventListener('click', () => {
  tasks = [];
  saveTasks();
  renderTasks();
});

function renderTasks() {
  taskList.innerHTML = '';

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completeTasks = tasks.filter(t => t.completed);
  const sorted = [...incompleteTasks, ...completeTasks];

  sorted.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task';
    if (task.completed) li.classList.add('completed');

    // Priority color
    if (task.priority === 'High') li.style.borderLeft = '6px solid red';
    else if (task.priority === 'Medium') li.style.borderLeft = '6px solid orange';
    else li.style.borderLeft = '6px solid green';

    li.innerHTML = `
      <div class="task-main">
        <input type="checkbox" class="toggle-task" data-index="${index}" ${task.completed ? 'checked' : ''}>
        <span class="task-text">${task.text}</span>
        <small class="task-date">${task.date}</small>
      </div>
      <div class="priority-buttons">
        <button class="priority-btn" data-priority="High" data-index="${index}">🔥</button>
        <button class="priority-btn" data-priority="Medium" data-index="${index}">⚡</button>
        <button class="priority-btn" data-priority="Low" data-index="${index}">🌱</button>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateMood();
  updateProgress();
}

function updateMood() {
  const incomplete = tasks.filter(t => !t.completed).length;

  let src = 'assets/chikawa-happy.png';
  if (incomplete > 2) src = 'assets/chikawa-sad.png';
  else if (incomplete > 0) src = 'assets/chikawa-neutral.png';

  moodImage.src = src;
}

function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const percent = total ? (done / total) * 100 : 0;

  progressBar.style.width = percent + '%';

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