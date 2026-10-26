// backend/src/services/emailService.js
const { Resend } = require('resend');
const config = require('../config');

function getResendClient() {
  const apiKey = (process.env.RESEND_API_KEY || config.RESEND_API_KEY || '').trim();
  if (!apiKey || apiKey.startsWith('re_123456789') || apiKey === 'your_resend_api_key_here') {
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Send Password Reset OTP email to parent
 */
async function sendPasswordResetOtpEmail(toEmail, otpCode, parentName = 'Parent') {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF9EC; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 32px; border: 2px solid #FFC93C; }
          .logo { text-align: center; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: 800; color: #1B2A4A; text-align: center; margin-bottom: 12px; }
          .text { font-size: 15px; color: #3E4E6B; line-height: 1.6; margin-bottom: 24px; text-align: center; }
          .otp-box { background: #E7F3FC; border: 2px dashed #3A9BE8; border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0F5F9E; font-family: monospace; }
          .footer { font-size: 12px; color: #8C9EAE; text-align: center; margin-top: 32px; border-top: 1px solid #EADFCE; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1 style="color: #FF6F61; margin: 0; font-size: 28px;">KiddoTube</h1>
          </div>
          <div class="title">Password Reset Code</div>
          <p class="text">Hello ${parentName},<br>We received a request to reset your KiddoTube parent account password. Use the verification code below to set a new password:</p>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
          </div>
          <p class="text" style="font-size: 13px;">This code will expire in 15 minutes. If you did not request this password reset, please ignore this email.</p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} KiddoTube Parental Safe Stream. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  const resend = getResendClient();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || config.RESEND_FROM_EMAIL || 'KiddoTube <onboarding@resend.dev>').trim();

  if (resend) {
    try {
      const response = await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        subject: `Your KiddoTube Password Reset Code: ${otpCode}`,
        html: htmlContent,
      });

      if (response && response.error) {
        console.error('[EmailService] Resend returned error:', response.error);
        return {
          success: true,
          simulated: true,
          devOtp: otpCode,
          warning: response.error.message || 'Resend delivery failed, fallback code provided.'
        };
      }

      console.log(`[EmailService] Resend email successfully dispatched to ${toEmail}:`, response?.data);
      return { success: true, messageId: response?.data?.id };
    } catch (err) {
      console.error('[EmailService] Resend exception:', err.message || err);
      return { success: true, simulated: true, devOtp: otpCode };
    }
  } else {
    console.log(`[EmailService] (Local/Dev simulated - RESEND_API_KEY not configured) OTP for ${toEmail}: ${otpCode}`);
    return { success: true, simulated: true, devOtp: otpCode };
  }
}

module.exports = {
  sendPasswordResetOtpEmail,
};

