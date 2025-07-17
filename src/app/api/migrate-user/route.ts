import { NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';

export async function POST() {
  try {
    const email = 'shio@beaver.foundation';   
    // Get the current user (new user ID)
    const currentUser = await convexHttp.query(api.users.getUserByEmail, { email });
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Use the actual old user ID as a string and cast to any
    const oldUserId = 'kd7e79fpcmzswn8nrbqstd75tn7kvpwa' as any; // This is from your logs
    const newUserId = currentUser._id as any;
    
    console.log('Migrating from old user ID:', oldUserId);
    console.log('To new user ID:', newUserId);
    
    // Run the migration
    const result = await convexHttp.mutation(api.users.migrateUserReferences, {
      oldUserId,
      newUserId,
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'User references migrated successfully',
      result
    });
  } catch (error) {
    console.error('Error migrating user references:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to migrate user references' },
      { status: 500 }
    );
  }
} 