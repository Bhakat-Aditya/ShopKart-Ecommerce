import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Default OTP Template (Maintains backward compatibility)
  const defaultOtpTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">${options.subject}</h2>
        <p style="font-size: 16px; text-align: center;">Your One-Time Password (OTP) is:</p>
        <h1 style="color: #fbbf24; font-size: 36px; letter-spacing: 5px; text-align: center;">${options.otp}</h1>
        <p style="text-align: center; color: #666;">This code expires in 10 minutes.</p>
      </div>
  `;

  const message = {
    from: `ShopKart <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // Plain text fallback
    // Logic: If 'html' is provided in options, use it. Otherwise use OTP template.
    html: options.html ? options.html : defaultOtpTemplate, 
  };

  await transporter.sendMail(message);
};

export default sendEmail;