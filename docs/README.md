# Beaver Task Manager

A comprehensive task, project, and habit management platform with integrated Pomodoro timer functionality and organization support.

## 🌟 Overview

Beaver Task Manager is your all-in-one productivity solution that combines organization management, project tracking, task management, habit building, and note-taking capabilities. With an integrated Pomodoro timer that connects to your tasks, it helps you stay focused and productive while managing your work and personal goals.

## ✨ Currently Implemented Features

- **🏢 Organization Management**: Create and manage organizations with color themes
- **📁 Project Management**: Organize projects under organizations with status tracking
- **📋 Task Management**: Full CRUD operations for tasks with priority and status management
- **🎯 Habit Tracking**: Daily habit tracking with streak counters and progress visualization
- **📝 Note Management**: Rich note-taking with tagging and search functionality
- **⏱️ Enhanced Pomodoro Timer**: Task-integrated sessions with automatic break management
- **📊 Dashboard Analytics**: Real-time statistics and progress tracking
- **🎨 Responsive UI**: Clean, modern interface that works on all devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser

### Installation & Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up the database**:
```bash
npx prisma generate
npx prisma db push
```

3. **Start the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to [http://localhost:3001](http://localhost:3001)

## 🎯 Quick Usage Guide

### First Steps
1. **Create an Organization** - Start by setting up an organization for your work or personal projects
2. **Add Projects** - Create projects within your organization with due dates and status
3. **Create Tasks** - Add tasks to projects with priorities and due dates
4. **Start a Pomodoro Session** - Select a task and begin a focused work session
5. **Track Habits** - Set up daily habits and track your progress
6. **Take Notes** - Capture ideas and link them to projects

### Key Workflows
- **Project → Tasks → Pomodoro**: Create a project, add tasks, then use Pomodoro sessions to work on specific tasks
- **Daily Review**: Check the dashboard for today's focus, complete habits, and review progress
- **Weekly Planning**: Use the dashboard statistics to plan upcoming work and adjust goals

## 📚 Documentation

- [Features Documentation](./FEATURES.md) - Detailed feature list and current capabilities
- [Project Planning](./PLANNING.md) - Technical architecture and development roadmap

## 🛠️ Technical Stack

- **Frontend**: Next.js 14 with TypeScript and App Router
- **Styling**: Tailwind CSS with Radix UI components
- **Database**: SQLite with Prisma ORM
- **State Management**: Zustand and React hooks
- **Form Handling**: React Hook Form with validation
- **Icons**: Lucide React icon library

## 🔄 Current Status

**✅ Fully Functional**: All core features are implemented and working
**🎯 Production Ready**: The application is ready for immediate use
**📱 Responsive**: Works perfectly on desktop, tablet, and mobile devices
**🗄️ Data Persistent**: All data is saved locally using SQLite database

## 🤝 Contributing

This project is actively maintained and contributions are welcome! The codebase is well-structured and easy to extend. Feel free to:
- Add new features or improvements
- Fix bugs or optimize performance
- Enhance the UI/UX design
- Add authentication and multi-user support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 