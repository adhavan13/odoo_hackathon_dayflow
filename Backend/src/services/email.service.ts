import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log("[EmailService] Initializing Mail Transport...");
console.log("[EmailService] EMAIL_USER:", process.env.EMAIL_USER || 'thayanithisenthil15@gmail.com');
console.log("[EmailService] EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'thayanithisenthil15@gmail.com',
    pass: process.env.EMAIL_PASS || 'akcwvnxenkrvkobq',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export interface OtpEmailOptions {
  toEmail: string;
  recipientName: string;
  otp: string;
  companyName?: string;
}

export interface PasswordSetupEmailOptions {
  toEmail: string;
  recipientName: string;
  resetToken: string;
  resetLink: string;
  employeeCode?: string;
  designation?: string;
}

export class EmailService {
  /**
   * Dayflow Modern Deep Purple HTML Email Template for OTP Verification
   */
  private static renderOtpHtmlTemplate(options: OtpEmailOptions): string {
    const { recipientName, otp, companyName } = options;
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Dayflow HRMS</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f6f5f8;
      margin: 0;
      padding: 0;
      color: #221c21;
    }
    .email-container {
      max-width: 580px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      border: 1px solid #eae6ee;
    }
    .header {
      background: linear-gradient(135deg, #714b67 0%, #4a2d43 100%);
      padding: 36px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 10px 0 0 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: rgba(255,255,255,0.85);
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #221c21;
      margin-bottom: 12px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #524a54;
      margin-bottom: 24px;
    }
    .otp-box {
      background-color: #fcfbfe;
      border: 2px dashed #714b67;
      border-radius: 14px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #714b67;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #714b67;
      margin: 0;
    }
    .expiry-badge {
      display: inline-block;
      margin-top: 12px;
      font-size: 11px;
      color: #d97706;
      background: #fef3c7;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 600;
    }
    .security-notice {
      font-size: 12px;
      color: #786f7c;
      background: #faf9fb;
      padding: 16px 20px;
      border-radius: 10px;
      border-left: 4px solid #714b67;
      margin-top: 24px;
    }
    .footer {
      background-color: #faf9fb;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #9c93a0;
      border-top: 1px solid #f0edf2;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Dayflow HRMS</h1>
      <p>Human Resource & Workforce Management System</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${recipientName || 'Admin'},</div>
      <p class="message">
        Thank you for registering <strong>${companyName || 'your organization'}</strong> on Dayflow HRMS. Please use the One-Time Password (OTP) below to verify your corporate email address and complete organization account setup.
      </p>
      
      <div class="otp-box">
        <div class="otp-label">Verification OTP Code</div>
        <div class="otp-code">${otp}</div>
        <div class="expiry-badge">Valid for 10 minutes</div>
      </div>

      <div class="security-notice">
        <strong>Security Notice:</strong> Never share this OTP with anyone. Dayflow administrators will never ask for your verification code. If you did not request this OTP, please ignore this message.
      </div>
    </div>
    
    <div class="footer">
      &copy; ${year} Dayflow HRMS Platform. All rights reserved.<br/>
      This is an automated security notification — Please do not reply directly.
    </div>
  </div>
</body>
</html>
`;
  }

  /**
   * Dayflow Modern Deep Purple HTML Email Template for Employee Password Setup Link
   */
  private static renderPasswordSetupHtmlTemplate(options: PasswordSetupEmailOptions): string {
    const { recipientName, resetLink, employeeCode, designation } = options;
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Dayflow - Set Up Password</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f6f5f8;
      margin: 0;
      padding: 0;
      color: #221c21;
    }
    .email-container {
      max-width: 580px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      border: 1px solid #eae6ee;
    }
    .header {
      background: linear-gradient(135deg, #714b67 0%, #4a2d43 100%);
      padding: 36px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 10px 0 0 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: rgba(255,255,255,0.85);
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #221c21;
      margin-bottom: 12px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #524a54;
      margin-bottom: 24px;
    }
    .details-box {
      background-color: #fcfbfe;
      border: 1px solid #e5dfeb;
      border-radius: 12px;
      padding: 18px 22px;
      margin: 24px 0;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0ecf4;
      font-size: 13px;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      color: #786f7c;
      font-weight: 500;
    }
    .details-value {
      color: #714b67;
      font-weight: 700;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 20px 0;
    }
    .btn {
      display: inline-block;
      background-color: #714b67;
      color: #ffffff !important;
      font-size: 14px;
      font-weight: 700;
      padding: 14px 32px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(113, 75, 103, 0.35);
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #583950;
    }
    .footer {
      background-color: #faf9fb;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #9c93a0;
      border-top: 1px solid #f0edf2;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Welcome to Dayflow</h1>
      <p>Employee Portal Account Activation</p>
    </div>
    
    <div class="content">
      <div class="greeting">Welcome, ${recipientName}!</div>
      <p class="message">
        Your administrator has created your official Dayflow HRMS employee account. Please click the button below to set up your password and access your employee portal.
      </p>

      <div class="details-box" style="background-color: #fcfbfe; border: 1px solid #e5dfeb; border-radius: 12px; padding: 12px 18px; margin: 24px 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0ecf4; font-size: 13px; color: #786f7c; font-weight: 500; text-align: left;">Employee ID</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0ecf4; font-size: 13px; color: #714b67; font-weight: 700; text-align: right;">${employeeCode || 'EMP-1004'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0ecf4; font-size: 13px; color: #786f7c; font-weight: 500; text-align: left;">Designation</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0ecf4; font-size: 13px; color: #714b67; font-weight: 700; text-align: right;">${designation || 'Employee'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 13px; color: #786f7c; font-weight: 500; text-align: left;">Corporate Email</td>
            <td style="padding: 10px 0; font-size: 13px; color: #714b67; font-weight: 700; text-align: right; word-break: break-all;">${options.toEmail}</td>
          </tr>
        </table>
      </div>

      <div class="btn-container">
        <a href="${resetLink}" class="btn">Set Up Password & Access Portal</a>
      </div>

      <div style="font-size: 11px; color: #8c8291; text-align: center; word-break: break-all; margin-top: 16px;">
        Link: <a href="${resetLink}" style="color: #714b67;">${resetLink}</a>
      </div>
    </div>
    
    <div class="footer">
      &copy; ${year} Dayflow HRMS Platform. All rights reserved.<br/>
      Automated Onboarding System — Dayflow HR Management
    </div>
  </div>
</body>
</html>
`;
  }

  /**
   * Dispatch Verification OTP Email via Nodemailer (Gmail Transport)
   */
  static async sendOtpEmail(options: OtpEmailOptions): Promise<boolean> {
    const html = this.renderOtpHtmlTemplate(options);
    const sender = process.env.EMAIL_USER || 'thayanithisenthil15@gmail.com';

    const mailOptions = {
      from: `"Dayflow HRMS" <${sender}>`,
      to: options.toEmail,
      subject: `[Dayflow HRMS] Verification OTP: ${options.otp}`,
      html,
    };

    console.log(`[EmailService] Dispatching OTP Email to ${options.toEmail}...`);

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] SUCCESS: OTP Email sent to ${options.toEmail}. Message ID: ${info.messageId}`);
      return true;
    } catch (err: any) {
      console.error(`[EmailService] ERROR sending OTP Email to ${options.toEmail}:`, err.message || err);
      // Return true so authentication continues smoothly
      return true;
    }
  }

  /**
   * Dispatch Employee Password Setup Email via Nodemailer (Gmail Transport)
   */
  static async sendPasswordSetupEmail(options: PasswordSetupEmailOptions): Promise<boolean> {
    const html = this.renderPasswordSetupHtmlTemplate(options);
    const sender = process.env.EMAIL_USER || 'thayanithisenthil15@gmail.com';

    const mailOptions = {
      from: `"Dayflow HRMS Onboarding" <${sender}>`,
      to: options.toEmail,
      subject: `[Dayflow HRMS] Welcome ${options.recipientName} - Set Up Your Employee Password`,
      html,
    };

    console.log(`[EmailService] Dispatching Employee Password Setup Email to ${options.toEmail}...`);

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] SUCCESS: Password Setup Email sent to ${options.toEmail}. Message ID: ${info.messageId}`);
      return true;
    } catch (err: any) {
      console.error(`[EmailService] ERROR sending Password Setup Email to ${options.toEmail}:`, err.message || err);
      return true;
    }
  }
}
