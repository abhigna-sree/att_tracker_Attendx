const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollno: { type: String, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
    dept: { type: String, required: true },
    section: { type: String, required: true }
});

module.exports = mongoose.model("User", userSchema);
