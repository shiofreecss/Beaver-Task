# 🦫 Beaver Task Manager v1.0.0

A comprehensive project management application with organizations, projects, tasks, notes, habit tracking, and Pomodoro timer functionality. Built with Next.js 14, TypeScript, Tailwind CSS, and Convex.

**🎉 Version 1.0.0 Released!** - Production-ready with all core features implemented and tested.

## 🚀 Features

### 🏢 **Organization Management**
- Create and manage organizations with color-coded themes
- Organize projects under different organizations
- Track organization-wide progress and statistics
- Hierarchical project structure

### 📁 **Project Management**
- Create and manage projects within organizations
- Visual progress bars and status indicators
- Due date tracking and color-coded organization
- Project-specific task and note organization
- Status tracking (Planning, In Progress, Completed, On Hold)

### 📋 **Task Management**
- Create, update, and complete tasks with full CRUD operations
- Priority levels (High, Medium, Low) with visual indicators
- Task status tracking (Todo, In Progress, Completed)
- Link tasks to specific projects and organizations
- Interactive checkboxes for quick task completion
- Due date tracking and notifications

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

### ⏱️ **Enhanced Pomodoro Timer**
- 25-minute focus sessions with automatic break switching
- Task-integrated sessions - select specific tasks to work on
- Visual circular progress indicator with real-time updates
- Session history and comprehensive statistics
- Toast notifications for session events
- Automatic session cycling (Focus → Short Break → Long Break after 4 sessions)
- Daily and weekly productivity tracking
- Task completion tracking during sessions

### 📊 **Dashboard Overview**
- Quick stats and metrics across all features
- Recent activity feed with real-time updates
- Today's focus section with quick actions
- Progress summaries and completion rates
- Organization and project overviews

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **Database**: Convex for real-time data sync
- **State Management**: Zustand + React hooks
- **Form Handling**: React Hook Form with validation
- **Icons**: Lucide React
- **UI Components**: Custom components with Radix UI primitives
- **Development**: Hot reload, TypeScript checking, ESLint

## 🏁 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Convex account for database

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

3. **Set up Convex**
   ```bash
   npx convex dev
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
2. **Create an Organization**: Click "New Organization" to create your first organization
3. **Create a Project**: Navigate to Projects and create projects under your organization
4. **Add Tasks**: Create tasks and link them to specific projects
5. **Take Notes**: Use the Notes section to capture ideas and meeting notes
6. **Track Habits**: Set up daily habits you want to build
7. **Use Pomodoro**: Start focused work sessions with task integration

### Key Features

#### Organizations
- Click "New Organization" to create an organization
- Set organization colors and descriptions
- View organization-wide statistics and projects
- Manage multiple organizations for different contexts

#### Projects
- Create projects within organizations
- Set due dates, status, and color themes
- Track progress automatically based on task completion
- View all project tasks and notes in one place

#### Tasks
- Create tasks with descriptions, priorities, and due dates
- Assign tasks to specific projects
- Set status (Todo, In Progress, Completed)
- Use priority levels (High/Medium/Low) with visual indicators
- Complete tasks with interactive checkboxes

#### Notes
- Write detailed notes with rich text
- Tag notes for easy organization and search
- Link notes to specific projects
- Use the search functionality to find notes quickly

#### Habits
- Set up daily habits with descriptions
- Track completion with simple checkboxes
- View streak counters and weekly progress
- Monitor completion percentages

#### Pomodoro Timer
- Select a specific task to work on during sessions
- Start 25-minute focus sessions with automatic break management
- Receive toast notifications for session events
- Track comprehensive statistics including focus time and session counts
- Complete tasks directly from the timer interface
- View detailed session history

## 📱 Features Overview

### Navigation
- **Sidebar Navigation**: Easy switching between Organizations, Projects, Tasks, Notes, Habits, and Pomodoro
- **Quick Actions**: Fast access to create new items with modal dialogs
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### Visual Design
- **Clean Interface**: Minimalist design focused on productivity
- **Color Coding**: Visual indicators for priorities, status, and progress
- **Interactive Elements**: Smooth hover effects and transitions
- **Card-based Layout**: Organized information in digestible chunks
- **Modal System**: Intuitive dialogs for creating and editing items

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma db push` - Push database schema changes
- `npx prisma studio` - Open Prisma Studio database GUI

### Database Management
- **Prisma Studio**: Run `npx prisma studio` to open the database GUI
- **Schema Changes**: Modify `prisma/schema.prisma` and run `npx prisma db push`
- **Database Reset**: Delete `prisma/dev.db` and run `npx prisma db push`

## 📋 Current Status

### ✅ Implemented Features
- ✅ Complete Organization management with CRUD operations
- ✅ Full Project management with organization linking
- ✅ Comprehensive Task management with project assignment
- ✅ Note taking with tags and search functionality
- ✅ Habit tracking with streak counters
- ✅ Advanced Pomodoro timer with task integration
- ✅ Real-time dashboard with statistics
- ✅ Responsive UI with modal dialogs
- ✅ Form validation and error handling
- ✅ Toast notification system
- ✅ Local data persistence

### 🔄 Future Enhancements
- [ ] Advanced analytics and reporting
- [ ] Team collaboration features
- [ ] Mobile app version
- [ ] Calendar integration
- [ ] Email notifications
- [ ] API endpoints for external integration
- [ ] Bluetooth-based local sync
- [ ] Offline support

## 🤝 Contributing

This is a fully functional productivity application ready for immediate use! The codebase is well-structured and easy to extend. Feel free to:
- Add new features and enhancements
- Improve the UI/UX design
- Fix bugs or optimize performance
- Add authentication and multi-user support
- Integrate with external services
- Add more advanced analytics

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Ready to boost your productivity? Start the app and begin organizing your organizations, projects, tasks, and habits today!** 🚀 