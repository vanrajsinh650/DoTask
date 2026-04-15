/* ============================================
   DoTask — Smart Task Manager Application
   Pure Vanilla JavaScript — No frameworks
   ============================================ */

const API_BASE = '/api';
let isOnline = false;
let tasks = [];
let currentFilter = 'all';
let currentSort = 'createdAt-desc';
let searchQuery = '';
let extrasVisible = false;

// --- Motivational Quotes ---
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Small steps every day lead to big changes.", author: "Unknown" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "One task at a time. That's how mountains are moved.", author: "Unknown" },
  { text: "The way to get things done is to stimulate competition.", author: "Andrew Carnegie" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
];

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', async () => {
  setGreeting();
  setDate();
  setRandomQuote();
  setThemeFromStorage();
  setDefaultDueDate();

  // Keyboard shortcuts
  document.getElementById('addInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });

  document.getElementById('editTitle').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') closeEditModal();
  });

  // Connection check & load
  await checkConnection();
  await loadTasks();

  // Refresh countdown timers every minute
  setInterval(() => render(), 60 * 1000);
});

// ========== DATE & GREETING ==========

function setGreeting() {
  const hour = new Date().getHours();
  let greeting;
  if (hour < 5) greeting = 'Good Night 🌙';
  else if (hour < 12) greeting = 'Good Morning ☀️';
  else if (hour < 17) greeting = 'Good Afternoon 🌤️';
  else if (hour < 21) greeting = 'Good Evening 🌅';
  else greeting = 'Good Night 🌙';

  const el = document.getElementById('headerGreeting');
  if (el) el.textContent = greeting;
}

function setDate() {
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const el = document.getElementById('headerDate');
  if (el) el.textContent = now.toLocaleDateString('en-IN', opts);
}

function setRandomQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const textEl = document.getElementById('quoteText');
  const authorEl = document.getElementById('quoteAuthor');
  if (textEl) textEl.textContent = `"${q.text}"`;
  if (authorEl) authorEl.textContent = `— ${q.author}`;
}

function setDefaultDueDate() {
  const today = new Date().toISOString().split('T')[0];
  const el = document.getElementById('addDueDate');
  if (el) el.value = today;
}

// ========== CONNECTION & API ==========

async function checkConnection() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    isOnline = res.ok;
  } catch {
    isOnline = false;
  }
  updateStatusBadge();
}

function updateStatusBadge(syncing = false) {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  if (!dot || !text) return;

  dot.className = 'status-dot';
  if (syncing) {
    dot.classList.add('syncing');
    text.textContent = 'Syncing';
  } else if (isOnline) {
    text.textContent = 'Live';
  } else {
    dot.classList.add('offline');
    text.textContent = 'Offline';
  }
}

// ========== LOCAL STORAGE ==========

function saveLocal(data) {
  try { localStorage.setItem('dotask_tasks', JSON.stringify(data)); } catch {}
}

function loadLocal() {
  try {
    const data = localStorage.getItem('dotask_tasks');
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

// ========== API REQUEST HELPER ==========

async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

// ========== CRUD OPERATIONS ==========

async function loadTasks() {
  updateStatusBadge(true);
  try {
    if (isOnline) {
      const data = await apiRequest(`${API_BASE}/tasks`);
      tasks = data.data;
      saveLocal(tasks);
      isOnline = true;
    } else {
      tasks = loadLocal();
    }
  } catch {
    isOnline = false;
    tasks = loadLocal();
    showToast('Offline mode — changes saved locally', 'default');
  }
  updateStatusBadge();
  render();
}

async function addTask() {
  const titleInput = document.getElementById('addInput');
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    // Shake animation
    titleInput.parentElement.style.animation = 'shake 0.4s ease';
    setTimeout(() => titleInput.parentElement.style.animation = '', 400);
    return;
  }

  const tags = document.getElementById('addTags').value
    .split(',').map(t => t.trim()).filter(Boolean);

  const dueDateVal = document.getElementById('addDueDate').value || null;
  const dueTimeVal = document.getElementById('addDueTime').value || null;

  let completionTime = null;
  if (dueDateVal && dueTimeVal) {
    completionTime = `${dueDateVal}T${dueTimeVal}`;
  } else if (dueTimeVal) {
    completionTime = dueTimeVal;
  }

  const payload = {
    title,
    description: document.getElementById('addDesc').value.trim(),
    priority: document.getElementById('addPriority').value,
    dueDate: dueDateVal,
    completionTime,
    tags
  };

  try {
    updateStatusBadge(true);
    if (isOnline) {
      const data = await apiRequest(`${API_BASE}/tasks`, {
        method: 'POST', body: JSON.stringify(payload)
      });
      tasks.unshift(data.data);
    } else {
      const localTask = {
        ...payload,
        id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      tasks.unshift(localTask);
    }
    saveLocal(tasks);
    clearAddForm();
    render();
    showToast('✓ Task added successfully', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to add task', 'error');
  }
  updateStatusBadge();
}

async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const prev = task.completed;
  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();
  saveLocal(tasks);
  render();

  if (task.completed) {
    showToast('🎉 Task completed!', 'success');
  }

  if (isOnline && !id.startsWith('local_')) {
    try {
      await apiRequest(`${API_BASE}/tasks/${id}/toggle`, { method: 'PATCH' });
    } catch {
      task.completed = prev;
      saveLocal(tasks);
      render();
      showToast('Sync failed', 'error');
    }
  }
}

async function deleteTask(id) {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.classList.add('removing');
    await new Promise(r => setTimeout(r, 300));
  }

  tasks = tasks.filter(t => t.id !== id);
  saveLocal(tasks);
  render();
  showToast('Task deleted', 'default');

  if (isOnline && !id.startsWith('local_')) {
    try {
      await apiRequest(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    } catch {}
  }
}

async function saveEdit() {
  const id = document.getElementById('editTaskId').value;
  const title = document.getElementById('editTitle').value.trim();
  if (!title) { showToast('Title cannot be empty', 'error'); return; }

  const tags = document.getElementById('editTags').value
    .split(',').map(t => t.trim()).filter(Boolean);

  const dueDateVal = document.getElementById('editDueDate').value || null;
  const dueTimeVal = document.getElementById('editDueTime').value || null;

  let completionTime = null;
  if (dueDateVal && dueTimeVal) {
    completionTime = `${dueDateVal}T${dueTimeVal}`;
  } else if (dueTimeVal) {
    completionTime = dueTimeVal;
  }

  const updates = {
    title,
    description: document.getElementById('editDesc').value.trim(),
    priority: document.getElementById('editPriority').value,
    dueDate: dueDateVal,
    completionTime,
    tags
  };

  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    saveLocal(tasks);
    render();
    closeEditModal();
    showToast('✓ Task updated', 'success');

    if (isOnline && !id.startsWith('local_')) {
      try {
        await apiRequest(`${API_BASE}/tasks/${id}`, {
          method: 'PUT', body: JSON.stringify(updates)
        });
      } catch {}
    }
  }
}

async function clearCompleted() {
  const count = tasks.filter(t => t.completed).length;
  if (!count) return;
  tasks = tasks.filter(t => !t.completed);
  saveLocal(tasks);
  render();
  showToast(`Cleared ${count} completed task${count > 1 ? 's' : ''}`, 'default');

  if (isOnline) {
    try {
      await apiRequest(`${API_BASE}/tasks/completed/clear`, { method: 'DELETE' });
    } catch {}
  }
}

// ========== FILTERS & SORTING ==========

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });
  render();
}

function handleSort() {
  currentSort = document.getElementById('sortSelect').value;
  render();
}

function handleSearch() {
  searchQuery = document.getElementById('searchInput').value.toLowerCase();
  render();
}

function getFilteredTasks() {
  const today = new Date().toISOString().split('T')[0];
  let filtered = [...tasks];

  if (searchQuery) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(searchQuery) ||
      (t.description && t.description.toLowerCase().includes(searchQuery)) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchQuery)))
    );
  }

  switch (currentFilter) {
    case 'active': filtered = filtered.filter(t => !t.completed); break;
    case 'completed': filtered = filtered.filter(t => t.completed); break;
    case 'high': filtered = filtered.filter(t => t.priority === 'high'); break;
    case 'medium': filtered = filtered.filter(t => t.priority === 'medium'); break;
    case 'low': filtered = filtered.filter(t => t.priority === 'low'); break;
    case 'today': filtered = filtered.filter(t => t.dueDate === today); break;
    case 'overdue': filtered = filtered.filter(t => !t.completed && t.dueDate && t.dueDate < today); break;
  }

  const [field, dir] = currentSort.split('-');
  const priOrder = { high: 3, medium: 2, low: 1 };
  filtered.sort((a, b) => {
    let va = field === 'priority' ? priOrder[a.priority] : (a[field] || '');
    let vb = field === 'priority' ? priOrder[b.priority] : (b[field] || '');
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
}

// ========== COUNTDOWN & DEADLINE ==========

function getCountdown(task) {
  if (!task.dueDate) return null;

  const now = new Date();
  let deadlineStr;

  if (task.completionTime && task.completionTime.includes('T')) {
    deadlineStr = task.completionTime;
  } else {
    deadlineStr = `${task.dueDate}T23:59:59`;
  }

  const deadline = new Date(deadlineStr);
  if (isNaN(deadline)) return null;

  const diffMs = deadline - now;
  const absDiffMs = Math.abs(diffMs);
  const isPast = diffMs < 0;

  const minutes = Math.floor(absDiffMs / 60000);
  const hours = Math.floor(absDiffMs / 3600000);
  const days = Math.floor(absDiffMs / 86400000);

  let label;
  if (days >= 2) label = `${days} days`;
  else if (hours >= 1) {
    const remMins = minutes % 60;
    label = remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
  } else if (minutes >= 1) {
    label = `${minutes}m`;
  } else {
    label = 'now';
  }

  return isPast ? `overdue by ${label}` : `in ${label}`;
}

function updateDeadlineBanner() {
  const banner = document.getElementById('deadlineBanner');
  const bannerText = document.getElementById('deadlineBannerText');
  if (!banner || !bannerText) return;

  const now = new Date();
  const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const upcomingTasks = tasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    let deadlineStr = t.completionTime && t.completionTime.includes('T')
      ? t.completionTime
      : `${t.dueDate}T23:59:59`;
    const deadline = new Date(deadlineStr);
    return !isNaN(deadline) && deadline <= soon;
  });

  if (upcomingTasks.length === 0) {
    banner.style.display = 'none';
    return;
  }

  banner.style.display = 'flex';
  if (upcomingTasks.length === 1) {
    const t = upcomingTasks[0];
    const countdown = getCountdown(t);
    bannerText.textContent = `"${t.title}" is due ${countdown}`;
  } else {
    bannerText.textContent = `${upcomingTasks.length} tasks due within 24 hours`;
  }
}

// ========== RENDER ==========

function render() {
  const filtered = getFilteredTasks();
  const list = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  const today = new Date().toISOString().split('T')[0];

  const total = tasks.length;
  const active = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;
  const high = tasks.filter(t => t.priority === 'high' && !t.completed).length;

  // Animate stat numbers
  animateNumber('statTotal', total);
  animateNumber('statActive', active);
  animateNumber('statCompleted', completed);
  animateNumber('statHigh', high);

  // Progress ring
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (pct / 100) * circumference;
  const ring = document.getElementById('progressRing');
  if (ring) {
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
  }

  const percentEl = document.getElementById('progressPercent');
  if (percentEl) percentEl.textContent = `${pct}%`;

  const progressLabel = document.getElementById('progressLabel');
  const progressSub = document.getElementById('progressSub');

  if (pct === 100 && total > 0) {
    if (progressLabel) progressLabel.textContent = 'All done! 🎉';
    if (progressSub) progressSub.textContent = 'Amazing work today!';
  } else if (pct >= 75) {
    if (progressLabel) progressLabel.textContent = 'Almost there! 🔥';
    if (progressSub) progressSub.textContent = `${active} task${active !== 1 ? 's' : ''} remaining`;
  } else if (pct >= 50) {
    if (progressLabel) progressLabel.textContent = 'Halfway there!';
    if (progressSub) progressSub.textContent = `${active} task${active !== 1 ? 's' : ''} remaining`;
  } else if (pct > 0) {
    if (progressLabel) progressLabel.textContent = 'Keep going! 💪';
    if (progressSub) progressSub.textContent = `${active} task${active !== 1 ? 's' : ''} to complete`;
  } else {
    if (progressLabel) progressLabel.textContent = total > 0 ? 'Ready to start?' : 'No tasks yet';
    if (progressSub) progressSub.textContent = total > 0 ? `${active} task${active !== 1 ? 's' : ''} to complete` : 'Add your first task!';
  }

  // Clear completed button
  const clearBtn = document.getElementById('clearCompletedBtn');
  if (clearBtn) {
    clearBtn.classList.toggle('visible', completed > 0 && (currentFilter === 'all' || currentFilter === 'completed'));
  }

  // Deadline banner
  updateDeadlineBanner();

  // Empty state
  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.classList.add('visible');
    const emptyTitle = document.getElementById('emptyTitle');
    const emptySub = document.getElementById('emptySub');

    if (total === 0) {
      if (emptyTitle) emptyTitle.textContent = 'No tasks yet';
      if (emptySub) emptySub.textContent = 'Add your first task above!';
    } else if (searchQuery) {
      if (emptyTitle) emptyTitle.textContent = 'No results found';
      if (emptySub) emptySub.textContent = `No tasks match "${searchQuery}"`;
    } else {
      if (emptyTitle) emptyTitle.textContent = 'Nothing here';
      if (emptySub) emptySub.textContent = 'Try a different filter.';
    }
    return;
  }

  empty.classList.remove('visible');

  // Build task cards
  list.innerHTML = filtered.map((task, i) => {
    const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
    const isToday = task.dueDate === today;
    const countdown = !task.completed ? getCountdown(task) : null;

    let dueBadge = '';
    if (task.dueDate) {
      const dueCls = isOverdue ? 'overdue' : isToday ? 'today' : '';
      let dueLabel = isOverdue
        ? `Overdue · ${formatDate(task.dueDate)}`
        : isToday ? 'Today' : formatDate(task.dueDate);

      if (task.completionTime && task.completionTime.includes('T')) {
        const timePart = task.completionTime.split('T')[1].substring(0, 5);
        dueLabel += ` · ${formatTime(timePart)}`;
      }

      dueBadge = `
        <span class="due-badge ${dueCls}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          ${dueLabel}
        </span>`;
    }

    let countdownBadge = '';
    if (countdown && task.dueDate) {
      const cls = countdown.startsWith('overdue') ? 'countdown-overdue' : 'countdown-upcoming';
      countdownBadge = `<span class="countdown-badge ${cls}">${countdown}</span>`;
    }

    const tagBadges = (task.tags || []).map(t => `<span class="tag-badge">#${escapeHtml(t)}</span>`).join('');

    return `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}" data-priority="${task.priority}" style="animation-delay: ${i * 0.04}s" role="listitem">
        <div class="task-check ${task.completed ? 'checked' : ''}" onclick="toggleTask('${task.id}')" role="checkbox" aria-checked="${task.completed}" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleTask('${task.id}')}" aria-label="Toggle task completion"></div>
        <div class="task-content">
          <div class="task-title">${escapeHtml(task.title)}</div>
          ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
          <div class="task-meta">
            <span class="priority-badge ${task.priority}">${task.priority}</span>
            ${dueBadge}
            ${countdownBadge}
            ${tagBadges}
          </div>
        </div>
        <div class="task-actions">
          <button class="task-action-btn" onclick="openEditModal('${task.id}')" title="Edit" aria-label="Edit task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="task-action-btn delete" onclick="deleteTask('${task.id}')" title="Delete" aria-label="Delete task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>
      </div>`;
  }).join('');
}

// ========== ANIMATED NUMBERS ==========

function animateNumber(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;

  const diff = target - current;
  const steps = Math.min(Math.abs(diff), 15);
  const stepValue = diff / steps;
  let step = 0;

  function tick() {
    step++;
    if (step >= steps) {
      el.textContent = target;
      return;
    }
    el.textContent = Math.round(current + stepValue * step);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// ========== MODAL ==========

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById('editTaskId').value = id;
  document.getElementById('editTitle').value = task.title;
  document.getElementById('editDesc').value = task.description || '';
  document.getElementById('editPriority').value = task.priority || 'medium';
  document.getElementById('editDueDate').value = task.dueDate || '';

  const editDueTime = document.getElementById('editDueTime');
  if (task.completionTime && task.completionTime.includes('T')) {
    editDueTime.value = task.completionTime.split('T')[1].substring(0, 5);
  } else {
    editDueTime.value = '';
  }

  document.getElementById('editTags').value = (task.tags || []).join(', ');
  document.getElementById('editOverlay').classList.add('visible');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('editTitle').focus(), 150);
}

function closeEditModal() {
  document.getElementById('editOverlay').classList.remove('visible');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('editOverlay')) closeEditModal();
}

// ========== UI HELPERS ==========

function toggleExtras() {
  extrasVisible = !extrasVisible;
  document.getElementById('addExtras').classList.toggle('visible', extrasVisible);
  const toggle = document.getElementById('expandToggle');
  toggle.classList.toggle('expanded', extrasVisible);
  toggle.querySelector('span').textContent = extrasVisible ? 'Fewer options' : 'More options';
}

function clearAddForm() {
  document.getElementById('addInput').value = '';
  document.getElementById('addDesc').value = '';
  document.getElementById('addPriority').value = 'medium';
  setDefaultDueDate();
  document.getElementById('addDueTime').value = '';
  document.getElementById('addTags').value = '';
}

// ========== THEME ==========

function toggleTheme() {
  const body = document.body;
  const isDark = body.dataset.theme === 'dark';
  body.dataset.theme = isDark ? 'light' : 'dark';
  localStorage.setItem('dotask_theme', body.dataset.theme);

  const icon = document.getElementById('themeIcon');
  icon.innerHTML = isDark
    ? `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`
    : `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
}

function setThemeFromStorage() {
  const saved = localStorage.getItem('dotask_theme') || 'dark';
  document.body.dataset.theme = saved;
  if (saved === 'light') {
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.innerHTML = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
    }
  }
}

// ========== TOAST NOTIFICATIONS ==========

function showToast(msg, type = 'default') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

// ========== FORMATTERS ==========

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ========== KEYBOARD SHORTCUTS ==========

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeEditModal();
  // Ctrl+K or Cmd+K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.focus();
  }
  // Ctrl+N or Cmd+N to focus add input
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    const addInput = document.getElementById('addInput');
    if (addInput) addInput.focus();
  }
});

// Add shake animation dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);