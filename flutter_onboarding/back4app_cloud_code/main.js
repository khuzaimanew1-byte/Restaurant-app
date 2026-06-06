/**
 * Back4App Cloud Code — Attendance App
 *
 * Deploy this file via the Back4App Dashboard:
 *   App Settings → Cloud Code → Deploy
 *
 * Set these environment variables in:
 *   App Settings → Server Settings → Environment Variables
 *     GMAIL            = your-gmail@gmail.com
 *     GMAIL_APP_PASSWORD = your-16-char-app-password
 *
 * Install the nodemailer module via the Back4App Cloud Code NPM packages:
 *   package.json: { "dependencies": { "nodemailer": "^6.9.14" } }
 */

const nodemailer = require('nodemailer');

Parse.Cloud.define('sendOtpEmail', async (request) => {
  const { email, otp } = request.params;

  if (!email || !otp) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'email and otp are required.');
  }

  const gmailUser    = process.env.GMAIL;
  const gmailPass    = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    throw new Parse.Error(
      Parse.Error.SCRIPT_FAILED,
      'Email service is not configured on the server.'
    );
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass },
  });

  const expiryMinutes = 5;

  const mailOptions = {
    from: `"Attendance App" <${gmailUser}>`,
    to: email,
    subject: 'Your OTP Verification Code',
    text: `Your one-time password is: ${otp}\n\nThis code expires in ${expiryMinutes} minutes.\nDo not share this code with anyone.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  max-width: 420px; margin: 0 auto; padding: 40px 32px;
                  background: #0c0c14; border-radius: 20px; color: #f0f0f8;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: rgba(99,102,241,.18);
                      border: 1px solid rgba(99,102,241,.3); border-radius: 16px;
                      padding: 16px 20px;">
            <span style="font-size: 28px;">🗓️</span>
          </div>
        </div>
        <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.5px;
                   margin: 0 0 8px; color: #f0f0f8;">Verify your email</h1>
        <p style="font-size: 15px; color: #8888aa; margin: 0 0 32px; line-height: 1.55;">
          Enter this code in the Attendance App to complete your registration.
        </p>
        <div style="background: rgba(99,102,241,.1); border: 1px solid rgba(99,102,241,.2);
                    border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 38px; font-weight: 800; letter-spacing: 12px;
                       color: #b4b8ff; font-variant-numeric: tabular-nums;">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #8888aa; margin: 0; text-align: center;">
          This code expires in <strong>${expiryMinutes} minutes</strong>.<br>
          Never share it with anyone.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true };
});
