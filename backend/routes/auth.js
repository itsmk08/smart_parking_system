const express = require("express")
const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")
const User = require("../models/User")
const emailService = require("../services/emailService")
const authenticateToken = require("../middleware/auth")

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production"

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Generate OTP
    const otp = emailService.generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || "viewer",
      verificationOTP: otp,
      otpExpires,
    })

    await user.save()

    // Send verification email
    await emailService.sendVerificationEmail(email, otp, firstName)

    res.json({
      success: true,
      message: "Registration successful. Please check your email for verification OTP.",
      userId: user._id,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    })
  }
})

// Verify email with OTP
router.post("/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({
      email,
      verificationOTP: otp,
      otpExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      })
    }

    // Verify user
    user.isVerified = true
    user.verificationOTP = undefined
    user.otpExpires = undefined
    await user.save()

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.firstName)

    res.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during verification",
    })
  }
})

// Resend verification OTP
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email, isVerified: false })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found or already verified",
      })
    }

    // Generate new OTP
    const otp = emailService.generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    user.verificationOTP = otp
    user.otpExpires = otpExpires
    await user.save()

    // Send verification email
    await emailService.sendVerificationEmail(email, otp, user.firstName)

    res.json({
      success: true,
      message: "Verification OTP resent successfully",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
      })
    }

    // Check password
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({
      success: true,
      token,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Admin login (legacy support)
router.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body

    // Find admin user
    const admin = await Admin.findOne({ username })
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check password
    const isValidPassword = await admin.comparePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role }, JWT_SECRET, {
      expiresIn: "24h",
    })

    res.json({
      success: true,
      token,
      message: "Login successful",
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Generate reset OTP
    const otp = emailService.generateOTP()
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    user.resetPasswordOTP = otp
    user.resetPasswordExpires = resetPasswordExpires
    await user.save()

    // Send reset email
    await emailService.sendPasswordResetEmail(email, otp, user.firstName)

    res.json({
      success: true,
      message: "Password reset OTP sent to your email",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      })
    }

    // Update password
    user.password = newPassword
    user.resetPasswordOTP = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Verify token route
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  })
})

module.exports = router
