require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const protectRoute = require("./middleware/auth");

const userModel = require("./models/user");
const questionModel = require("./models/questions");
const testModel = require("./models/test");

const app = express();
const upload = multer({ dest: "public/uploads/" });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: "shreyamsecret",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 30 * 60 * 1000, // 30 minutes instead of 10
    secure: false, // Allow HTTP (important for localhost)
    httpOnly: true // Security: prevent XSS attacks
  }
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Utility: Generate unique test ID
function generateTestId() {
  return 'TEST-' + Array.from({ length: 10 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
  ).join('');
}

// --- Enhanced OTP Email Function with Multiple Configurations ---
async function sendOTPEmail(email, otp) {
  // Email configurations to try in order
  const emailConfigs = [
    {
      name: "Gmail SMTP (Secure)",
      config: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      }
    },
    {
      name: "Gmail Service (Legacy)",
      config: {
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      }
    },
    {
      name: "Gmail SMTP (Alternative Port)",
      config: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      }
    }
  ];

  try {
    // Check if email credentials are available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Email credentials not found in environment variables");
      throw new Error("Email service not configured");
    }

    console.log("📧 Attempting to send OTP email to:", email);
    console.log("📧 Using email service:", process.env.EMAIL_USER);

    // Try each configuration until one works
    for (let i = 0; i < emailConfigs.length; i++) {
      const { name, config } = emailConfigs[i];
      
      try {
        console.log(`🔄 Trying ${name} (Attempt ${i + 1}/${emailConfigs.length})`);
        
        const transporter = nodemailer.createTransport(config);
        
        // Test connection with timeout
        const verifyPromise = transporter.verify();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection verification timeout')), 15000)
        );
        
        await Promise.race([verifyPromise, timeoutPromise]);
        console.log(`✅ ${name} connection verified successfully`);

        // Send email with timeout protection
        const sendPromise = transporter.sendMail({
          from: `"Cohesion" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "OTP Verification for Cohesion",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #2E86C1;">Cohesion - OTP Verification</h2>
              <p>Your <strong>One-Time Password (OTP)</strong> for verification is:</p>
              <p style="font-size: 20px; font-weight: bold; color: #E74C3C;">${otp}</p>
              <p>This OTP is valid for <strong>10 minutes</strong>.</p>
              <p><small>Sent via ${name}</small></p>
            </div>
          `
        });

        const sendTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email sending timeout')), 20000)
        );

        const info = await Promise.race([sendPromise, sendTimeoutPromise]);
        console.log(`✅ OTP email sent successfully via ${name}:`, info.messageId);
        return { success: true, messageId: info.messageId, method: name };

      } catch (configError) {
        console.log(`❌ ${name} failed:`, configError.message);
        
        // If this is the last configuration, continue to main error handler
        if (i === emailConfigs.length - 1) {
          throw configError;
        }
        // Otherwise, try next configuration
        continue;
      }
    }

    // If we get here, all configurations failed
    throw new Error("All email configurations failed");

  } catch (error) {
    console.error("❌ Failed to send OTP email after all attempts:", error.message);
    console.error("❌ Full error:", error);
    
    // Development fallback: Log OTP to console if in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log("🚨 DEVELOPMENT MODE - OTP Email Failed, but here's your OTP:");
      console.log(`📧 Email: ${email}`);
      console.log(`🔐 OTP: ${otp}`);
      console.log("⚠️ In production, fix email configuration!");
      
      return {
        success: true,
        messageId: 'DEV_MODE_' + Date.now(),
        method: 'Development Console Log',
        devMode: true
      };
    }
    
    // Return error info for production
    return { 
      success: false, 
      error: error.message,
      details: error.code || 'Unknown error',
      suggestions: [
        'Check Gmail App Password is correct (16 characters)',
        'Verify 2-Factor Authentication is enabled on Gmail',
        'Ensure EMAIL_USER and EMAIL_PASS environment variables are set',
        'Try using a different email provider (SendGrid, Mailgun)',
        'Check if your hosting provider blocks SMTP connections'
      ]
    };
  }
}

// --- Routes ---

// Home
app.get("/", (req, res) => res.render("start"));

// Debug route for email configuration
app.get("/debug-email", (req, res) => {
  const emailConfig = {
    EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
    EMAIL_PASS: process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing",
    NODE_ENV: process.env.NODE_ENV || "development",
    platform: process.platform,
    nodeVersion: process.version
  };
  
  res.json({
    message: "Email Configuration Debug",
    config: emailConfig,
    timestamp: new Date().toISOString()
  });
});

// Test email route (for debugging on Render)
app.get("/test-email", async (req, res) => {
  const testEmail = req.query.email || "test@example.com";
  const testOTP = "123456";
  
  console.log("🧪 Testing email functionality...");
  const result = await sendOTPEmail(testEmail, testOTP);
  
  res.json({
    message: "Email Test Result",
    email: testEmail,
    result: result,
    timestamp: new Date().toISOString()
  });
});

// Session debug route
app.get("/debug-session", (req, res) => {
  // Set a test session value
  if (req.query.set) {
    req.session.testEmail = req.query.set;
  }
  
  res.json({
    message: "Session Debug",
    sessionData: {
      email: req.session.email,
      testEmail: req.session.testEmail,
      sessionId: req.session.id,
      cookieExists: !!req.headers.cookie
    },
    headers: {
      userAgent: req.headers['user-agent'],
      cookie: req.headers.cookie
    },
    timestamp: new Date().toISOString()
  });
});

// Register
app.get("/register", (req, res) => res.render("register"));
app.post("/create", async (req, res) => {
  try {
    const { username, email, password, confirm_password, age } = req.body;
    
    // Validate password match
    if (password !== confirm_password) {
      return res.send(`
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #E74C3C;">❌ Password Mismatch</h2>
          <p>The passwords you entered do not match.</p>
          <a href="/register" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Try Again</a>
        </div>
      `);
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      if (existingUser.verified) {
        return res.send(`
          <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h2 style="color: #F39C12;">⚠️ Account Already Exists</h2>
            <p>An account with this email already exists and is verified.</p>
            <a href="/login" style="background: #27AE60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Login Instead</a>
            <a href="/register" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Use Different Email</a>
          </div>
        `);
      } else {
        // User exists but not verified - resend OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const newOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        
        existingUser.otp = newOtp;
        existingUser.otpExpiry = newOtpExpiry;
        await existingUser.save();
        
        req.session.email = email;
        console.log("💾 Session set for existing user:", { email, sessionId: req.session.id });
        
        console.log("🔄 Resending OTP to existing unverified user:", email);
        const emailResult = await sendOTPEmail(email, newOtp);
        
        if (!emailResult.success) {
          // Check if we're in development mode with console fallback
          if (emailResult.devMode) {
            return res.send(`
              <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; background: #FFF3CD; border: 1px solid #FFEAA7;">
                <h2 style="color: #856404;">🔧 Development Mode</h2>
                <p>Email service is not configured, but your OTP has been logged to the console.</p>
                <p><strong>Check the terminal/logs for your OTP code!</strong></p>
                <p><small><strong>Email:</strong> ${email}<br><strong>OTP Method:</strong> ${emailResult.method}</small></p>
                <a href="/verify-otp" style="background: #FFC107; color: #212529; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Continue to OTP Verification</a>
              </div>
            `);
          }
          
          return res.send(`
            <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
              <h2 style="color: #E74C3C;">📧 Email Service Error</h2>
              <p>Cannot send verification email at the moment.</p>
              <p><strong>Error:</strong> ${emailResult.error}</p>
              
              ${emailResult.suggestions ? `
                <div style="text-align: left; margin: 20px auto; max-width: 400px; background: #F8F9FA; padding: 15px; border-radius: 5px;">
                  <strong>💡 Possible Solutions:</strong>
                  <ul>
                    ${emailResult.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              <a href="/register" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Try Again</a>
              <a href="/debug-email" style="background: #6C757D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Debug Config</a>
            </div>
          `);
        }
        
        return res.redirect("/verify-otp");
      }
    }

    // Create new user
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("👤 Creating new user:", email);
    const newUser = await userModel.create({ 
      username, 
      email, 
      password: hashedPassword, 
      age, 
      otp, 
      otpExpiry, 
      verified: false 
    });

    req.session.email = email;
    console.log("💾 Session set for new user:", { email, sessionId: req.session.id });

    // Send OTP email
    console.log("📧 Sending OTP to new user:", email);
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      // Check if we're in development mode with console fallback
      if (emailResult.devMode) {
        console.log("🔧 Development mode - keeping user account despite email failure");
        return res.send(`
          <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; background: #FFF3CD; border: 1px solid #FFEAA7;">
            <h2 style="color: #856404;">🔧 Development Mode - Registration Complete!</h2>
            <p>Your account has been created successfully!</p>
            <p><strong>Email service is not configured, but your OTP has been logged to the console.</strong></p>
            <p><strong>Check the terminal/logs for your OTP code!</strong></p>
            <div style="background: #F8F9FA; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p><strong>📧 Email:</strong> ${email}</p>
              <p><strong>🔐 Method:</strong> ${emailResult.method}</p>
              <p><strong>💡 Tip:</strong> Check your terminal for the OTP code</p>
            </div>
            <a href="/verify-otp" style="background: #FFC107; color: #212529; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Continue to OTP Verification</a>
          </div>
        `);
      }
      
      console.error("❌ Email failed for new user - cleaning up");
      
      // Clean up the created user if email fails in production
      await userModel.deleteOne({ email });
      
      return res.send(`
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #E74C3C;">📧 Email Service Error</h2>
          <p>Account created but verification email could not be sent.</p>
          <p><strong>Technical Details:</strong> ${emailResult.error}</p>
          
          ${emailResult.suggestions ? `
            <div style="text-align: left; margin: 20px auto; max-width: 500px; background: #F8F9FA; padding: 15px; border-radius: 5px;">
              <strong>🔧 Troubleshooting Steps:</strong>
              <ul>
                ${emailResult.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <p><strong>The account has been removed. Please try registering again after fixing the email configuration.</strong></p>
          
          <div style="margin-top: 20px;">
            <a href="/register" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Try Again</a>
            <a href="/debug-email" style="background: #6C757D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Debug Email Config</a>
            <a href="/test-email?email=${encodeURIComponent(email)}" style="background: #17A2B8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Test Email</a>
          </div>
        </div>
      `);
    }

    console.log("✅ Registration successful - OTP sent to:", email);
    res.redirect("/verify-otp");
    
  } catch (error) {
    console.error("❌ Registration error:", error);
    
    // Provide more specific error messages
    if (error.code === 11000) {
      return res.send(`
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #F39C12;">⚠️ Email Already Registered</h2>
          <p>This email address is already registered.</p>
          <a href="/login" style="background: #27AE60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Login Instead</a>
          <a href="/register" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Use Different Email</a>
        </div>
      `);
    }
    
    res.send(`
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2 style="color: #E74C3C;">❌ Registration Error</h2>
        <p>Something went wrong during registration.</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <a href="/register" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Try Again</a>
      </div>
    `);
  }
});

// OTP Verification
app.get("/verify-otp", async (req, res) => {
  console.log("🔍 Session Debug Info:", {
    sessionExists: !!req.session,
    sessionEmail: req.session?.email,
    sessionId: req.session?.id,
    cookieSet: !!req.headers.cookie
  });
  
  if (!req.session.email) {
    console.log("❌ No email in session - redirecting to register");
    return res.send(`
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2 style="color: #E74C3C;">⏰ Session Issue</h2>
        <p>Your registration session is not available.</p>
        <p><small>Debug: Session email not found</small></p>
        <a href="/register" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Again</a>
      </div>
    `);
  }
  
  // Check if user exists and get their info for debugging
  const user = await userModel.findOne({ email: req.session.email });
  console.log("📋 OTP Verification page - User status:", {
    email: req.session.email,
    userExists: !!user,
    verified: user ? user.verified : 'N/A',
    hasOtp: user ? !!user.otp : 'N/A',
    otpExpiry: user ? user.otpExpiry : 'N/A'
  });
  
  res.render("verify-otp");
});

app.post("/verify-otp", async (req, res) => {
  try {
    const email = req.session.email;
    const user_otp = req.body.otp;
    
    console.log("🔐 OTP Verification attempt:", { email, providedOtp: user_otp });
    
    if (!email) {
      return res.send(`
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #E74C3C;">⏰ Session Expired</h2>
          <p>Your verification session has expired.</p>
          <a href="/register" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Again</a>
        </div>
      `);
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      console.log("❌ User not found during OTP verification:", email);
      return res.send(`
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #E74C3C;">👤 User Not Found</h2>
          <p>No user found with this email address.</p>
          <a href="/register" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Again</a>
        </div>
      `);
    }
    
    console.log("📋 User OTP verification details:", {
      userOtp: user.otp,
      providedOtp: user_otp,
      otpExpiry: user.otpExpiry,
      currentTime: new Date(),
      expired: user.otpExpiry < new Date()
    });
    
    if (user.otp !== user_otp) {
      console.log("❌ Invalid OTP provided");
      return res.send(`
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #E74C3C;">🔐 Invalid OTP</h2>
          <p>The OTP you entered is incorrect.</p>
          <p>Please check your email and try again.</p>
          <a href="/verify-otp" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Try Again</a>
        </div>
      `);
    }
    
    if (user.otpExpiry < new Date()) {
      console.log("❌ OTP expired");
      return res.send(`
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #F39C12;">⏰ OTP Expired</h2>
          <p>Your OTP has expired (valid for 10 minutes).</p>
          <p>Please register again to get a new OTP.</p>
          <a href="/register" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Again</a>
        </div>
      `);
    }

    // OTP is valid - verify the user
    user.verified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    req.session.email = null;

    console.log("✅ User verified successfully:", email);
    
    res.send(`
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2 style="color: #27AE60;">✅ Email Verified!</h2>
        <p>Your account has been successfully verified.</p>
        <p>You can now login to access your account.</p>
        <a href="/login" style="background: #27AE60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
      </div>
    `);
    
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    res.send(`
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2 style="color: #E74C3C;">❌ Verification Error</h2>
        <p>Something went wrong during verification.</p>
        <a href="/verify-otp" style="background: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Try Again</a>
      </div>
    `);
  }
});

// Login
app.get("/login", (req, res) => res.render("login"));
app.post("/login", async (req, res) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) return res.send("Something went wrong");

 bcrypt.compare(req.body.password, user.password, async (err, result) => {
  if (!result) return res.send("Invalid credentials");

  // Generate JWT for all users
  let token = jwt.sign({ email: user.email }, "shhhhhhh");
  res.cookie("token", token, { httpOnly: true });

  if (req.body.email === "admin@gmail.com") {
    res.render("admin_landing_page");
  } else {
    res.render("user_landing_page", { username: user.username });
  }
});

});

// Logout
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  req.session.testId = null; // clear testId on logout
  res.redirect("/");
});

// // Questions Page (Generate Test ID once per session)
// app.get("/questions", async (req, res) => {
//   if (!req.session.testId) req.session.testId = generateTestId();
//   const questions = await questionModel.find();
//   res.render("loggedin", { questions, testId: req.session.testId });
// });



// Utility: Generate ordered test questions per plan
const questionPlan = {
  1: { // 1-mark questions (Q1-60): English → Chemistry → Physics → Mathematics
    English: 12,      // Q1-12
    Chemistry: 14,    // Q13-26
    Physics: 14,      // Q27-40
    Mathematics: 20   // Q41-60
  },
  2: { // 2-mark questions (Q61-100): English → Chemistry → Physics → Mathematics  
    English: 4,       // Q61-64
    Chemistry: 8,     // Q65-72
    Physics: 13,      // Q73-85
    Mathematics: 15   // Q86-100
  }
};


async function getRandomQuestions(showLogs = false) {
  const selectedQuestions = [];
  
  if (showLogs) {
    console.log("\n📋 ORDERED QUESTION SELECTION PROCESS:");
    console.log("=" .repeat(60));
  }

  // 1️⃣ 1-mark questions (Questions 1-60) - Ordered by: English, Chemistry, Physics, Mathematics
  const oneMarkSubjects = ['English', 'Chemistry', 'Physics', 'Mathematics'];
  const oneMarkPlan = { English: 12, Chemistry: 14, Physics: 14, Mathematics: 20 };
  if (showLogs) console.log("\n📝 1-MARK QUESTIONS (Questions 1-60):");
  
  for (const subject of oneMarkSubjects) {
    const count = oneMarkPlan[subject];
    const questions = await questionModel.find({ subject, marks: 1 });
    const availableCount = Math.min(questions.length, count);
    const shuffled = questions.sort(() => Math.random() - 0.5); // Random selection within subject
    const selected = shuffled.slice(0, availableCount);
    
    if (showLogs) {
      console.log(`${subject.padEnd(12)}: Questions ${selectedQuestions.length + 1}-${selectedQuestions.length + selected.length} (${selected.length} from ${questions.length} available)`);
      console.log(`  📋 Sample: ${selected.map(q => `"${q.question.substring(0, 40)}..."`).slice(0, 2).join(', ')}${selected.length > 2 ? ` (and ${selected.length - 2} more)` : ''}`);
    }
    
    selectedQuestions.push(...selected);
  }

  // 2️⃣ 2-mark questions (Questions 61-100) - Ordered by: English, Chemistry, Physics, Mathematics
  const twoMarkSubjects = ['English', 'Chemistry', 'Physics', 'Mathematics'];
  const twoMarkPlan = { English: 4, Chemistry: 8, Physics: 13, Mathematics: 15 };
  if (showLogs) console.log("\n📝 2-MARK QUESTIONS (Questions 61-100):");
  
  for (const subject of twoMarkSubjects) {
    const count = twoMarkPlan[subject];
    const questions = await questionModel.find({ subject, marks: 2 });
    const availableCount = Math.min(questions.length, count);
    const shuffled = questions.sort(() => Math.random() - 0.5); // Random selection within subject
    const selected = shuffled.slice(0, availableCount);
    
    if (showLogs) {
      console.log(`${subject.padEnd(12)}: Questions ${selectedQuestions.length + 1}-${selectedQuestions.length + selected.length} (${selected.length} from ${questions.length} available)`);
      console.log(`  📋 Sample: ${selected.map(q => `"${q.question.substring(0, 40)}..."`).slice(0, 2).join(', ')}${selected.length > 2 ? ` (and ${selected.length - 2} more)` : ''}`);
    }
    
    selectedQuestions.push(...selected);
  }

  // NO final shuffle - maintain the ordered sequence
  
  if (showLogs) {
    console.log(`\n✅ FINAL SUMMARY: Selected ${selectedQuestions.length} questions in ordered sequence`);
    console.log("� Order: 1-12 English(1mk), 13-26 Chemistry(1mk), 27-40 Physics(1mk), 41-60 Math(1mk)");
    console.log("         61-64 English(2mk), 65-72 Chemistry(2mk), 73-85 Physics(2mk), 86-100 Math(2mk)");
    
    // Show final distribution with question numbers
    let questionNumber = 1;
    const sections = [
      { subject: 'English', marks: 1, count: 12 },
      { subject: 'Chemistry', marks: 1, count: 14 },
      { subject: 'Physics', marks: 1, count: 14 },
      { subject: 'Mathematics', marks: 1, count: 20 },
      { subject: 'English', marks: 2, count: 4 },
      { subject: 'Chemistry', marks: 2, count: 8 },
      { subject: 'Physics', marks: 2, count: 13 },
      { subject: 'Mathematics', marks: 2, count: 15 }
    ];
    
    console.log("\n📊 ORDERED DISTRIBUTION:");
    sections.forEach(section => {
      const startQ = questionNumber;
      const endQ = questionNumber + section.count - 1;
      console.log(`  Q${startQ.toString().padStart(2)}-Q${endQ.toString().padStart(2)}: ${section.subject} (${section.marks}-mark) - ${section.count} questions`);
      questionNumber += section.count;
    });
    
    console.log("=" .repeat(60));
  }
  
  return selectedQuestions;
}



// Route to render questions
app.get("/questions", async (req, res) => {
  try {
    if (!req.session.testId) req.session.testId = generateTestId();

    const questions = await getRandomQuestions();

    // Store selected question IDs in session
    req.session.questions = questions.map(q => q._id);

    res.render("loggedin", {
      questions,
      testId: req.session.testId
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching questions");
  }
});



// Create Question (Admin)
app.get("/createQuestions", protectRoute, (req, res) => res.render("admin_create_questions"));
app.post("/createquestion", async (req, res) => {
  const { subject, question, option1, option2, option3, option4, correctOption, marks, negativeMarks } = req.body;
  const createdQuestion = await questionModel.create({
    subject, question, options: [option1, option2, option3, option4], correctOption, marks, negativeMarks
  });
  res.send(createdQuestion);
});

// Upload Questions JSON
app.get("/admin_upload", protectRoute, (req, res) => res.render("admin_upload"));
app.post("/uploadQuestions", upload.single("questionFile"), async (req, res) => {
  const data = fs.readFileSync(req.file.path, "utf8");
  const questions = JSON.parse(data);
  await questionModel.insertMany(questions);
  res.render("admin_landing_page");
});

// Calculate Results (uses session-stored Test ID)
app.post("/calculateResults", async (req, res) => {
  try {
    // 1️⃣ Get logged-in user from JWT in cookie
    const token = req.cookies.token;
    if (!token) return res.send("You must be logged in to submit the test");

    const decoded = jwt.verify(token, "shhhhhhh"); // same secret as login
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) return res.send("User not found");

    // 2️⃣ Generate testId once per session if not already generated
    if (!req.session.testId) req.session.testId = generateTestId();
    const testId = req.session.testId;

    const answers = req.body.answers; // selected options array

    const questions = await questionModel.find({ _id: { $in: req.session.questions } });


    let totalPoints = 0, totalPossible = 0;
    const obtainedPerQuestion = [], tagsPerQuestion = [];

    for (let i = 0; i < questions.length; i++) {
      totalPossible += questions[i].marks;
      let obtained = 0;
      let tag = "";

      if (!answers[i]) tag = "Unanswered";
      else if (questions[i].correctOption == answers[i]) {
        obtained = questions[i].marks;
        tag = "Correct";
      } else {
        obtained = -questions[i].negativeMarks;
        tag = "Incorrect";
      }

      obtained = Math.round(obtained * 100) / 100;
      totalPoints += obtained;
      obtainedPerQuestion.push(obtained);
      tagsPerQuestion.push(tag);
    }

    totalPoints = Math.round(totalPoints * 100) / 100;

    // 3️⃣ Save test only once
    if (!req.session.testSaved) {
      await testModel.create({
        testId,
        userId: user._id,
        answers,
        obtainedPerQuestion,
        tagsPerQuestion,
        totalPoints,
        totalPossible,
        questions: questions.map(q => q._id)
      });
      req.session.testSaved = true;
    }

    // 4️⃣ Render result
    res.render("result", {
      answers,
      questions,
      obtainedPerQuestion,
      tagsPerQuestion,
      totalPoints,
      totalPossible,
      testId
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while calculating results");
  }
});

app.get("/my-results", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.send("You must be logged in to view results");

    const decoded = jwt.verify(token, "shhhhhhh");
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) return res.send("User not found");

    // Fetch all tests for this user
    const tests = await testModel.find({ userId: user._id })
      .populate("questions") // optional: populate question details
      .sort({ createdAt: -1 }); // most recent first

    res.render("my_results", { tests, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while fetching results");
  }
});



app.get("/results/:testId", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.send("You must be logged in to view results");

    const decoded = jwt.verify(token, "shhhhhhh");
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) return res.send("User not found");

    const test = await testModel.findOne({ testId: req.params.testId, userId: user._id })
      .populate("questions"); // optional for question details
    if (!test) return res.send("Test not found");

    res.render("detailed_result", { test });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while fetching detailed result");
  }
});



// Server
app.listen(5000, () => console.log("Running successfully on http://localhost:5000"));
