const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// model import
const User = require("./models/User");
const Project = require("./models/Projects");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
// In Express, serve images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose
  .connect("mongodb://localhost:27017/att_tracker", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Connection Error:", err));

// app.post("/signup", async (req, res) => {
//   try {
//     const { name, rollno, phone, password } = req.body;
//     if (!name || !rollno || !password) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({name,rollno,phone,password: hashedPassword,role: "student",});
//     res.status(201).json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.post("/login", async (req, res) => {
//   try {
//     const user = await User.findOne({ rollno: req.body.username });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(req.body.password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     let dashboard;
//     if (user.role === "student") {
//       dashboard = "/stuDashboard";
//     } else if (user.role === "faculty") {
//       dashboard = "/facultyDashboard";
//     } else if (user.role === "admin") {
//       dashboard = "/adminDashboard";
//     }

//     res.json({ message: "Login successful", role: user.role, dashboard });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// const verifyAdmin = (req, res, next) => {
//   if (req.user && req.user.role === "admin") {
//     next();
//   } else {
//     res.status(403).json({ error: "Access Denied" });
//   }
// };

// app.get("/mentors", async (req, res) => {
//   try {
//     const mentors = await User.find({ role: "faculty" }); 
//     res.json(mentors);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching mentors" });
//   }
// });

// app.get("/projects", verifyAdmin, async (req, res) => {
//   try {
//     const projects = await Project.find();
//     res.json(projects);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch projects" });
//   }
// });

// const uploadDir = path.join(__dirname, "uploads");

// const storage = multer.diskStorage({
//   destination: uploadDir,
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === "application/json") {
//     cb(null, true);
//   } else {
//     cb(new Error("Only JSON files allowed!"), false);
//   }
// };

// const upload = multer({ storage, fileFilter });
// const Projectupload = multer({ storage });

// app.post("/uploadusers", upload.single("file"), async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//       }
//       const filePath = req.file.path;
//       const fileData = await fs.promises.readFile(filePath, "utf-8");
//       try {
//         const jsonData = JSON.parse(fileData);
//         if (!Array.isArray(jsonData)) {
//           return res.status(400).json({ message: "Invalid JSON format" });
//         }
//           const userPromises = jsonData.map(async (user) => {
//           if (!user.name || !user.rollno || !user.password) {
//             console.warn("Skipping user due to missing fields:", user);
//             return null;
//           }
//           try {
//             const hashedPassword = await bcrypt.hash(user.password, 10);
//             return await User.findOneAndUpdate(
//               { rollno: user.rollno },
//               {
//                 name: user.name,
//                 rollno: user.rollno,
//                 phone: user.phone || "",
//                 password: hashedPassword,
//                 role: user.role || "student",
//                 Projects: Array.isArray(user.Projects) ? user.Projects : [],
//               },
//               { upsert: true, new: true }
//             );
//           } catch (hashError) {
//             console.error(`Error hashing password for ${user.name}:`, hashError);
//             return null;
//           }
//         });
//         const results = await Promise.all(userPromises);
//         const successfulUploads = results.filter((result) => result !== null);
  
//         res.json({
//           message: `Users uploaded successfully! (${successfulUploads.length}/${jsonData.length})`,
//         });
  
//       } catch (parseError) {
//         console.error("Error parsing JSON:", parseError);
//         res.status(400).json({ message: "Invalid JSON format" });
//       }
//     } catch (error) {
//       console.error("Error uploading users:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  

// // admin functions
// app.post("/createProject", Projectupload.single("projectImage"), async (req, res) => {
//   try {
//     const { pid, projectName, projectDesc, projectDeadline, executionStartDate, executionEndDate, projectSlots, mentor } = req.body;
//     const projectImage = req.file ? req.file.filename : null;
//     const project = await Project.create({pid,title: projectName,description: projectDesc,deadline: projectDeadline,executionStartDate,executionEndDate,slots: projectSlots,mentor,image: projectImage,});
//     res.status(201).json(project);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// Middleware setup
const vendorRoutes = require('./Routes/VendorRoutes');

app.use('/vendor', vendorRoutes);

// Home route
app.get('/home', (req, res) => {
    res.send('<h1>Attendance Tracker</h1>');
});
// app.use((req, res, next) => {
//     res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
//     res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
//     next();
//   });

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
  

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});