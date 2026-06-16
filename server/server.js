const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { User } = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
require("dotenv").config();

const app = express();

let server;

// Basic middleware (must be before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email configuration
let transporterPromise;
const getTransporter = async () => {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (user && pass) {
      return {
        transporter: nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
        }),
        from: user,
        isTest: false,
      };
    }

    const testAccount = await nodemailer.createTestAccount();
    return {
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }),
      from: testAccount.user,
      isTest: true,
    };
  })();

  return transporterPromise;
};

// In-memory storage for verification codes (use a database in production)
const verificationCodes = new Map();

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP registration: send OTP
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, password, and phone",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? "Email already in use" : "Phone number already in use",
      });
    }

    const otp = generateOTP();
    verificationCodes.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      userData: { name, email, password, phone },
    });

    const { transporter, from, isTest } = await getTransporter();
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Verify Your Email",
      text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">Email Verification</h2>
          <p style="margin: 0 0 8px;">Hi ${name},</p>
          <p style="margin: 0 0 8px;">Your verification code is:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 12px 0;">${otp}</div>
          <p style="margin: 0; color: #555;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    let previewUrl;
    if (isTest) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('OTP email preview URL:', previewUrl);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      email,
      previewUrl,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
});

// OTP verification: create user
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const stored = verificationCodes.get(email);
    if (!stored || stored.expires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Account already exists. Please login.",
      });
    }

    const { name, password, phone } = stored.userData;
    const user = new User({
      name,
      email,
      phone,
      password,
      emailVerified: true,
    });

    await user.save();
    verificationCodes.delete(email);

    const token = user.generateAuthToken();
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Account already exists with provided email/phone. Please login.",
      });
    }

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid user data",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
});

// Simple test route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Temporary test login for development
app.post('/api/auth/test-login', async (req, res) => {
  try {
    const { User } = require('./models/User');
    const { email, password } = req.body;
    
    // Create or find test user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        emailVerified: true
      });
      await user.save();
    }
    
    // Generate JWT token
    const token = user.generateAuthToken();
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    // Start the server after DB connection is established
    const PORT = process.env.PORT || 5001;
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`CORS Test: http://localhost:${PORT}/cors-test`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
