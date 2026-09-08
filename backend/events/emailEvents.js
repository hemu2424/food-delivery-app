
import sendEmail from "../utils/sendEmail.js";
import eventEmitter from "./eventEmitter.js";


function registerEmailListeners() {
  eventEmitter.on("user:registered", async ({ email, name, otp }) => {
    try {
      await sendEmail({
        to: email,
        subject: "Verify your FoodExpress account",
        html: `
          <div style="font-family: sans-serif;">
            <h2>Hi ${name},</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing: 4px;">${otp}</h1>
            <p>This code expires in 10 minutes.</p>
          </div>
        `,
      });
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
     
      console.error(`Failed to send verification email to ${email}:`, error.message);
    }
  });


eventEmitter.on("user:passwordResetRequested", async ({ email, name, otp }) => {
  try {
    await sendEmail({
      to: email,
      subject: "Reset your FoodExpress password",
      html: `
        <div style="font-family: sans-serif;">
          <h2>Hi ${name},</h2>
          <p>Your password reset code is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send password reset email to ${email}:`, error.message);
  }
});
}

export default registerEmailListeners;