import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-convex';
import { convexHttp } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';

// Cache for user IDs to avoid repeated lookups
const userCache = new Map<string, string>();

async function getConvexUserId(sessionUserId: string, userName: string, userEmail: string): Promise<string> {
  // Check cache first
  if (userCache.has(sessionUserId)) {
    return userCache.get(sessionUserId)!;
  }

  // Create or find user in Convex
  const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
    id: sessionUserId,
    name: userName || 'Unknown User',
    email: userEmail || '',
  });

  // Cache the result
  userCache.set(sessionUserId, convexUserId);
  return convexUserId;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json([]);
    }

    const convexUserId = await getConvexUserId(
      session.user.id || '',
      session.user.name || 'Unknown User',
      session.user.email || ''
    );

    // Fetch calendar events from Convex
    const events = await convexHttp.query(api.calendar.getCalendarEvents, {
      userId: convexUserId as any
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json([]);
  }
}

// Add this to prevent static generation issues
export const dynamic = 'force-dynamic';