import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { type Task } from '@/store/tasks'

interface TimelineViewProps {
  tasks: Task[]
}

export function TimelineView({ tasks }: TimelineViewProps) {
  const sortedTasks = useMemo(() => {
    return [...tasks]
      .filter(task => task.dueDate)
      .sort((a, b) => {
        if (!a.dueDate || !b.dueDate) return 0
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
  }, [tasks])

  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: Task[] } = {}
    
    sortedTasks.forEach(task => {
      if (!task.dueDate) return
      const date = new Date(task.dueDate)
      const key = date.toISOString().split('T')[0]
      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    })

    return Object.entries(groups)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
  }, [sortedTasks])

  if (sortedTasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tasks with due dates found
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groupedTasks.map(([date, tasks]) => {
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

        const isOverdue = new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))
        const isToday = new Date(date).toDateString() === new Date().toDateString()

        return (
          <div key={date} className="relative">
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-2 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">
                  {formattedDate}
                  {isToday && (
                    <Badge variant="secondary" className="ml-2">Today</Badge>
                  )}
                  {isOverdue && !isToday && (
                    <Badge variant="destructive" className="ml-2">Overdue</Badge>
                  )}
                </h3>
              </div>
            </div>
            <div className="relative pl-6 border-l-2 border-border space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="relative">
                  <div className="absolute -left-[25px] top-3 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge variant={task.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {task.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            Priority: {task.priority}
                          </Badge>
                          <Badge variant="outline">
                            Severity: {task.severity}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
} 