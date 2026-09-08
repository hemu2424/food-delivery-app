import crypto from "crypto";


function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}


function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export { generateOtp, hashOtp };