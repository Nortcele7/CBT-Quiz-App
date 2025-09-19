const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const fs = require("fs")

const multer = require("multer")

const app = express();

const userModel = require("./models/user");

const questionModel = require("./models/questions");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const upload = multer({dest: "public/uploads/"})

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/create", (req, res) => {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(req.body.password, salt, async function (err, hash) {
      // Store hash in your password DB.
      const hashedPassword = hash;

      let createdUser = await userModel.create({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        age: req.body.age,
      });

      const email = req.body.email;

      let token = jwt.sign({ email }, "shhhhhhh");
      res.cookie("token", token);

      res.redirect("/login");
    });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return res.send("Something went wrong");
  }

  //After Login we must set up jwt
  bcrypt.compare(
    req.body.password,
    user.password,
    async function (err, result) {
      if (result == true && req.body.email == "admin@gmail.com") {
        let token = jwt.sign({ email: user.email }, "shhhhhhh");
        res.cookie("token", token);
        res.render("admin_landing_page");
      } else if (result) {
        let token = jwt.sign({ email: user.email }, "shhhhhhh");
        res.cookie("token", token);

        let questions = await questionModel.find();

        res.render("loggedin", { questions });
      } else {
        res.send("Something went wrong");
      }
    }
  );
});

// cookie delete garepachi logout garna milcha
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.post("/createquestion", async (req, res) => {
  let {
    subject,
    question,
    option1,
    option2,
    option3,
    option4,
    correctOption,
    marks,
    negativeMarks,
  } = req.body;

  let createdQuestion = await questionModel.create({
    subject,
    question,
    options: [option1, option2, option3, option4],
    correctOption,
    marks,
    negativeMarks,
  });

  res.send(createdQuestion);
});

app.post("/calculateResults", async (req, res) => {
  const answers = req.body.answers;

  let questions = await questionModel.find();

  res.render("result", { answers, questions });
});

app.get("/createQuestions",(req,res)=>{
  res.render("admin_create_questions")
})

app.get("/admin_upload",(req,res)=>{
  res.render("admin_upload")
})

app.post("/uploadQuestions", upload.single("questionFile") , async(req,res)=>{
    // 1. Get uploaded file path
  const filePath = req.file.path;

  // 2. Read the file
  const data = fs.readFileSync(filePath, "utf8");

  // 3. Parse JSON
  const questions = JSON.parse(data); // assuming the JSON is an array of questions

  // 4. Insert into MongoDB
  await questionModel.insertMany(questions);

  res.render("admin_landing_page");
})


app.listen(3000, () => {
  console.log("Running successfully on http://localhost:3000");
});
