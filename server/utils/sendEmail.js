import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email provider
    auth: {
      user: process.env.EMAIL_USER, // Add these to your .env
      pass: process.env.EMAIL_PASS, // Add app password (not login password)
    },
  });

  const message = {
    from: `ShopKart <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333;">${options.subject}</h2>
        <p style="font-size: 16px;">Your One-Time Password (OTP) is:</p>
        <h1 style="color: #fbbf24; font-size: 36px; letter-spacing: 5px;">${options.otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(message);
};

export default sendEmail;