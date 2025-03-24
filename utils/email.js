const nodemailer = require("nodemailer");
const dotEnv = require("dotenv");
dotEnv.config({ path: "./conf.env" });

const sendEmail = async (options) => {
  //Creating transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //Mail Options
  const mailOptions = {
    from: "harshal211997@gmail.com",
    to: options.email,
    subject: options.subject,
    html: `<!DOCTYPE html>
<html>
<head>
    <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; text-align: center;">
    <h2>Password Reset Request</h2>
    <p>Hello <strong>${options.name}</strong>,</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <a href="${options.url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
        Reset Password
    </a>
    <p>If you didn't request a password reset, you can ignore this email.</p>
    <p>Best regards,<br> <strong>User Management System</strong></p>
</body>
</html>
`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
