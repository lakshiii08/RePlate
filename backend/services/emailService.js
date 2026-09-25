const nodemailer = require('nodemailer');

// Email Audit Log in-memory for testing, debugging & live inspections
const emailAuditLog = [];

let transporter = null;
let etherealAccount = null;

// Initialize Transporter
async function getTransporter() {
  if (transporter) return transporter;

  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || process.env.MAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.MAIL_PASS || '').trim();
  const host = (process.env.SMTP_HOST || process.env.EMAIL_HOST || process.env.MAIL_HOST || '').trim();
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
  const service = (process.env.EMAIL_SERVICE || process.env.SMTP_SERVICE || '').trim().toLowerCase();

  // If user and pass are provided in env, use REAL SMTP
  if (emailUser && emailPass) {
    const isGmail = service === 'gmail' || emailUser.toLowerCase().includes('@gmail.com') || host.toLowerCase().includes('gmail');
    const cleanPass = emailPass.replace(/\s+/g, ''); // Removes spaces from 16-character Google App Passwords

    if (isGmail) {
      console.log(`[EmailService] Initializing real Gmail SMTP for: ${emailUser}`);
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: cleanPass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });
    } else {
      const smtpHost = host || 'smtp.gmail.com';
      const isSecure = port === 465;
      console.log(`[EmailService] Initializing custom SMTP (${smtpHost}:${port}) for: ${emailUser}`);
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: isSecure,
        auth: {
          user: emailUser,
          pass: cleanPass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    try {
      await transporter.verify();
      console.log(`✅ [EmailService] Real SMTP connection verified successfully! Sender: ${emailUser}`);
    } catch (vErr) {
      console.error(`❌ [EmailService] SMTP verification failed for ${emailUser}:`, vErr.message);
      console.warn(`[EmailService] Tip: If using Gmail, ensure 2-Step Verification is ON and you generated a 16-character App Password at: https://myaccount.google.com/apppasswords`);
    }

    return transporter;
  }

  // If no email credentials in env, warn clearly
  console.warn(`\n⚠️  [EmailService] NO SENDER EMAIL CONFIGURED IN .env!`);
  console.warn(`⚠️  To send OTPs to real inboxes, add EMAIL_USER and EMAIL_PASS to your .env file.`);
  console.warn(`⚠️  Example:\n    EMAIL_USER=yourname@gmail.com\n    EMAIL_PASS=your_16_digit_app_password\n`);

  try {
    console.log('[EmailService] Falling back to temporary test inbox (Ethereal)...');
    etherealAccount = await nodemailer.createTestAccount();
    console.log(`[EmailService] Ethereal test mailbox: ${etherealAccount.user}`);
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass,
      },
    });
  } catch (err) {
    console.warn('[EmailService] Fallback to simulated JSON transport:', err.message);
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
}

/**
 * Core send helper
 */
async function sendMail({ to, subject, html, text, otpType, orderId, otpCode }) {
  try {
    const mailer = await getTransporter();
    const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || process.env.MAIL_USER || '').trim();
    const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_FROM || (emailUser ? `"RePlate Food Rescue" <${emailUser}>` : '"RePlate Food Rescue Network" <noreply@replate.org>');

    const info = await mailer.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || null;

    const logEntry = {
      id: `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to,
      subject,
      otpType: otpType || 'GENERAL',
      orderId: orderId || null,
      otpCode: otpCode || null,
      messageId: info.messageId,
      previewUrl,
      sentAt: new Date().toISOString(),
      status: 'SENT',
    };

    emailAuditLog.unshift(logEntry);
    if (emailAuditLog.length > 50) emailAuditLog.pop();

    console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
    console.log(`║ 📧 [REPLATE EMAIL DISPATCHED]                                ║`);
    console.log(`║ To: ${to.padEnd(54)} ║`);
    console.log(`║ Subject: ${subject.slice(0, 48).padEnd(49)} ║`);
    if (otpCode) {
      console.log(`║ OTP CODE: ${String(otpCode).padEnd(50)} ║`);
    }
    if (previewUrl) {
      console.log(`║ Preview URL: ${previewUrl.padEnd(47)} ║`);
    }
    console.log(`╚══════════════════════════════════════════════════════════════╝\n`);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
      to,
    };
  } catch (error) {
    console.error(`[EmailService Error sending to ${to}]:`, error.message);
    const failedEntry = {
      id: `mail-failed-${Date.now()}`,
      to,
      subject,
      otpType,
      orderId,
      sentAt: new Date().toISOString(),
      status: 'FAILED',
      error: error.message,
    };
    emailAuditLog.unshift(failedEntry);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 1. Send Login / Signup Auth OTP strictly to user's email
 */
async function sendAuthOtpEmail({ toEmail, otp, otpCode, role, name, userName }) {
  const actualOtp = otp || otpCode || '0000';
  const recipientName = name || userName || 'Partner';
  const subject = `🔐 Your RePlate Verification Code: ${actualOtp}`;
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
        .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #065f46; margin: 0; }
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
            You requested an authentication code to access your RePlate <strong>${role || 'Partner'}</strong> account.
          </div>
          <div class="otp-box">
            <p style="margin:0 0 8px 0; font-size:11px; font-weight:700; color:#047857; text-transform:uppercase;">Your One-Time Passcode</p>
            <div class="otp-code">${actualOtp}</div>
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

  const text = `RePlate Verification Code: ${otp}. Valid for 10 minutes. Enter this code on the login page to continue.`;

  return sendMail({
    to: toEmail,
    subject,
    html,
    text,
    otpType: 'AUTH_LOGIN',
    otpCode: otp,
  });
}

/**
 * 2. Send Donation Food Pickup OTP to Restaurant/Donor
 */
async function sendDonationPickupOtpEmail({ toEmail, donorName, foodName, pickupOtp, orderId, driverName }) {
  const subject = `🍲 RePlate Pickup Handover Code: ${pickupOtp} for ${foodName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #065f46; padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
        .header p { margin: 4px 0 0; color: #a7f3d0; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .content { padding: 28px 24px; }
        .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 600; }
        .val { color: #0f172a; font-weight: 700; text-align: right; }
        .otp-box { background: #ecfdf5; border: 2px solid #059669; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', monospace; font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #064e3b; }
        .instructions { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; font-size: 12px; color: #78350f; border-radius: 4px; margin-top: 16px; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Food Rescue Pickup Handover</h1>
          <p>Order #${orderId || 'NEW'}</p>
        </div>
        <div class="content">
          <p style="font-size:14px; color:#334155; margin-top:0;">
            Dear <strong>${donorName || 'Restaurant Partner'}</strong>,
          </p>
          <p style="font-size:13px; color:#475569; line-height:1.5;">
            A volunteer courier (<strong>${driverName || 'Assigned Courier'}</strong>) has been dispatched to collect your surplus food donation.
          </p>

          <div class="details-card">
            <div class="row"><span class="label">Donation:</span><span class="val">${foodName}</span></div>
            <div class="row"><span class="label">Order Ref:</span><span class="val">#${orderId || 'RESCUE'}</span></div>
            <div class="row"><span class="label">Courier:</span><span class="val">${driverName || 'Volunteer Courier'}</span></div>
          </div>

          <div class="otp-box">
            <div style="font-size:11px; font-weight:800; color:#047857; text-transform:uppercase; margin-bottom:6px;">
              Pickup Verification OTP
            </div>
            <div class="otp-code">${pickupOtp}</div>
            <div style="font-size:11px; color:#059669; margin-top:6px; font-weight:600;">
              Share this code with the driver upon food handover
            </div>
          </div>

          <div class="instructions">
            <strong>Handover Protocol:</strong> Verify that the driver has clean thermal containers and appropriate transport equipment before providing this OTP code. The driver will validate it in their courier terminal to lock chain-of-custody.
          </div>
        </div>
        <div class="footer">
          RePlate Food Rescue &bull; Verified Cold-Chain Custody System
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `RePlate Pickup OTP: ${pickupOtp} for order #${orderId} (${foodName}). Provide this code to driver ${driverName || 'courier'} at loading dock handover.`;

  return sendMail({
    to: toEmail,
    subject,
    html,
    text,
    otpType: 'PICKUP_OTP',
    orderId,
    otpCode: pickupOtp,
  });
}

/**
 * 3. Send Delivery Verification OTP to Shelter/Recipient and Donor
 */
async function sendDeliveryOtpEmail({ toEmail, donorEmail, recipientName, donorName, foodName, deliveryOtp, orderId, driverName }) {
  const subject = `📦 RePlate Delivery Verification Code: ${deliveryOtp} for Order #${orderId || 'RESCUE'}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #1e3a8a; padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
        .header p { margin: 4px 0 0; color: #93c5fd; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .content { padding: 28px 24px; }
        .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 600; }
        .val { color: #0f172a; font-weight: 700; text-align: right; }
        .otp-box { background: #eff6ff; border: 2px solid #2563eb; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', monospace; font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #1e40af; }
        .instructions { background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px; font-size: 12px; color: #065f46; border-radius: 4px; margin-top: 16px; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Shelter Intake & Handover Verification</h1>
          <p>Order #${orderId || 'RESCUE'}</p>
        </div>
        <div class="content">
          <p style="font-size:14px; color:#334155; margin-top:0;">
            Hello <strong>${recipientName || 'Community Shelter Team'}</strong>,
          </p>
          <p style="font-size:13px; color:#475569; line-height:1.5;">
            Volunteer courier <strong>${driverName || 'Assigned Driver'}</strong> is arriving with surplus meals from <strong>${donorName || 'Local Donor'}</strong>.
          </p>

          <div class="details-card">
            <div class="row"><span class="label">Food Rescue:</span><span class="val">${foodName}</span></div>
            <div class="row"><span class="label">Donor:</span><span class="val">${donorName || 'Community Restaurant'}</span></div>
            <div class="row"><span class="label">Shelter Intake:</span><span class="val">${recipientName || 'Hope Community Shelter'}</span></div>
            <div class="row"><span class="label">Courier:</span><span class="val">${driverName || 'Volunteer Driver'}</span></div>
          </div>

          <div class="otp-box">
            <div style="font-size:11px; font-weight:800; color:#1d4ed8; text-transform:uppercase; margin-bottom:6px;">
              Delivery Sign-Off OTP
            </div>
            <div class="otp-code">${deliveryOtp}</div>
            <div style="font-size:11px; color:#2563eb; margin-top:6px; font-weight:600;">
              Share this code with the driver once food trays are inspected and received
            </div>
          </div>

          <div class="instructions">
            <strong>Intake Protocol:</strong> Conduct temperature probe audit (Chilled &lt; 5°C, Hot &gt; 60°C). Once inspected, provide this OTP to the driver to finalize delivery.
          </div>
        </div>
        <div class="footer">
          RePlate Food Rescue Network &bull; Verified Mission Completion
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `RePlate Delivery OTP: ${deliveryOtp} for order #${orderId}. Provide to driver ${driverName || 'courier'} to confirm receipt.`;

  // Send to recipient/shelter
  const primaryPromise = sendMail({
    to: toEmail,
    subject,
    html,
    text,
    otpType: 'DELIVERY_OTP',
    orderId,
    otpCode: deliveryOtp,
  });

  // Also send copy to donor email if available
  if (donorEmail && donorEmail !== toEmail) {
    sendMail({
      to: donorEmail,
      subject: `[Copy] ${subject}`,
      html,
      text,
      otpType: 'DELIVERY_OTP_DONOR_COPY',
      orderId,
      otpCode: deliveryOtp,
    }).catch((e) => console.warn('Donor delivery copy failed:', e.message));
  }

  return primaryPromise;
}

module.exports = {
  sendMail,
  sendAuthOtpEmail,
  sendDonationPickupOtpEmail,
  sendDeliveryOtpEmail,
  emailAuditLog,
};
