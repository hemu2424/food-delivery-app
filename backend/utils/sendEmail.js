import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 0);

const transporter =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort || 587,
        secure: smtpPort === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
      })
    : null;

async function sendViaBrevo({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "FoodExpress",
        email: process.env.EMAIL_FROM || "hporiya06@gmail.com",
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo API error: ${response.status} ${response.statusText} ${errorText}`);
  }

  return response.json();
}

async function sendEmail({ to, subject, html }) {
  try {
    if (process.env.BREVO_API_KEY) {
      await sendViaBrevo({ to, subject, html });
      console.log("Email sent via Brevo to:", to);
      return;
    }

    if (!transporter) {
      throw new Error("No email provider configured. Set BREVO_API_KEY or SMTP_* env vars.");
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("Email sent via SMTP to:", to);
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to send email");
  }
}

export default sendEmail;