const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const jwt = require("jsonwebtoken");


exports.register = async (req, res) => {
  try {
    const { fullname, username, email, phone, password } = req.body;

    // 1. Basic field validation
    if (!fullname || !username || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 3. Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }

    // 4. Password validation
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // 5. Check if email, username, or phone already exists
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already registered" });
    if (await User.findOne({ username })) return res.status(400).json({ message: "Username already taken" });
    if (await User.findOne({ phone })) return res.status(400).json({ message: "Phone number already registered" });

    // 6. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. Create new user
    const newUser = new User({
      fullname,
      username,
      email,
      phone,
      password: hashedPassword,
    });
    await newUser.save();

    // 8. Generate JWT token (auto-login)
    const token = jwt.sign(
      { id: newUser._id, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 9. Response with token
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // 1. Validate input
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "Email/Username and password are required" });
    }

    // 2. Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentialsssss" });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // token expires in 7 days
    );

    // 5. Response (exclude password)
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};