// Element selectors
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const priorityInput = document.getElementById('priority-input');
const taskList = document.getElementById('task-list');
const moodImage = document.getElementById('mood-image');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const clearAllBtn = document.getElementById('clear-all');
const priorityButtons = document.querySelectorAll('.priority-btn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let confettiFired = false;
let draggedIndex = null;

// Set selected priority from buttons
priorityButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    priorityButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    priorityInput.value = btn.dataset.priority;
  });
});

const chikawaIcons = [
  'assets/chikawa-happy.png',
  'assets/chikawa-sleepy.png',
  'assets/chikawa-cheer.png'
];

// Save tasks
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add task
taskForm.addEventListener('submit', e => {
  e.preventDefault();

  const priority = priorityInput.value;
  if (!priority) {
    alert("Please select a priority!");
    return;
  }

  const newTask = {
    text: taskInput.value,
    completed: false,
    date: new Date().toLocaleDateString(),
    priority: priority
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = '';
  priorityInput.value = '';
  priorityButtons.forEach(b => b.classList.remove('selected'));
});

// Toggle task complete
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();

  if (tasks[index].completed) {
    const audio = new Audio('assets/complete.mp3');
    audio.play();
  }
}

// Delete task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Clear all
clearAllBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

// Drag handlers
function handleDragStart(e) {
  draggedIndex = +this.dataset.index;
}
function handleDragOver(e) {
  e.preventDefault();
}
function handleDrop(e) {
  const droppedIndex = +this.dataset.index;
  if (draggedIndex === droppedIndex) return;

  const draggedTask = tasks[draggedIndex];
  tasks.splice(draggedIndex, 1);
  tasks.splice(droppedIndex, 0, draggedTask);
  saveTasks();
  renderTasks();
}

// Render all tasks
function renderTasks() {
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';
    li.classList.add(`priority-${task.priority.toLowerCase()}`);
    li.setAttribute('draggable', true);
    li.dataset.index = index;

    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);

    const img = document.createElement('img');
    img.src = chikawaIcons[index % chikawaIcons.length];
    img.alt = "Chikawa";
    img.className = 'chikawa-icon';

    const taskText = document.createElement('span');
    taskText.textContent = task.text;

    const dateText = document.createElement('small');
    dateText.textContent = `🗓 ${task.date}`;
    dateText.style.display = 'block';
    dateText.style.fontSize = '12px';
    dateText.style.color = '#888';

    const priorityLabel = document.createElement('small');
    priorityLabel.textContent = `⭐ Priority: ${task.priority}`;
    priorityLabel.style.display = 'block';
    priorityLabel.style.fontSize = '12px';
    priorityLabel.style.color = '#444';

    taskText.appendChild(dateText);
    taskText.appendChild(priorityLabel);

    const btnContainer = document.createElement('div');
    const completeBtn = document.createElement('button');
    completeBtn.textContent = '✅';
    completeBtn.onclick = () => toggleTask(index);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '❌';
    deleteBtn.onclick = () => deleteTask(index);

    btnContainer.appendChild(completeBtn);
    btnContainer.appendChild(deleteBtn);

    li.appendChild(img);
    li.appendChild(taskText);
    li.appendChild(btnContainer);
    taskList.appendChild(li);
  });

  updateMoodAndProgress();
}

// Mood + Progress bar
function updateMoodAndProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const incomplete = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${percent}% Complete`;

  let mood = 'neutral';
  if (total === 0) {
    mood = 'neutral';
  } else if (incomplete > 2) {
    mood = 'sad';
  } else if (incomplete > 0) {
    mood = 'calm';
  } else {
    mood = 'happy';
  }

  if (!moodImage.classList.contains('celebrating')) {
    moodImage.src = `assets/chikawa-${mood}.png`;
  }

  if (percent === 100 && !confettiFired) {
    moodImage.src = 'assets/chikawa-celebrate.gif';
    moodImage.classList.add('celebrating');
    progressBar.classList.add('bounce');
    launchConfetti();
    confettiFired = true;

    setTimeout(() => {
      moodImage.classList.remove('celebrating');
      moodImage.src = 'assets/chikawa-happy.png';
    }, 3000);

    setTimeout(() => {
      progressBar.classList.remove('bounce');
    }, 600);
  } else if (percent < 100) {
    confettiFired = false;
  }
}

// Confetti 🎉 + Celebration GIF
function launchConfetti() {
  const duration = 1000;
  const end = Date.now() + duration;
  const colors = ['#ffb3c1', '#fcd5ce', '#cdb4db', '#ffc8dd', '#ff8fab'];

  // 🎊 Add GIF
  const gif = document.createElement('img');
  gif.src = 'assets/chikawa-celebrate.gif'; // ✅ make sure this path is correct
  gif.className = 'celebration-gif';
  document.body.appendChild(gif);

  // ⏱️ Remove GIF after 4 seconds
  setTimeout(() => {
    gif.remove();
  }, 4000);

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.animationDuration = 1 + Math.random() + 's';
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      particle.style.width = particle.style.height = `${10 + Math.random() * 8}px`;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1500);
    }
  }, 100);
}


// Inject styles for confetti + bounce
const style = document.createElement('style');
style.textContent = `
  .confetti {
    position: fixed;
    top: -20px;
    width: 14px;
    height: 14px;
    z-index: 9999;
    opacity: 1;
    animation: fall 1.5s ease-out forwards;
    pointer-events: none;
  }

  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  .bounce {
    animation: bounce 0.6s ease-in-out;
  }

  @keyframes bounce {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.2); }
    50%  { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

// Init
renderTasks();
