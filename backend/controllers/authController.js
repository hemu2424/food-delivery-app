import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Users } from "../models/Users.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import eventEmitter from "../events/eventEmitter.js";

function generateToken(user){
    return jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{
        expiresIn:"7d"
    })
}

function setTokenCookie(res,token){
    res.cookie("token",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"lax",
        maxAge:7*24*60*60*1000
    })
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};


async function register(req, res, next) {
  try {
    const { name, email, password, role, phone, address } = req.body;

    if (role === "admin") {
      return res.status(403).json({ message: "You cannot register as admin" });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

  
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await Users.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      isEmailVerified: false,
      emailOtp: hashOtp(otp),
      emailOtpExpires: otpExpiry,
    });


    eventEmitter.emit("user:registered", { email: user.email, name: user.name, otp });


    res.status(201).json({
      message: "Registration successful. Please check your email for a verification code.",
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { email, otp } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "This email is already verified" });
    }

    if (!user.emailOtp || !user.emailOtpExpires) {
      return res.status(400).json({ message: "No verification code found. Please request a new one." });
    }

    if (user.emailOtpExpires < new Date()) {
      return res.status(400).json({ message: "This code has expired. Please request a new one." });
    }

    const submittedOtpHash = hashOtp(otp);
    if (submittedOtpHash !== user.emailOtp) {
      return res.status(400).json({ message: "Incorrect verification code" });
    }

  
    user.isEmailVerified = true;
    user.emailOtp = null;
    user.emailOtpExpires = null;
    await user.save();


    const token = generateToken(user);
    setTokenCookie(res, token);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function resendOtp(req, res, next) {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "This email is already verified" });
    }

    const otp = generateOtp();
    user.emailOtp = hashOtp(otp);
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    eventEmitter.emit("user:registered", { email: user.email, name: user.name, otp });

    res.json({ message: "A new verification code has been sent to your email" });
  } catch (error) {
    next(error);
  }
}


async function login (req,res,next){
    try{
        const {email,password} = req.body;
        const user = await Users.findOne({email});
        if(!user){
            return res.status(401).json({
                message:"this user is not existing in database"
            });

        }
        if(user.isBlocked){
            return res.status(403).json({
                message:"this user does not exist"
            })
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!user.isEmailVerified) {
  return res.status(403).json({ message: "Please verify your email before logging in", requiresVerification: true, email: user.email });
}
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = generateToken(user);
        setTokenCookie(res, token);
        res.status(200).json({
        user:{
            id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            isApproved:user.isApproved,

        },
        token: token
    });

    
    }

    catch(error){
        next(error)

    }


    
}

    async function logout(req,res,next){
        try{
            res.clearCookie("token", COOKIE_OPTIONS);
            res.status(200).json({
                message:"u are logged out"
            })

        }
        catch(error){
            next(error)
        }
    }


async function getProfile(req, res, next) {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });


    if (!user) {
      return res.json({ message: "If an account with that email exists, a reset code has been sent." });
    }
console.log("User found for password reset:", user.email);
    const otp = generateOtp();
    user.resetPasswordOtp = hashOtp(otp);
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    eventEmitter.emit("user:passwordResetRequested", { email: user.email, name: user.name, otp });
    console.log("Password reset requested for:", email, "OTP:", otp);

    res.json({ message: "If an account with that email exists, a reset code has been sent." });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordExpires) {
      return res.status(400).json({ message: "No reset code found. Please request a new one." });
    }

    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "This code has expired. Please request a new one." });
    }

    if (hashOtp(otp) !== user.resetPasswordOtp) {
      return res.status(400).json({ message: "Incorrect reset code" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    next(error);
  }
}

export {register,login,logout,getProfile,verifyEmail,resendOtp, forgotPassword, resetPassword};