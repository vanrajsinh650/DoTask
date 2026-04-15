# ⚡ DoTask — Smart Task Manager

A beautiful, production-ready Smart Task Manager built with **pure HTML, CSS, and JavaScript** — no frameworks. Features a stunning glassmorphism UI with dark/light themes, a two-column dashboard layout, offline support, and fully responsive design from 320px phones to 4K monitors.

[![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 What is DoTask?

DoTask is a full-featured task management web app that lets you:
- **Create, edit, and delete tasks** with titles, descriptions, priorities, due dates, times, and tags
- **Track your progress** with a live dashboard showing stats, completion percentage, and deadline alerts
- **Work offline** — the app automatically falls back to browser storage when the server is unreachable
- **Switch themes** between a dark glassmorphism UI and a clean light mode

It's built entirely without frontend frameworks — just vanilla HTML/CSS/JS — making it a great reference project for learning or a solid starting point for your own task manager.

---

## ✨ Features

### Core
| Feature | Description |
|---------|-------------|
| ✅ Full CRUD | Add, edit, delete tasks with smooth animations |
| ✅ Completion toggle | Animated checkboxes to mark tasks done |
| ✅ Persistent storage | Node.js backend saves to JSON file on disk |
| ✅ Offline fallback | LocalStorage keeps your data when the server is down |
| ✅ Real-time sync | Status badge shows Live / Syncing / Offline |

### Smart Features
| Feature | Description |
|---------|-------------|
| 🎨 Dark/Light theme | Toggle with one click, preference saved locally |
| 🔴 Priority levels | High / Medium / Low with color-coded badges and side stripes |
| 📅 Due dates & times | Set deadlines with real-time countdown (e.g. "in 2h 15m") |
| 🏷️ Tags | Organize tasks with comma-separated tags |
| 🔍 Instant search | Search across titles, descriptions, and tags |
| 📊 Filters | All · Active · Completed · High · Medium · Low · Today · Overdue |
| 📈 Progress ring | Animated SVG ring showing completion percentage |
| 📉 Stats dashboard | Live cards for Total, Active, Done, and Urgent counts |
| ⏰ Deadline alerts | Banner notification for tasks due within 24 hours |
| 🔤 Sorting | By date, priority, or alphabetically |
| 💬 Quotes | Random motivational quote on each page load |
| ⌨️ Keyboard shortcuts | `Ctrl+N` new task, `Ctrl+K` search, `Esc` close modal |

### Responsive Design
Works on **every device and screen size**:

| Breakpoint | Behaviour |
|------------|-----------|
| **≥ 960px** | Two-column layout (sidebar + main content) |
| **768–960px** | Single column, sidebar stacks above content |
| **480–768px** | Compact spacing, 2×2 stat grid |
| **≤ 480px** | Mobile-optimized, always-visible action buttons |
| **≤ 360px** | Extra-compact for small phones |
| **≥ 1600px** | Wider layout optimized for large/4K monitors |
| **Landscape** | Reduced padding for short viewports |
| **Touch devices** | Larger tap targets, no hover-dependent UI |
| **Print** | Clean printable version, hides interactive elements |
| **Reduced motion** | Respects `prefers-reduced-motion` accessibility setting |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JS | UI, logic, no frameworks |
| **Backend** | Node.js + Express.js | REST API server |
| **Storage** | JSON file (server-side) | Persistent task data |
| **Fallback** | LocalStorage (client-side) | Offline data persistence |
| **Fonts** | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts | Modern typography |
| **IDs** | [uuid](https://www.npmjs.com/package/uuid) | Unique task identifiers |

> **No React, Vue, Angular, Tailwind, or any frontend framework.** Everything is hand-written.

---

## 🚀 Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/)** v14.0.0 or higher (check with `node --version`)
- **npm** (comes with Node.js)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/vanrajsinh650/DoTask.git
cd DoTask

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open in your browser
#    → http://localhost:3000
```

That's it! The app will create a `data/tasks.json` file automatically on first run.

### Development Mode (auto-restart on changes)

```bash
npm run dev
```

This uses [nodemon](https://nodemon.io/) to watch for file changes and auto-restart the server. Great for development.

### Changing the Port

By default the server runs on port **3000**. To change it:

```bash
# Windows (PowerShell)
$env:PORT=4000; npm start

# macOS / Linux
PORT=4000 npm start
```

---

## 📁 Project Structure

```
DoTask/
├── public/                        # Static frontend files (served by Express)
│   ├── index.html                 # Main HTML — header, sidebar, task list, edit modal
│   ├── css/
│   │   └── style.css              # Complete design system (1500+ lines)
│   │                              #   • CSS variables for theming
│   │                              #   • Glassmorphism & ambient blobs
│   │                              #   • Two-column responsive grid
│   │                              #   • All component styles
│   │                              #   • 7 responsive breakpoints
│   └── components/
│       └── js/
│           └── app.js             # All application logic (780+ lines)
│                                  #   • API communication
│                                  #   • CRUD operations
│                                  #   • Filtering, sorting, search
│                                  #   • Theme toggle
│                                  #   • Countdown timers
│                                  #   • Toast notifications
├── data/
│   └── tasks.json                 # Task data (auto-created, gitignored)
├── server.js                      # Express.js REST API server
│                                  #   • CRUD endpoints for tasks
│                                  #   • Input validation
│                                  #   • Atomic file writes
│                                  #   • Static file serving
├── package.json                   # Dependencies & scripts
├── .gitignore
└── README.md
```

---

## 🌐 API Reference

All endpoints return JSON with `{ success: boolean, data: ..., message: ... }`.

### Tasks

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/api/tasks` | List all tasks | — |
| `GET` | `/api/tasks/:id` | Get one task | — |
| `POST` | `/api/tasks` | Create a task | `{ title, description?, priority?, dueDate?, completionTime?, tags? }` |
| `PUT` | `/api/tasks/:id` | Update a task | Same fields as POST |
| `PATCH` | `/api/tasks/:id/toggle` | Toggle completion | — |
| `DELETE` | `/api/tasks/:id` | Delete a task | — |
| `DELETE` | `/api/tasks/completed/clear` | Delete all completed | — |

### Query Parameters for `GET /api/tasks`

| Param | Values | Example |
|-------|--------|---------|
| `status` | `active`, `completed` | `?status=active` |
| `priority` | `low`, `medium`, `high` | `?priority=high` |
| `tag` | any string | `?tag=work` |
| `search` | any string | `?search=meeting` |
| `sortBy` | `createdAt`, `priority`, `dueDate`, `title` | `?sortBy=priority` |
| `sortOrder` | `asc`, `desc` | `?sortOrder=asc` |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Task statistics (total, active, completed, overdue, etc.) |
| `GET` | `/api/health` | Server health check |

### Example: Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review pull request",
    "description": "Check the new auth module",
    "priority": "high",
    "dueDate": "2026-04-16",
    "completionTime": "2026-04-16T14:00",
    "tags": ["work", "code-review"]
  }'
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | Focus the "Add task" input |
| `Ctrl + K` | Focus the search bar |
| `Escape` | Close the edit modal |
| `Enter` | Submit task (when add input is focused) |
| `Enter` | Save changes (when edit title is focused) |

---

## 🎨 Theming

The app uses **CSS custom properties** for theming. All colors, shadows, radii, and transitions are defined as variables in `:root` (dark) and `[data-theme="light"]`.

To customize the color scheme, edit the variables at the top of `public/css/style.css`:

```css
:root {
  --accent: #8b5cf6;        /* Primary purple accent */
  --accent-hover: #7c3aed;  /* Darker accent on hover */
  --high: #ef4444;           /* High priority red */
  --medium: #f59e0b;         /* Medium priority amber */
  --low: #3b82f6;            /* Low priority blue */
  --success: #10b981;        /* Success green */
  /* ... more variables */
}
```

---

## 🧩 How It Works

1. **On page load**, the app checks if the backend API is reachable (`/api/health`)
2. **If online**: tasks are fetched from the server and cached in LocalStorage
3. **If offline**: tasks are loaded from LocalStorage directly
4. **Every mutation** (add/edit/delete/toggle) updates both the server and LocalStorage
5. **If a server request fails**, the change is kept locally and the user is notified
6. **The UI re-renders** after every data change — stats, progress ring, filters, and deadline alerts all update automatically

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by [Vanrajsinh](https://github.com/vanrajsinh650)**