const nodemailer = require("nodemailer");
const logger = require("./logger");

const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to, subject, html, text,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error("Email send error:", error.message);
    return { success: false, error: error.message };
  }
};

const sendOTPEmail = (to, otp, name) =>
  sendEmail({
    to, subject: "Verify Your Email — Smart Healthcare Portal",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#0066CC,#00A86B);padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:22px;">Smart Healthcare Portal</h1>
        </div>
        <h2 style="color:#0f172a;font-size:18px;">Hello, ${name}!</h2>
        <p style="color:#475569;font-size:14px;line-height:1.6;">Your email verification code is:</p>
        <div style="background:#0066CC;color:white;font-size:36px;font-weight:bold;letter-spacing:12px;text-align:center;padding:20px;border-radius:12px;margin:20px 0;">${otp}</div>
        <p style="color:#475569;font-size:13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });

const sendPasswordResetEmail = (to, resetUrl, name) =>
  sendEmail({
    to, subject: "Reset Your Password — Smart Healthcare Portal",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#0066CC,#00A86B);padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:22px;">Smart Healthcare Portal</h1>
        </div>
        <h2 style="color:#0f172a;font-size:18px;">Password Reset Request</h2>
        <p style="color:#475569;font-size:14px;line-height:1.6;">Hi ${name}, click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}" style="background:#0066CC;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">Reset Password</a>
        </div>
        <p style="color:#94a3b8;font-size:12px;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      </div>
    `,
  });

const sendAppointmentConfirmation = (to, appointment, name) =>
  sendEmail({
    to, subject: "Appointment Confirmed — Smart Healthcare Portal",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#0066CC,#00A86B);padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:22px;">Appointment Confirmed ✅</h1>
        </div>
        <h2 style="color:#0f172a;font-size:18px;">Hi ${name},</h2>
        <p style="color:#475569;font-size:14px;">Your appointment has been confirmed:</p>
        <div style="background:white;border-radius:12px;padding:20px;margin:16px 0;border:1px solid #e2e8f0;">
          <p style="margin:8px 0;font-size:14px;color:#0f172a;"><strong>Doctor:</strong> ${appointment.doctorName}</p>
          <p style="margin:8px 0;font-size:14px;color:#0f172a;"><strong>Date:</strong> ${appointment.date}</p>
          <p style="margin:8px 0;font-size:14px;color:#0f172a;"><strong>Time:</strong> ${appointment.time}</p>
          <p style="margin:8px 0;font-size:14px;color:#0f172a;"><strong>Type:</strong> ${appointment.type}</p>
        </div>
        <p style="color:#94a3b8;font-size:12px;">You'll receive a reminder 24 hours before your appointment.</p>
      </div>
    `,
  });

module.exports = { sendEmail, sendOTPEmail, sendPasswordResetEmail, sendAppointmentConfirmation };
