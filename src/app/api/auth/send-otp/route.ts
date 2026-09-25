import { NextResponse } from 'next/server';
import { getConfiguredOtpRecipient, saveOtp, sendAuthOtpEmail } from '@/lib/serverEmailService';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, phone, role, name } = body;

    const targetEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').replace(/[^\d+]/g, '');

    if (!targetEmail && (!cleanPhone || cleanPhone.length < 8)) {
      return NextResponse.json(
        { success: false, error: 'A valid email address or phone number is required.' },
        { status: 400 }
      );
    }

    // Generate random 4-digit code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const recipientEmail = targetEmail || (cleanPhone ? `${cleanPhone.slice(-6)}@replate.org` : '');

    // Save OTP strictly for the entered account
    if (targetEmail) {
      saveOtp(targetEmail, otp, role, name);
    }
    if (cleanPhone) {
      saveOtp(cleanPhone, otp, role, name);
    }

    // Send email if recipient email is available
    if (recipientEmail && recipientEmail.includes('@')) {
      const emailResult = await sendAuthOtpEmail({
        toEmail: recipientEmail,
        otp,
        role,
        name,
      });

      if (!emailResult.success) {
        console.error('[send-otp route] Error dispatching email:', emailResult.error);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to deliver verification email to ${recipientEmail}: ${emailResult.error}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${recipientEmail || cleanPhone}. Please check your email inbox to verify.`,
      sentTo: recipientEmail || cleanPhone,
      expiresInSeconds: 600,
    });
  } catch (error: any) {
    console.error('[send-otp route] Unexpected exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
