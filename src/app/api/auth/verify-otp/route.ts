import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';
import { verifyStoredOtp } from '@/lib/serverEmailService';
import { User, UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, phone, otp, code, role, newUserData } = body;

    const targetEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
    const cleanOtp = String(otp || code || '').trim();

    if ((!targetEmail && !cleanPhone) || !cleanOtp) {
      return NextResponse.json(
        { success: false, error: 'Email or phone and verification code are required.' },
        { status: 400 }
      );
    }

    const identifier = targetEmail || cleanPhone;
    const verification = verifyStoredOtp(identifier, cleanOtp);

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    // Find existing user or register new user
    let existingUser = globalServerStore.users.find((u) => {
      const emailMatches = targetEmail && u.email && u.email.toLowerCase() === targetEmail;
      const phoneMatches = cleanPhone && u.phone && u.phone.replace(/[^\d+]/g, '') === cleanPhone;
      return emailMatches || phoneMatches;
    });

    if (!existingUser) {
      const targetRole: UserRole = newUserData?.role || role || (verification.record?.role as UserRole) || 'DONOR';
      const emailPrefix = targetEmail ? targetEmail.split('@')[0] : 'Partner';
      const displayName =
        newUserData?.name ||
        verification.record?.name ||
        (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).replace(/[._]/g, ' '));

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: displayName,
        email: targetEmail || `${cleanPhone.slice(-6)}@replate.org`,
        phone: newUserData?.phone || cleanPhone || '',
        role: targetRole,
        organization: newUserData?.organization || `${displayName}'s Organization`,
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
  } catch (error: any) {
    console.error('[verify-otp route] Unexpected exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
