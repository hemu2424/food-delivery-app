import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD length:", process.env.EMAIL_PASSWORD?.length);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.sendMail({
  from: `"Test" <${process.env.EMAIL_USER}>`,
  to: process.env.Email_to, 
  subject: "Nodemailer test",
  html: "<p>If you see this, credentials work.</p>",
})
  .then(() => console.log("SUCCESS: Email sent!"))
  .catch((error) => console.error("FAILURE:", error));  