import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Task } from '@/store/tasks'
import { Project } from '@/store/projects'
import { Session } from '@/store/pomodoro'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

interface DashboardChartsProps {
  tasks: Task[]
  projects: Project[]
  sessions: Session[]
}

export function DashboardCharts({ tasks, projects, sessions }: DashboardChartsProps) {
  // Task Status Distribution
  const taskStatusData = {
    labels: ['To Do', 'In Progress', 'Completed'],
    datasets: [{
      data: [
        tasks.filter(t => t.status === 'TODO').length,
        tasks.filter(t => t.status === 'IN_PROGRESS').length,
        tasks.filter(t => t.status === 'COMPLETED').length
      ],
      backgroundColor: ['#ff6384', '#36a2eb', '#4bc0c0'],
    }]
  }

  // Project Progress
  const projectProgress = projects.map(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id)
    const completedTasks = projectTasks.filter(t => t.status === 'COMPLETED').length
    return {
      name: project.name,
      progress: projectTasks.length ? (completedTasks / projectTasks.length) * 100 : 0
    }
  })

  const projectProgressData = {
    labels: projectProgress.map(p => p.name),
    datasets: [{
      label: 'Project Progress (%)',
      data: projectProgress.map(p => p.progress),
      backgroundColor: '#36a2eb',
    }]
  }

  // Focus Time Trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const focusTimeData = {
    labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{
      label: 'Focus Minutes',
      data: last7Days.map(date => {
        const dayMinutes = sessions
          .filter(s => s.createdAt.split('T')[0] === date)
          .reduce((acc, session) => acc + (session.duration || 0), 0)
        return dayMinutes
      }),
      borderColor: '#4bc0c0',
      tension: 0.1,
      fill: false
    }]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut 
              data={taskStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Bar
              data={projectProgressData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Focus Time Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Line
              data={focusTimeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Minutes'
                    }
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 