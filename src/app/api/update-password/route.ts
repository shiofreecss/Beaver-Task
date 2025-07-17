import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { convexHttp } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';

export async function POST(req: Request) {
  try {
    const body = await req.json?.() || {};
    const email = body.email || 'shio@beaver.foundation';
    const newPassword = body.newPassword || 'Test@123';
    const role = body.role;
    
    // Hash the password
    const hashedPassword = await hash(newPassword, 10);
    
    // Look up user by email to get userId
    const user = await convexHttp.query(api.users.getUserByEmail, { email });
    if (!user || !user._id) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    const userId = user._id;
    
    // Prepare update payload
    const updatePayload = {
      userId,
      password: hashedPassword,
      ...(role ? { role } : {}),
    };
    
    // Update the password (and role if provided) in Convex
    await convexHttp.mutation(api.users.updateUser, updatePayload);
    
    return NextResponse.json({ 
      success: true, 
      message: `Password${role ? ' and role' : ''} updated for ${email}` 
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update password' },
      { status: 500 }
    );
  }
} 