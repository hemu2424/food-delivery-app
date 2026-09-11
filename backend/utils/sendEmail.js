import nodemailer from "nodemailer";

async function sendEmail({ to, subject, html }) {

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", 
    port: 465,               
    secure: true,            
    family: 4, 
    auth: {
      user: process.env.EMAIL_USER,     
      pass: process.env.EMAIL_PASSWORD, 
    },
    connectionTimeout: 15000, 
    greetingTimeout: 15000,
    socketTimeout: 15000,
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
