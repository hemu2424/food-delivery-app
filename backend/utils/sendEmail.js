import nodemailer from "nodemailer";

async function sendEmail({ to, subject, html }) {

  const transporter = nodemailer.createTransport({
    // Hardcoded Google SMTP IPv4 address to completely bypass DNS IPv6 resolution
    host: "74.125.195.108", 
    port: 465,               
    secure: true,            
    auth: {
      user: process.env.EMAIL_USER,     
      process: process.env.EMAIL_PASSWORD, 
    },
    tls: {
      // CRITICAL: Tells the SSL connection to expect Gmail's certificate, 
      // preventing "Hostname/IP does not match certificate's altnames" errors
      servername: "smtp.gmail.com" 
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
