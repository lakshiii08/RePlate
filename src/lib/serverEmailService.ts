import nodemailer, { type Transporter } from 'nodemailer';

export interface OtpRecord {
  otp: string;
  expiresAt: number;
  role?: string;
  name?: string;
}

// In-memory OTP cache that persists across hot-reloads in Next.js dev server
declare global {
  var __replateActiveOtps: Map<string, OtpRecord> | undefined;
}

const activeOtps = globalThis.__replateActiveOtps || new Map<string, OtpRecord>();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__replateActiveOtps = activeOtps;
}

let transporter: Transporter | null = null;

export function getConfiguredOtpRecipient(fallbackEmail?: string) {
  return (fallbackEmail || '').trim().toLowerCase();
}

export function getEmailTransporter() {
  if (transporter) return transporter;

  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim().replace(/\s+/g, '');
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const service = (process.env.EMAIL_SERVICE || 'gmail').trim().toLowerCase();

  if (emailUser && emailPass) {
    const isGmail = service === 'gmail' || emailUser.toLowerCase().includes('@gmail.com') || host.toLowerCase().includes('gmail');

    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });
    }
  } else {
    console.warn('[ServerEmailService] No EMAIL_USER and EMAIL_PASS set in env. Using JSON fallback transport.');
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
}

export function saveOtp(identifier: string, otp: string, role?: string, name?: string, ttlMinutes = 10) {
  const key = identifier.toLowerCase().trim();
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  activeOtps.set(key, { otp, expiresAt, role, name });
}

export function verifyStoredOtp(
  identifier: string,
  inputCode: string
): { valid: boolean; record?: OtpRecord; error?: string } {
  const key = identifier.toLowerCase().trim();
  const cleanCode = inputCode.trim();

  const record = activeOtps.get(key);
  if (!record) {
    return { valid: false, error: 'No active verification code found for this account. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    activeOtps.delete(key);
    return { valid: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (record.otp !== cleanCode) {
    return { valid: false, error: 'Invalid verification code. Please check the code sent to your email.' };
  }

  activeOtps.delete(key);
  return { valid: true, record };
}

export async function sendAuthOtpEmail({
  toEmail,
  otp,
  role,
  name,
}: {
  toEmail: string;
  otp: string;
  role?: string;
  name?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const mailer = getEmailTransporter();
    const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    const fromAddress =
      process.env.SMTP_FROM ||
      (emailUser ? `"RePlate Food Rescue" <${emailUser}>` : '"RePlate Food Rescue Network" <noreply@replate.org>');

    const recipientName = name || 'Partner';
    const roleTitle = role || 'Partner';
    const subject = `🔐 Your RePlate Verification Code: ${otp}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 4px 0 0; color: #10b981; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .content { padding: 32px 24px; text-align: center; }
          .greeting { font-size: 15px; color: #334155; margin-bottom: 20px; text-align: left; }
          .otp-box { background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; margin: 24px 0; }
          .otp-code { font-family: 'Courier New', monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #065f46; margin: 0; }
          .expiry { color: #64748b; font-size: 12px; margin-top: 10px; }
          .notice { background: #f1f5f9; border-radius: 8px; padding: 12px; font-size: 12px; color: #475569; text-align: left; line-height: 1.5; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RePlate Food Rescue</h1>
            <p>Verified Authentication Portal</p>
          </div>
          <div class="content">
            <div class="greeting">
              Hello <strong>${recipientName}</strong>,<br/>
              You requested a one-time verification passcode to access your RePlate <strong>${roleTitle}</strong> account.
            </div>
            <div class="otp-box">
              <p style="margin:0 0 8px 0; font-size:11px; font-weight:700; color:#047857; text-transform:uppercase;">Your One-Time Passcode</p>
              <div class="otp-code">${otp}</div>
              <div class="expiry">Valid for 10 minutes &bull; Do not share this code</div>
            </div>
            <div class="notice">
              <strong>Security Notice:</strong> RePlate staff will never ask for your password or OTP. If you did not request this login code, you can safely ignore this email.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} RePlate Food Rescue Network &bull; Connecting surplus to communities in need.
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `RePlate Verification Code: ${otp}. Valid for 10 minutes. Enter this code on the verification screen to continue.`;

    const info = await mailer.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text,
      html,
    });

    console.log(`[ServerEmailService] OTP sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[ServerEmailService] Failed to send email to ${toEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}
