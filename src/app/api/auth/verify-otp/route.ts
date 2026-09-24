import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';
import { User, UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const { phone, otp, role, newUserData } = await request.json();
    const cleanPhone = (phone || '').replace(/[^\d+]/g, '');

    if (!cleanPhone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    // In demo environment, allow any 4-digit code or fallback
    if (otp.length < 4) {
      return NextResponse.json({ error: 'Please enter a valid 4-digit OTP' }, { status: 400 });
    }

    // Check if user exists
    let existingUser = globalServerStore.users.find(
      (u) => u.phone.replace(/[^\d+]/g, '') === cleanPhone
    );

    if (!existingUser) {
      // Create user
      const targetRole: UserRole = newUserData?.role || role || 'DONOR';
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: newUserData?.name || (targetRole === 'DONOR' ? 'Local Restaurant Partner' : targetRole === 'SHELTER' ? 'City Food Hub' : 'Urban Volunteer Driver'),
        email: `${cleanPhone.slice(-6)}@replate.org`,
        phone: cleanPhone,
        role: targetRole,
        organization: newUserData?.organization || (targetRole === 'DONOR' ? 'Fresh Food Donor' : targetRole === 'SHELTER' ? 'Neighborhood Shelter' : 'Eco Courier Volunteer'),
        status: 'ACTIVE',
      };
      globalServerStore.users.push(newUser);
      existingUser = newUser;
    }

    return NextResponse.json({
      success: true,
      user: existingUser,
      token: `token-${existingUser.id}-${Date.now()}`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
