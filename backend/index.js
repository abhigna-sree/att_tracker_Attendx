const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// model import
const User = require("./models/User");
const Project = require("./models/Projects");
const authenticate = require("./middleware/auth");
const Attendance = require("./models/Attendance");
const Student = require("./models/projectAssignment")

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
// app.use('/Routes/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/uploads', express.static(path.join(__dirname, 'Routes', 'uploads')));


mongoose
  .connect("mongodb+srv://abhignasree2006:abhi1301@cluster0.9azzabo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Connection Error:", err));


app.get("/userdetails/:id", authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      rollno: user.rollno,
      phone: user.phone,
      role: user.role,
      Projects: user.Projects, 
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware setup
const vendorRoutes = require('./Routes/VendorRoutes');

app.use('/vendor', vendorRoutes);

app.delete("/vendor/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting project" });
  }
});

app.put("/vendor/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProject = await Project.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: "Error updating project" });
  }
});

// attendance

app.get("/students/:pid", async (req, res) => {
  try {
    const students = await Student.find({ projectId: req.params.pid, role: "student" });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.get("/api/attendance/:pid/:date/:rollno", async (req, res) => {
  try {
    const { pid, date, rollno } = req.params;
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const records = await Attendance.find({
      pid,
      rollNo: rollno,
      date: { $gte: startOfDay, $lt: endOfDay },
    });
    if (records.length > 0) {
      return res.json(records[0]); // Return the single student's attendance
    } else {
      return res.status(200).json(null); // No attendance marked
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

app.get("/api/admin/active-attendance", async (req, res) => {
  try {
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    const projects = await Project.find({
      executionStartDate: { $lte: today }
    });
    const results = [];
    for (const project of projects) {
      const assignments = await Student.find({ projectId: project.pid });
      const studentData = [];
      for (const assign of assignments) {
        const attendance = await Attendance.findOne({
          pid: project.pid,
          rollNo: assign.rollNo,
          date: new Date(formattedToday),
        });
        studentData.push({
          rollNo: assign.rollNo,
          name: assign.name,
          attendanceStatus: attendance?.attendanceStatus || false,
        });
      }
      results.push({
        pid: project.pid,
        title: project.title,
        students: studentData,
      });
    }
    res.json(results);
  } catch (err) {
    console.error("Error in fetching admin attendance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/attendance", async (req, res) => {
  const { pid, date, classHours } = req.query;
  if (!pid || !date || !classHours) {
      return res.status(400).json({ error: "Missing query parameters" });
  }
  try {
      const classHoursArray = classHours.split(",").map(Number);
      const attendanceRecords = await Attendance.find({
          pid: pid,
          date: date,
          selectedClasses: { $in: classHoursArray }
      });
      if (!attendanceRecords.length) {
          return res.status(404).json({ error: "No attendance records found" });
      }
      res.json(attendanceRecords);
  } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/attendance", async (req, res) => {
  try {
    const { attendanceData } = req.body;
    if (!attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({ error: "No attendance data provided" });
    }
    const bulkOperations = attendanceData.map((entry) => ({
      updateOne: {
        filter: {
          rollNo: entry.rollNo,
          pid: entry.pid,
          date: entry.date,
          selectedClasses: entry.selectedClasses, // Ensure this is consistent
        },
        update: { $set: { attendanceStatus: entry.attendanceStatus } },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(bulkOperations);
    res.json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error inserting/updating attendance:", error);
    res.status(500).json({ error: "Failed to update attendance" });
  }
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});