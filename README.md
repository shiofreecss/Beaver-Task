# 🦫 Beaver Task Manager

A comprehensive project management application with tasks, notes, habit tracking, and Pomodoro timer functionality. Built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## 🚀 Features

### ✅ **Project Management**
- Create and manage projects with progress tracking
- Visual progress bars and status indicators
- Due date tracking and color-coded organization
- Project-specific task and note organization

### 📋 **Task Management**
- Create, update, and complete tasks
- Priority levels (High, Medium, Low) with visual indicators
- Task status tracking (Todo, In Progress, Completed)
- Link tasks to specific projects
- Interactive checkboxes for quick task completion

### 📝 **Note Taking**
- Rich text notes with tagging system
- Project-linked notes for better organization
- Search functionality across all notes
- Color-coded tags for easy categorization
- Clean, card-based layout for easy browsing

### 🎯 **Habit Tracking**
- Daily habit tracking with streak counters
- Visual progress indicators and completion tracking
- Weekly progress visualization
- Customizable habit goals and frequencies
- Interactive completion checkboxes

### ⏱️ **Pomodoro Timer**
- 25-minute focus sessions with breaks
- Automatic session switching (Focus → Short Break → Long Break)
- Visual circular progress indicator
- Session history and statistics
- Customizable session types and durations
- Daily and weekly productivity tracking

### 📊 **Dashboard Overview**
- Quick stats and metrics across all features
- Recent activity feed
- Today's focus section with quick actions
- Progress summaries and completion rates

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript
- **Styling**: Tailwind CSS + Shadcn UI components
- **Database**: SQLite with Prisma ORM
- **State Management**: React hooks and local state
- **Icons**: Lucide React
- **Development**: Hot reload, TypeScript checking

## 🏁 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd beaver-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### Getting Started
1. **Dashboard**: Start on the main dashboard to get an overview of your productivity
2. **Create a Project**: Click "New Project" to create your first project
3. **Add Tasks**: Navigate to Tasks and create tasks linked to your projects
4. **Take Notes**: Use the Notes section to capture ideas and meeting notes
5. **Track Habits**: Set up daily habits you want to build
6. **Use Pomodoro**: Start focused work sessions with the built-in timer

### Key Features

#### Projects
- Click "New Project" to create a project
- Set due dates and track progress
- Color-code projects for easy identification
- View all project tasks and notes in one place

#### Tasks
- Create tasks with descriptions and due dates
- Set priority levels (High/Medium/Low)
- Check off completed tasks
- Filter tasks by project or status

#### Notes
- Write detailed notes with rich text
- Tag notes for easy organization and search
- Link notes to specific projects
- Use the search bar to find notes quickly

#### Habits
- Set up daily habits with descriptions
- Track completion with simple checkboxes
- View streak counters and weekly progress
- See completion percentages

#### Pomodoro Timer
- Click "Start" to begin a 25-minute focus session
- Timer automatically switches between work and break periods
- Track daily and weekly session statistics
- Customize session lengths in settings

## 📱 Features Overview

### Navigation
- **Sidebar Navigation**: Easy switching between different sections
- **Quick Actions**: Fast access to create new items
- **Responsive Design**: Works on desktop, tablet, and mobile

### Visual Design
- **Clean Interface**: Minimalist design focused on productivity
- **Color Coding**: Visual indicators for priorities, status, and progress
- **Interactive Elements**: Hover effects and smooth transitions
- **Card-based Layout**: Organized information in digestible chunks

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Prisma Studio

### Database Management
- **Prisma Studio**: Run `npm run db:studio` to open the database GUI
- **Schema Changes**: Modify `prisma/schema.prisma` and run `npm run db:push`
- **Database Reset**: Delete `prisma/dev.db` and run `npm run db:push`

## 📋 Roadmap

### Immediate Features (Ready to Use)
- ✅ Project management with progress tracking
- ✅ Task creation and completion
- ✅ Note taking with tags and search
- ✅ Habit tracking with streaks
- ✅ Pomodoro timer with session management
- ✅ Responsive dashboard with statistics

### Future Enhancements
- [ ] User authentication and multi-user support
- [ ] Data persistence with real database integration
- [ ] Export/import functionality
- [ ] Advanced analytics and reporting
- [ ] Team collaboration features
- [ ] Mobile app version
- [ ] Calendar integration
- [ ] Notification system

## 🤝 Contributing

This is a fully functional productivity application that you can use immediately! Feel free to:
- Add new features
- Improve the UI/UX
- Fix bugs or optimize performance
- Add data persistence layers
- Integrate with external services

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Ready to boost your productivity? Start the app and begin organizing your projects, tasks, and habits today!** 🚀 