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
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: {
    type: 'task' | 'project' | 'habit' | 'pomodoro';
    status?: string;
    pomodoroType?: string;
    duration?: number;
  };
}

export default function CalendarView() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showHabits, setShowHabits] = useState(true);
  const [showPomodoro, setShowPomodoro] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, [showTasks, showProjects, showHabits, showPomodoro]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/events');
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Calendar API error:', response.status, errorText);
        throw new Error(`Failed to fetch calendar data: ${response.status}`);
      }
      const data = await response.json();
      console.log('Calendar events loaded:', data);
      
      // Convert timestamps to Date objects for FullCalendar
      const eventsWithDates = data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: event.end ? new Date(event.end) : undefined,
      }));

      const filteredEvents = eventsWithDates.filter((event: CalendarEvent) => {
        const eventType = event.extendedProps?.type;
        if (eventType === 'task' && !showTasks) return false;
        if (eventType === 'project' && !showProjects) return false;
        if (eventType === 'habit' && !showHabits) return false;
        if (eventType === 'pomodoro' && !showPomodoro) return false;
        return true;
      });

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Calendar fetch error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading calendar events...</p>
            </div>
          </div>
        ) : (
          <div className={`fullcalendar-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              buttonText={{
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day'
              }}
              events={events}
              height="600px"
              eventClick={(info) => {
                // Handle event click - can be implemented later
                console.log('Event clicked:', info.event);
              }}
              eventDisplay="block"
              dayMaxEvents={5}
              moreLinkClick="popover"
              selectable={true}
              selectMirror={true}
              dayMaxEventRows={true}
              weekends={true}
              firstDay={1}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={true}
              allDayMaintainDuration={true}
              slotDuration="00:30:00"
              slotLabelInterval="01:00"
              expandRows={false}
              aspectRatio={1.35}
            />
          </div>
        )}
      </Card>
    </div>
  );
} 