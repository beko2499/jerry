const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendVerificationEmail(to, code) {
  const html = `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
      <div style="padding: 40px 30px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">👽</div>
        <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px;">متجر جيري</h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">Jerry Store</p>
      </div>
      <div style="padding: 0 30px 30px; text-align: center;">
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; margin: 0 0 24px;">
          مرحباً! 👋<br/>
          لتأكيد بريدك الإلكتروني، استخدم الكود التالي:
        </p>
        <div style="background: rgba(6, 182, 212, 0.15); border: 2px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #06b6d4; font-family: monospace;">${code}</span>
        </div>
        <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 0;">
          هذا الكود صالح لمدة 10 دقائق فقط.<br/>
          إذا لم تطلب هذا الكود، يرجى تجاهل هذه الرسالة.
        </p>
      </div>
      <div style="padding: 16px 30px; background: rgba(255,255,255,0.03); border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
        <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Jerry Store — All rights reserved</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: '🔐 كود التأكيد — متجر جيري',
    html,
  });
}

module.exports = { sendVerificationEmail };
