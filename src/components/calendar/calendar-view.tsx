'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from 'next-themes';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: string;
  type: 'task' | 'project' | 'habit' | 'pomodoro';
}

export default function CalendarView() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showTasks, setShowTasks] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showHabits, setShowHabits] = useState(true);
  const [showPomodoro, setShowPomodoro] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, [showTasks, showProjects, showHabits, showPomodoro]);

  const fetchCalendarData = async () => {
    try {
      const response = await fetch('/api/calendar/events');
      if (!response.ok) throw new Error('Failed to fetch calendar data');
      const data = await response.json();
      
      const filteredEvents = data.filter((event: CalendarEvent) => {
        if (event.type === 'task' && !showTasks) return false;
        if (event.type === 'project' && !showProjects) return false;
        if (event.type === 'habit' && !showHabits) return false;
        if (event.type === 'pomodoro' && !showPomodoro) return false;
        return true;
      });

      setEvents(filteredEvents);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load calendar events',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        </div>
      </div>
      <Card className="p-4">
        <div className="flex flex-wrap gap-6 mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-tasks"
              checked={showTasks}
              onCheckedChange={setShowTasks}
            />
            <Label htmlFor="show-tasks">Tasks</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-projects"
              checked={showProjects}
              onCheckedChange={setShowProjects}
            />
            <Label htmlFor="show-projects">Projects</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-habits"
              checked={showHabits}
              onCheckedChange={setShowHabits}
            />
            <Label htmlFor="show-habits">Habits</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-pomodoro"
              checked={showPomodoro}
              onCheckedChange={setShowPomodoro}
            />
            <Label htmlFor="show-pomodoro">Pomodoro</Label>
          </div>
        </div>
        <div className={`fullcalendar-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            height="auto"
            eventClick={(info) => {
              // Handle event click - can be implemented later
              console.log('Event clicked:', info.event);
            }}
          />
        </div>
      </Card>
    </div>
  );
} 