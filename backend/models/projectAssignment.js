const mongoose = require("mongoose");

const projectAssignmentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true }, // Unique roll number for students
  projectId: { type: String, required: true }, // Project ID instead of ObjectId
  teamId: { type: String, default: null }, // Null for mentors
  role: { type: String, enum: ["student", "faculty"], required: true },
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ProjectAssignment", projectAssignmentSchema);
