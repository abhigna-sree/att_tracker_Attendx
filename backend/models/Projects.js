const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  pid: { type: String, required: true, unique:true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  executionStartDate: { type: Date, required: true },
  executionEndDate: { type: Date, required: true },
  slots: { type: Number, required: true, min: 1 },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", projectSchema);
