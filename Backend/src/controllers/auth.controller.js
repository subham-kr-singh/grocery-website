const userModel = require("../models/user.model");
const blockedTokenModel = require("../models/blockedToken.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────
// Helper — sign JWT token
// ─────────────────────────────────────────
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "24h",
  });
};

// ─────────────────────────────────────────
// Helper — send token in cookie + response
// ─────────────────────────────────────────
const sendTokenResponse = (res, statusCode, message, user, token) => {
  // Cookie options
  const cookieOptions = {
    httpOnly: true, // JS cannot access cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Prevent CSRF
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in ms
  };

  res.cookie("token", token, cookieOptions);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user.toObject();

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userWithoutPassword,
  });
};

// ─────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    // If trying to register as admin — validate secret key
    if (role === "admin") {
      if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({
          success: false,
          message: "Invalid admin secret key",
        });
      }
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Assign role — admin only if secret matches, else customer
    const assignedRole = role === "admin" ? "admin" : "customer";

    // Create user
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    // Sign token
    const token = signToken(newUser._id, newUser.role);

    return sendTokenResponse(
      res,
      201,
      "Account created successfully",
      newUser,
      token,
    );
  } catch (err) {
    // Handle mongoose duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user — also select password (it's excluded by default in schema select:false pattern)
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password", // Don't reveal which one is wrong
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Sign token
    const token = signToken(user._id, user.role);

    return sendTokenResponse(res, 200, "Login successful", user, token);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/logout
// @access  Private (requires auth middleware)
// ─────────────────────────────────────────
const logout = async (req, res) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token found to logout",
      });
    }

    // Block this token in DB — MongoDB TTL will auto-delete after 24h
    await blockedTokenModel.create({ token });

    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    // If token already blocked (duplicate), still treat as logged out
    if (err.code === 11000) {
      res.clearCookie("token");
      return res.status(200).json({
        success: true,
        message: "Already logged out",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private (requires auth middleware)
// ─────────────────────────────────────────
const me = async (req, res) => {
  try {
    // req.user is attached by auth middleware
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = { register, login, logout, me };
