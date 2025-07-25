const nodemailer = require("nodemailer")

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendVerificationEmail(email, otp, firstName) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Verify Your Smart Parking Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1653b6ff; color: white; padding: 20px; text-align: center;">
            <h1>Smart Parking System</h1>
          </div>
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2>Welcome ${firstName}!</h2>
            <p>Thank you for registering with Smart Parking System. Please verify your email address using the OTP below:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #3b82f6; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          <div style="background-color: #374151; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>&copy; 2023 Smart Parking System. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    return this.transporter.sendMail(mailOptions)
  }

  async sendPasswordResetEmail(email, otp, firstName) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Reset Your Smart Parking Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1>Password Reset Request</h1>
          </div>
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2>Hello ${firstName},</h2>
            <p>We received a request to reset your password. Use the OTP below to reset your password:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #dc2626; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
          </div>
          <div style="background-color: #374151; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>&copy; 2023 Smart Parking System. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    return this.transporter.sendMail(mailOptions)
  }

  async sendWelcomeEmail(email, firstName) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Welcome to Smart Parking System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
            <h1>Welcome to Smart Parking!</h1>
          </div>
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2>Hello ${firstName},</h2>
            <p>Your account has been successfully verified! You can now access the Smart Parking System.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Access Dashboard
              </a>
            </div>
            <p>Features you can now access:</p>
            <ul>
              <li>Real-time vehicle monitoring</li>
              <li>Parking history and analytics</li>
              <li>Billing and revenue reports</li>
              <li>System configuration</li>
            </ul>
          </div>
          <div style="background-color: #374151; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>&copy; 2023 Smart Parking System. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    return this.transporter.sendMail(mailOptions)
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
}

module.exports = new EmailService()
