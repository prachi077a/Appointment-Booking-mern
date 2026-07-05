const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @route POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    // Only allow patient/doctor at signup - admins are created manually/seeded
    const allowedRole = ["patient", "doctor"].includes(role) ? role : "patient";

    const user = await User.create({ name, email, password, phone, role: allowedRole });

    res.status(201).json({
      user,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      user,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMe };
