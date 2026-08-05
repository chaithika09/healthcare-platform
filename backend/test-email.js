const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "lschaithika@gmail.com",
    pass: "mdhmzccxcematowb",
  },
});

transporter.sendMail({
  from: '"Smart Healthcare Portal" <lschaithika@gmail.com>',
  to:   "lschaithika@gmail.com",
  subject: "✅ Smart Healthcare Portal - Email Working!",
  html: `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <div style="background:linear-gradient(135deg,#0066CC,#00A86B);padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
        <h1 style="color:white;margin:0;font-size:22px;">Smart Healthcare Portal</h1>
      </div>
      <h2 style="color:#0f172a;">✅ Email is working!</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6;">
        Your Gmail SMTP is configured correctly.<br>
        Password reset emails will now be delivered automatically.
      </p>
      <div style="background:#e6f7f2;border-radius:12px;padding:16px;margin-top:16px;">
        <p style="color:#00A86B;margin:0;font-size:14px;font-weight:600;">
          🎉 Forgot Password feature is now fully working!
        </p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
        Smart Healthcare Portal · lschaithika@gmail.com
      </p>
    </div>
  `,
}, (err, info) => {
  if (err) {
    console.log("❌ FAILED:", err.message);
  } else {
    console.log("✅ EMAIL SENT SUCCESSFULLY!");
    console.log("   Message ID:", info.messageId);
    console.log("   Check your inbox: lschaithika@gmail.com");
  }
  process.exit(0);
});
