const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // matches your user model name
    required: false, // can make true when user system is enforced
  },
  answers: {
    type: [String],
    required: true,
  },
  obtainedPerQuestion: {
    type: [Number],
    required: true,
  },
  tagsPerQuestion: {
    type: [String],
    enum: ["Correct", "Incorrect", "Unanswered"],
    required: true,
  },
  totalPoints: {
    type: Number,
    required: true,
  },
  totalPossible: {
    type: Number,
    required: true,
  },
  questions: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "question",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("test", testSchema);
