const mongoose = require("mongoose");

mongoose.connect(`mongodb://127.0.0.1:27017/authtestapp`);

const questionSchema = mongoose.Schema({
  subject: String,
  question: String,
  options: [{ type: String }],
  correctOption: Number,
  marks: Number,
  negativeMarks: Number,
});

module.exports = mongoose.model("question", questionSchema);
