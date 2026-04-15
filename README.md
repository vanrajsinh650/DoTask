# DoTask — Smart Task Manager

A beautiful, professional Smart Task Manager (To-Do Web Application) built with **pure HTML, CSS, and JavaScript** — no frameworks or libraries. Features a stunning glassmorphism UI with dark/light theme, fully responsive design that works flawlessly on every device from 320px phones to 4K monitors.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)

---

## ✨ Features

### Core Features
- **Add, Edit, Delete Tasks** — Full CRUD operations with smooth animations
- **Mark as Completed** — Toggle completion with animated checkboxes
- **Persistent Storage** — Dual storage: Node.js backend (JSON file) + LocalStorage fallback
- **Offline Support** — Works seamlessly offline with automatic local storage

### Bonus Features
- 🎨 **Dark/Light Theme** — Stunning glassmorphism design with ambient background animations
- 🔴 **Task Priority** — High, Medium, Low priority levels with color-coded badges
- 📅 **Due Dates & Times** — Set deadlines with real-time countdown timers
- 🏷️ **Tags** — Organize tasks with custom tags
- 🔍 **Real-time Search** — Instant search across titles, descriptions, and tags
- 📊 **Filters** — Filter by status (All/Active/Completed), priority, today's tasks, and overdue
- 📈 **Progress Tracking** — Animated progress ring with completion percentage
- 📉 **Statistics Dashboard** — Live stats for total, active, completed, and urgent tasks
- ⏰ **Deadline Alerts** — Banner notifications for tasks due within 24 hours
- 🔤 **Sorting** — Sort by date, priority, or alphabetically
- 💬 **Motivational Quotes** — Random inspirational quotes
- ⌨️ **Keyboard Shortcuts** — `Ctrl+K` search, `Ctrl+N` new task, `Escape` close modal

### Responsive Design
- ✅ **Mobile Phones** (320px+)
- ✅ **Tablets** (768px+)
- ✅ **Laptops & Desktops** (1024px+)
- ✅ **4K Monitors** (1600px+)
- ✅ **Landscape Mode**
- ✅ **Touch Devices** (iOS, Android)
- ✅ **Print Styles**
- ✅ **Reduced Motion** (accessibility)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js + Express.js |
| **Storage** | JSON file (server) + LocalStorage (client) |
| **Fonts** | Inter (Google Fonts) |

**No frameworks or UI libraries used.** Pure HTML, CSS, and JavaScript only.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v14 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vanrajsinh650/DoTask.git
   cd DoTask
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Development Mode
```bash
npm run dev
```
Uses `nodemon` for auto-restart on file changes.

---

## 📁 Project Structure

```
DoTask/
├── public/
│   ├── index.html              # Main HTML file
│   ├── css/
│   │   └── style.css           # All styles (glassmorphism, responsive)
│   └── components/
│       └── js/
│           └── app.js          # Application logic (vanilla JS)
├── data/
│   └── tasks.json              # Persistent task storage (auto-created)
├── server.js                   # Express.js API server
├── package.json
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | Get all tasks (with filters & sorting) |
| `GET` | `/api/tasks/:id` | Get single task |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `PATCH` | `/api/tasks/:id/toggle` | Toggle task completion |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `DELETE` | `/api/tasks/completed/clear` | Clear all completed tasks |
| `GET` | `/api/stats` | Get task statistics |
| `GET` | `/api/health` | Health check |

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).