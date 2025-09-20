const mongoose = require("mongoose");


const questionSchema = mongoose.Schema({
  subject: String,
  question: String,
  options: [{ type: String }],
  correctOption: Number,
  marks: Number,
  negativeMarks: Number,
});

module.exports = mongoose.model("question", questionSchema);
