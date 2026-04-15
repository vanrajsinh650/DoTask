const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

function readTasks() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeTasks(tasks) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(tasks, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const validateTask = (task) => {
  const errors = [];
  if (!task.title || task.title.trim() === '') {
    errors.push('Title is required');
  }
  if (task.title && task.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
    errors.push('Priority must be low, medium, or high');
  }
  return errors;
};

app.get('/api/tasks', (req, res) => {
  try {
    let tasks = readTasks();

    if (req.query.status === 'active') {
      tasks = tasks.filter(t => !t.completed);
    } else if (req.query.status === 'completed') {
      tasks = tasks.filter(t => t.completed);
    }

    if (req.query.priority && ['low', 'medium', 'high'].includes(req.query.priority)) {
      tasks = tasks.filter(t => t.priority === req.query.priority);
    }

    if (req.query.tag) {
      tasks = tasks.filter(t => t.tags && t.tags.includes(req.query.tag));
    }

    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    tasks.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (sortBy === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        va = order[a.priority] || 0;
        vb = order[b.priority] || 0;
      }
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const all = readTasks();
    const stats = {
      total: all.length,
      active: all.filter(t => !t.completed).length,
      completed: all.filter(t => t.completed).length,
      highPriority: all.filter(t => t.priority === 'high' && !t.completed).length
    };

    res.json({ success: true, data: tasks, stats, count: tasks.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.get('/api/tasks/:id', (req, res) => {
  try {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const errors = validateTask(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const newTask = {
      id: uuidv4(),
      title: req.body.title.trim(),
      description: req.body.description?.trim() || '',
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate || null,
      completionTime: req.body.completionTime || null,
      completed: false,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const tasks = readTasks();
    tasks.unshift(newTask);
    writeTasks(tasks);

    res.status(201).json({ success: true, message: 'Task created', data: newTask });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  try {
    const tasks = readTasks();
    const idx = tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Task not found' });

    const merged = { ...tasks[idx], ...req.body };
    const errors = validateTask(merged);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const updatedTask = {
      ...tasks[idx],
      ...req.body,
      id: tasks[idx].id,
      createdAt: tasks[idx].createdAt,
      updatedAt: new Date().toISOString()
    };
    if (req.body.title) updatedTask.title = req.body.title.trim();
    if (req.body.description !== undefined) updatedTask.description = req.body.description.trim();

    tasks[idx] = updatedTask;
    writeTasks(tasks);

    res.json({ success: true, message: 'Task updated', data: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.patch('/api/tasks/:id/toggle', (req, res) => {
  try {
    const tasks = readTasks();
    const idx = tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Task not found' });

    tasks[idx].completed = !tasks[idx].completed;
    tasks[idx].updatedAt = new Date().toISOString();
    writeTasks(tasks);

    res.json({
      success: true,
      message: `Task marked as ${tasks[idx].completed ? 'completed' : 'active'}`,
      data: tasks[idx]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.delete('/api/tasks/completed/clear', (req, res) => {
  try {
    const tasks = readTasks();
    const before = tasks.length;
    const remaining = tasks.filter(t => !t.completed);
    writeTasks(remaining);
    res.json({ success: true, message: `Cleared ${before - remaining.length} completed tasks`, cleared: before - remaining.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const tasks = readTasks();
    const idx = tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Task not found' });

    const [deleted] = tasks.splice(idx, 1);
    writeTasks(tasks);

    res.json({ success: true, message: 'Task deleted', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const tasks = readTasks();
    const today = new Date().toISOString().split('T')[0];
    res.json({
      success: true,
      data: {
        total: tasks.length,
        active: tasks.filter(t => !t.completed).length,
        completed: tasks.filter(t => t.completed).length,
        highPriority: tasks.filter(t => t.priority === 'high').length,
        dueTodayActive: tasks.filter(t => !t.completed && t.dueDate === today).length,
        overdue: tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length,
        completionRate: tasks.length > 0
          ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'DoTask API is running', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n Smart Task Manager running at http://localhost:${PORT}`);
  console.log(` API available at http://localhost:${PORT}/api/tasks`);
  console.log(`Data stored at: ${DATA_FILE}`);
  console.log(`Health check at http://localhost:${PORT}/api/health\n`);
});

module.exports = app;