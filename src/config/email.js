const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Nội Thất Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/api/customers/verify-email/${token}`;
  const html = `
    <h2>Xác thực tài khoản</h2>
    <p>Xin chào, vui lòng click link bên dưới để xác thực email của bạn:</p>
    <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Xác thực Email</a>
    <p>Link sẽ hết hạn sau 24 giờ.</p>
  `;
  return sendEmail(to, 'Xác thực tài khoản - Nội Thất Shop', html);
};

const sendResetPasswordEmail = async (to, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const html = `
    <h2>Đặt lại mật khẩu</h2>
    <p>Bạn đã yêu cầu đặt lại mật khẩu. Click link bên dưới:</p>
    <a href="${resetUrl}" style="padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
    <p>Link sẽ hết hạn sau 15 phút.</p>
    <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
  `;
  return sendEmail(to, 'Đặt lại mật khẩu - Nội Thất Shop', html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail
};
