import nodemailer from "nodemailer";

async function sendEmail({ to, subject, html }) {

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Fixed: Changed from "://gmail.com"
    port: 465,               // Fixed: Port 465 is recommended for secure Gmail SMTP
    secure: true,            // Fixed: Set to true for port 465
    auth: {
      user: process.env.EMAIL_USER,     // Should be hporiya06@gmail.com in your .env file
      pass: process.env.EMAIL_PASSWORD, // Must be a 16-digit Google App Password
    },
  });

  try {
    await transporter.sendMail({
      from: `"FoodExpress" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to send email");
  }
}

export default sendEmail;
