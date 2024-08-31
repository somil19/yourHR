const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  profileImage: {
    type: String,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  college_name: {
    type: String,
    default: "",
  },
  education: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: [],
  },
  resume: {
    type: String, // Stores the file path of the uploaded resume
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("user", userSchema);

module.exports = User;
