const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    rollNo: String,
    pid: String,
    selectedClasses: [Number],
    attendanceStatus: Boolean,
    date: { type: Date, required: true }
  });  

module.exports = mongoose.model('Attendance', attendanceSchema);
