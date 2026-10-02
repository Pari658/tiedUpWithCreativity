import { ENV } from '../lib/env.js'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

/**
 * Send a verification email with a 6-digit OTP code via Brevo.
 */
export const sendVerificationEmail = async (toEmail, firstName, code) => {
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': ENV.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'Tied Up With Creativity', email: ENV.BREVO_SENDER_EMAIL },
      to: [{ email: toEmail, name: firstName }],
      subject: 'Verify your email — Tied Up With Creativity',
      htmlContent: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #2d2d2d; margin-bottom: 8px;">Welcome, ${firstName}! 🎨</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            Thanks for signing up at <strong>Tied Up With Creativity</strong>. 
            Enter the code below to verify your email:
          </p>
          <div style="background: #f8f4f0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #d4856b;">${code}</span>
          </div>
          <p style="color: #888; font-size: 13px;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color: #888; font-size: 13px;">If you didn't create this account, you can safely ignore this email.</p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Brevo email send failed: ${response.status} ${errorBody}`)
  }

  return true
}
