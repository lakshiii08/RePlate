import { NextResponse } from 'next/server';

// In-memory OTP cache for demo verification
const otpCache = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    const cleanPhone = (phone || '').replace(/[^\d+]/g, '');

    if (!cleanPhone || cleanPhone.length < 8) {
      return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 });
    }

    // Generate random 4-digit code (or 8492 for test repeatability)
    const demoOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    otpCache.set(cleanPhone, { otp: demoOtp, expiresAt });

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${cleanPhone}`,
      demoOtp,
      expiresInSeconds: 300,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
