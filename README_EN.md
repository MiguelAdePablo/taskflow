# ![](./Images/GitHub.png) &nbsp;&nbsp;  🚀 *TaskFlow - Collaborative Task Management*

**TaskFlow** is a modern web application for collaborative project and task management in real time. Designed for teams that need to coordinate work efficiently, with an intuitive interface and instant communication features.

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Technical Requirements](#-technical-requirements)
- [Application Usage](#-application-usage)
- [Project Structure](#-project-structure)
- [Technologies Used](#-technologies-used)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Key Features

### Project Management
- 📁 Create, edit, and delete projects
- 👥 Member management with roles (Owner, Admin, Member)
- 📊 Real-time statistics
- 🔍 Advanced search and filtering

### Task Management
- ✅ Create, update, and delete tasks
- 🎯 Task assignment to team members
- 🏷️ Priority system (Low, Medium, High)
- 📅 Deadlines with visual reminders
- 🔄 Real-time status changes (Pending, In Progress, Completed)

### Real-Time Communication
- 💬 Task comment system
- 🔔 Instant notifications via WebSockets
- 👁️ Live updates without page reloads
- 📢 Automatic synchronization among all members

### Security and Authentication
- 🔐 JWT (JSON Web Tokens) authentication
- 🛡️ Private route protection
- 👤 User profile management
- 🌙 Dark/light mode with persistence

### User Experience
- 📱 100% responsive design (mobile, tablet, desktop)
- 🎨 Modern interface with CSS Variables
- ⚡ Fast loading with Vite
- 🔄 Smooth transitions and animations

## 📸 Screenshots

### Main Dashboard
![Dashboard](./Images/dashboard.png)
*Overview of all your projects with real-time statistics*

### Project Detail
![Project Detail](./Images/project-detail.png)
*Member and task management with advanced filters*

### Task Detail
![Task Detail](./Images/task-detail.png)
*Complete task view with comments and live updates*

### Dark Mode
![Dark Mode](./Images/dark-mode.png)
*Interface optimized for nighttime work*

## 🔧 Technical Requirements

### Backend
- **Python**: 3.10 or higher
- **Database**: SQLite (development) / PostgreSQL (production)
- **Port**: 5000

### Frontend
- **Node.js**: 18 or higher
- **npm**: 9 or higher
- **Port**: 5173 (Vite dev server)

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 📖 Application Usage

### 1. User Registration

1. Access the web application
2. Click "Sign up here"
3. Fill in the form with:
   - Username (unique)
   - Email (unique)
   - Password (minimum 6 characters)
   - Full name (optional)
4. You will be automatically redirected to the Dashboard

### 2. Creating Your First Project

1. On the Dashboard, click "➕ New Project"
2. Enter the project name (required)
3. Add a description (optional)
4. Click "✨ Create Project"
5. You will be redirected to the project detail page

### 3. Inviting Members

1. On the project page, click "+ Add" in the Members section
2. Search for users by username, email, or full name
3. Click "+ Add" next to the desired user
4. The user will receive a real-time notification

### 4. Creating Tasks

1. On the project page, click "+ New Task"
2. Fill in the fields:
   - Title (required)
   - Description (optional)
   - Priority (Low, Medium, High)
   - Deadline (optional)
   - Assign to (optional)
3. Click "✨ Create Task"
4. The task will appear instantly for all members

### 5. Managing Tasks

- **Change status**: Use the status selector on the detail page
- **Add comments**: Write in the comment form at the bottom of the task
- **Edit task**: Click the ✏️ icon in the task list
- **Delete task**: Click "🗑️ Delete" on the detail page

### 6. Notifications

- The 🔔 bell in the header shows real-time notifications
- Click a notification to navigate to the related task/project
- Notifications are automatically marked as read when opened

## 🗂️ Project Structure
    taskflow/
    ├── backend/
    │   ├── app/
    │   │   ├── init.py              # Flask initialization
    │   │   ├── config.py            # Environment configuration
    │   │   ├── models.py            # SQLAlchemy models
    │   │   ├── socket_handlers.py   # WebSocket events
    │   │   └── routes/              # API endpoints
    │   │       ├── auth.py          # Authentication
    │   │       ├── projects.py      # Project management
    │   │       ├── tasks.py         # Task management
    │   │       ├── users.py         # User management
    │   │       └── comments.py      # Comment management
    │   ├── migrations/              # Database migrations
    │   └── requirements.txt         # Python dependencies
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── components/          # Reusable React components
    │   │   ├── context/             # Context API (Auth, Socket, Theme)
    │   │   ├── hooks/               # Custom hooks
    │   │   ├── pages/               # Main pages
    │   │   ├── services/            # API calls
    │   │   └── styles/              # CSS and themes
    │   ├── public/                  # Static assets
    │   └── package.json             # Node.js dependencies
    │
    └── README.md                    # This file


## 🛠️ Technologies Used

### Backend
- **Flask**: Lightweight and flexible web framework
- **Flask-SQLAlchemy**: Database ORM
- **Flask-Migrate**: Database migrations
- **Flask-JWT-Extended**: JWT authentication
- **Flask-SocketIO**: WebSockets for real-time communication
- **Flask-CORS**: Cross-Origin Resource Sharing handling
- **SQLite/PostgreSQL**: Database

### Frontend
- **React 18**: User interface library
- **Vite**: Ultra-fast build tool
- **React Router**: SPA routing
- **Context API**: Global state management
- **Socket.io-client**: WebSocket client
- **Axios**: HTTP client
- **CSS Variables**: Dynamic theming system

### Development Tools
- **ESLint**: JavaScript linter
- **Prettier**: Code formatter
- **Git**: Version control

## 🤝 Contributing

Contributions are welcome. To contribute:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contributing Guidelines

- Follow the existing code style
- Add comments following the `// PURPOSE` / `// CRITICAL` standard
- Write tests for new features
- Update documentation if necessary

## 📄 License

This project is under the MIT License. See the `LICENSE` file for more details.

## 📞 Support

If you have questions or need help:

- 🐛 Issues: [GitHub Issues](https://github.com/MiguelAdePablo/taskflow/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/MiguelAdePablo/taskflow/discussions)

## 🙏 Acknowledgments

- [Flask](https://flask.palletsprojects.com/) - Backend framework
- [React](https://reactjs.org/) - Frontend library
- [Socket.io](https://socket.io/) - WebSockets
- [Vite](https://vitejs.dev/) - Build tool
- [Render](https://render.com/) - Backend hosting
- [Vercel](https://vercel.com/) - Frontend hosting

---