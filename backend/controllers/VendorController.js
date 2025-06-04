const User = require("../models/User");
const Project = require("../models/Projects");
const ProjectAssignment = require("../models/projectAssignment");
const Attendance = require("../models/Attendance");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

dotenv.config();
const fs = require("fs");
const projectAssignment = require("../models/projectAssignment");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, rollno: user.rollno, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
const signup = async (req, res) => {
  try {
    const { name, rollno, phone, password, dept, section } = req.body;
    if (!name || !rollno || !password || !dept || !section) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const RollNoVerify = await User.findOne({ rollno });
    if (RollNoVerify) {
      return res.status(400).json({ msg: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      rollno,
      phone,
      password: hashedPassword,
      dept,
      section,
      role: "student",
    });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ user, token, success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};

const login = async (req, res) => {
  try {
    const user = await User.findOne({ rollno: req.body.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    // const token = jwt.sign({id: user._id, role: user.role}, secretkey, { expiresIn: "1h"});
    // const vendorid = user._id;
    let dashboard;
    if (user.role === "student") {
      dashboard = "/stuDashboard";
    } else if (user.role === "faculty") {
      dashboard = "/facultyDashboard";
    } else if (user.role === "admin") {
      dashboard = "/adminDashboard";
    }

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      dashboard,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePwd = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  // Validate input
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate that the user making the request matches the userId
  if (req.user.id !== userId) {
    return res
      .status(403)
      .json({ message: "Unauthorized to update this user's password" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({
          message: "New password must be different from current password",
        });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Password update error:", error);
    res
      .status(500)
      .json({ message: "Error updating password. Please try again." });
  }
};

const mentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "faculty" });
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ error: "Error fetching mentors" });
  }
};

const projects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

const apply = async (req, res) => {
  const { projectId, teamMembers } = req.body;

  if (!projectId || !Array.isArray(teamMembers) || teamMembers.length !== 3) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const ifstudent = await User.find({ rollno: { $in: teamMembers } });
    const foundRolls = ifstudent.map((user) => user.rollno);
    const missingRolls = teamMembers.filter(
      (rollNo) => !foundRolls.includes(rollNo)
    );

    if (missingRolls.length > 0) {
      return res
        .status(400)
        .json({
          message: `Student(s) ${missingRolls.join(", ")} do not exist`,
        });
    }
    const existingApplications = await ProjectAssignment.find({
      rollNo: { $in: teamMembers },
    });

    if (existingApplications.length > 0) {
      const appliedRollNos = existingApplications.map((app) => app.rollNo);
      const duplicateMembers = teamMembers.filter((rollNo) =>
        appliedRollNos.includes(rollNo)
      );

      return res.status(400).json({
        message: `Team member(s) ${duplicateMembers.join(
          ", "
        )} have already applied for another project.`,
      });
    }
    const project = await Project.findOne({ pid: projectId });
    if (!project || project.slots <= 0) {
      return res
        .status(400)
        .json({ message: "No slots available for this project." });
    }
    project.slots -= 1;
    await project.save();

    // const teamId = uuidv4();
    const teamId = uuidv4().split("-")[0];
    const assignments = teamMembers.map((rollNo) => ({
      rollNo,
      projectId,
      teamId,
      role: "student",
    }));

    await ProjectAssignment.insertMany(assignments);

    res
      .status(201)
      .json({ message: "Application submitted successfully!", teamId });
  } catch (error) {
    console.error("Error applying for project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getStudentProjects = async (req, res) => {
  const { stuid } = req.params;
  try {
    const assignments = await ProjectAssignment.find({ rollNo: stuid });
    if (!assignments || assignments.length === 0) {
      return res
        .status(404)
        .json({ message: "No project assignments found for this student." });
    }
    const projectIds = assignments.map((assignment) => assignment.projectId);
    const projects = await Project.find({ pid: { $in: projectIds } });
    const studentProjects = assignments
      .map((assignment) => {
        const project = projects.find(
          (p) => p.pid.toString() === assignment.projectId.toString()
        );
        if (!project) {
          console.error(
            `Project not found for assignment with projectId: ${assignment.projectId}`
          );
          return null;
        }
        return {
          pid: project.pid,
          title: project.title,
          description: project.description,
          mentor: project.mentor,
          executionStartDate: project.executionStartDate,
          executionEndDate: project.executionEndDate,
          teamId: assignment.teamId,
        };
      })
      .filter((project) => project !== null);
    if (studentProjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No valid projects found for this student." });
    }
    res.status(200).json(studentProjects);
  } catch (error) {
    console.error("Error fetching student projects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updatepid = async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Error updating project" });
  }
};

const uploadusers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const filePath = req.file.path;
    const fileData = await fs.promises.readFile(filePath, "utf-8");
    try {
      const jsonData = JSON.parse(fileData);
      if (!Array.isArray(jsonData)) {
        return res.status(400).json({ message: "Invalid JSON format" });
      }
      const userPromises = jsonData.map(async (user) => {
        if (!user.name || !user.rollno || !user.password) {
          console.warn("Skipping user due to missing fields:", user);
          return null;
        }
        try {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          return await User.findOneAndUpdate(
            { rollno: user.rollno },
            {
              name: user.name,
              rollno: user.rollno,
              phone: user.phone || "",
              password: hashedPassword,
              role: user.role || "student",
            },
            { upsert: true, new: true }
          );
        } catch (hashError) {
          console.error(`Error hashing password for ${user.name}:`, hashError);
          return null;
        }
      });
      const results = await Promise.all(userPromises);
      const successfulUploads = results.filter((result) => result !== null);

      res.json({
        message: `Users uploaded successfully! (${successfulUploads.length}/${jsonData.length})`,
      });
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      res.status(400).json({ message: "Invalid JSON format" });
    }
  } catch (error) {
    console.error("Error uploading users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// admin functions
const createProject = async (req, res) => {
  try {
    const {
      pid,
      projectName,
      projectDesc,
      projectDeadline,
      executionStartDate,
      executionEndDate,
      projectSlots,
      mentor,
    } = req.body;
    console.log(
      pid,
      projectName,
      projectDesc,
      projectDeadline,
      executionStartDate,
      executionEndDate,
      projectSlots,
      mentor
    );
    const projectImage = req.file ? req.file.filename : null;
    const project = await Project.create({
      pid: pid,
      title: projectName,
      description: projectDesc,
      deadline: projectDeadline,
      executionStartDate,
      executionEndDate,
      slots: projectSlots,
      mentor,
      image: projectImage,
    });
    const mentorData = await User.findById(mentor);
    if (!mentorData) {
      return res.status(404).json({ error: "Mentor not found" });
    }
    await ProjectAssignment.create({
      rollNo: mentorData.rollno,
      projectId: pid,
      teamId: null,
      role: "faculty",
    });
    res.status(201).json(project);
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: err.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    if (!Array.isArray(projects)) {
      return res.status(500).json({ error: "Invalid data format" });
    }
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getFacProjects = async (req, res) => {
  const { facid } = req.params;
  try {
    const assignments = await ProjectAssignment.find({ rollNo: facid });
    if (!assignments || assignments.length === 0) {
      return res
        .status(404)
        .json({ message: "No project assignments found for this Mentor." });
    }
    const projectIds = assignments.map((assignment) => assignment.projectId);
    const projects = await Project.find({ pid: { $in: projectIds } });
    const studentProjects = assignments
      .map((assignment) => {
        const project = projects.find(
          (p) => p.pid.toString() === assignment.projectId.toString()
        );
        if (!project) {
          console.error(
            `Project not found for assignment with projectId: ${assignment.projectId}`
          );
          return null;
        }
        return {
          pid: project.pid,
          title: project.title,
          description: project.description,
          executionStartDate: project.executionStartDate,
          executionEndDate: project.executionEndDate,
          slots: project.slots,
        };
      })
      .filter((project) => project !== null);
    if (studentProjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No valid projects found for this student." });
    }
    res.status(200).json(studentProjects);
  } catch (error) {
    console.error("Error fetching student projects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const studentsRegistered = async (req, res) => {
  try {
    const { pid } = req.params;
    const students = await projectAssignment.find({
      projectId: pid,
      role: "student",
    });
    if (!students.length) {
      return res
        .status(404)
        .json({ message: "No students registered for this project." });
    }
    const studentDetails = await Promise.all(
      students.map(async (student) => {
        const user = await User.findOne({ rollno: student.rollNo }); // Assuming rollno exists in User model
        return {
          rollno: student.rollNo,
          name: user ? user.name : "Unknown",
          department: user ? user.dept : "Unknown",
        };
      })
    );
    res.status(200).json(studentDetails);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Error fetching students" });
  }
};

const markAttendance = async (req, res) => {
  try {
    console.log("entered");
    const { pid, selectedHours, attendance } = req.body; // Extract data

    if (!attendance || typeof attendance !== "object") {
      return res.status(400).json({ error: "Invalid attendance data format" });
    }
    const attendanceArray = Object.keys(attendance).map((studentId) => ({
      studentId,
      projectId: pid,
      selectedClasses: selectedHours, // Store selected class hours
      attendanceStatus: attendance[studentId], // 'present' or 'absent'
      date: new Date(), // Store current date
    }));

    await Attendance.insertMany(attendanceArray, { ordered: false });
    res.json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update attendance" });
  }
};

const getAttendance = async (req, res) => {
  const { projectID, date, classHours } = req.query;

  if (!projectID || !date || !classHours) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  try {
    const attendanceRecords = await Attendance.find({
      projectId: projectID,
      date: date,
      selectedClasses: { $in: classHours.split(",") }, // Ensure classHours is processed correctly
    });

    if (!attendanceRecords.length) {
      return res.status(404).json({ error: "No attendance records found" });
    }

    res.json(attendanceRecords);
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// attednance
const getStudents = async (req, res) => {
  try {
    console.log("entered");
    const students = await projectAssignment.find({
      projectId: req.params.pid,
    });
    console.log(students);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

module.exports = {
  login,
  signup,
  updatePwd,
  uploadusers,
  projects,
  mentors,
  createProject,
  updatepid,
  getProjects,
  apply,
  getStudentProjects,
  getFacProjects,
  studentsRegistered,
  markAttendance,
  getAttendance,
  getStudents,
};
