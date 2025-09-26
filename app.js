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
  cookie: { maxAge: 10 * 60 * 1000 }
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

// --- OTP Email Function ---
async function sendOTPEmail(email, otp) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false }
  });

  let info = await transporter.sendMail({
    from: `"Cohesion" <no-reply@yourdomain.com>`,
    to: email,
    subject: "OTP Verification for Cohesion",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2E86C1;">Cohesion - OTP Verification</h2>
        <p>Your <strong>One-Time Password (OTP)</strong> for verification is:</p>
        <p style="font-size: 20px; font-weight: bold; color: #E74C3C;">${otp}</p>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      </div>
    `
  });

  console.log("OTP email sent:", info.messageId);
}

// --- Routes ---

// Home
app.get("/", (req, res) => res.render("start"));

// Register
app.get("/register", (req, res) => res.render("register"));
app.post("/create", async (req, res) => {
  const { username, email, password, confirm_password, age } = req.body;
  if (password !== confirm_password) return res.send("Passwords do not match");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  const hashedPassword = await bcrypt.hash(password, 10);

  await userModel.create({ username, email, password: hashedPassword, age, otp, otpExpiry, verified: false });
  req.session.email = email;

  await sendOTPEmail(email, otp);
  res.redirect("/verify-otp");
});

// OTP Verification
app.get("/verify-otp", (req, res) => {
  if (!req.session.email) return res.send("Session expired. Please register again.");
  res.render("verify-otp");
});

app.post("/verify-otp", async (req, res) => {
  const email = req.session.email;
  const user_otp = req.body.otp;
  if (!email) return res.send("Session expired. Please register again.");

  const user = await userModel.findOne({ email });
  if (!user) return res.send("User not found");
  if (user.otp !== user_otp) return res.send("Invalid OTP");
  if (user.otpExpiry < new Date()) return res.send("OTP expired");

  user.verified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();
  req.session.email = null;

  res.send("✅ OTP verified! You can now login.");
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
