/**
 * Test: Send reset email to ANY email address
 * This proves the system sends to whoever the user registered with
 */
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// This simulates sending to ANY user's email
async function sendResetEmail(toEmail, userName, resetLink) {
  const info = await transporter.sendMail({
    from: `"Smart Healthcare Portal" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: toEmail,  // ← sends to whoever's email this is
    subject: "Reset Your Password — Smart Healthcare Portal",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#0066CC,#00A86B);padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:22px;">Smart Healthcare Portal</h1>
        </div>
        <h2 style="color:#0f172a;font-size:18px;">Hello, ${userName}!</h2>
        <p style="color:#475569;font-size:14px;line-height:1.6;">
          We received a request to reset your password for your Smart Healthcare account.
          Click the button below to reset it.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetLink}" 
             style="background:#0066CC;color:white;padding:14px 32px;border-radius:10px;
                    text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color:#475569;font-size:13px;">
          This link expires in <strong>1 hour</strong>. 
          If you didn't request this, please ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="color:#94a3b8;font-size:12px;text-align:center;">
          Smart Healthcare Portal · Secure Health Management
        </p>
      </div>
    `,
  });
  return info;
}

// Test sending to the email passed as argument
const targetEmail = process.argv[2] || "lschaithika@gmail.com";
const targetName  = process.argv[3] || "User";

console.log(`Sending reset email to: ${targetEmail}`);
sendResetEmail(targetEmail, targetName, "http://localhost:3000/reset-password?token=test123")
  .then((info) => {
    console.log(`✅ EMAIL SENT to ${targetEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   The user at ${targetEmail} will receive it in their inbox.`);
    process.exit(0);
  })
  .catch((err) => {
    console.log(`❌ Failed: ${err.message}`);
    process.exit(1);
  });
