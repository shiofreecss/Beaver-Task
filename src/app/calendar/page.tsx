import CalendarView from '@/components/calendar/calendar-view';

export default function CalendarPage() {
  return <CalendarView />;
}

// Add this to prevent static generation issues
export const dynamic = 'force-dynamic';