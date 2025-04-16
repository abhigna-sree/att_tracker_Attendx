const express = require('express');
const multer = require('multer');
const vendorController = require('../controllers/VendorController');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const uploadDir = path.join(__dirname, "uploads");

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/json") {
    cb(null, true);
  } else {
    cb(new Error("Only JSON files allowed!"), false);
  }
};
const upload = multer({ storage, fileFilter });
const Projectupload = multer({ storage });

// routes for login and register
router.post('/signup', vendorController.signup);
router.post('/login', vendorController.login);
router.get('/mentors', vendorController.mentors);
router.get('/projects', vendorController.projects);
router.post('/uploadusers', upload.single("file"), vendorController.uploadusers);
router.post('/createProject', Projectupload.single("projectImage"), vendorController.createProject);
router.post('/updatePwd',vendorController.updatePwd);
router.post('/apply',vendorController.apply);
router.put("/projects/:id", vendorController.updatepid);
router.get('/userprojects/:stuid', vendorController.getStudentProjects);
router.get('/getFacProjects/:facid', vendorController.getFacProjects);
router.get('/studentsRegistered/:pid', vendorController.studentsRegistered);
router.get('/students/:pid', vendorController.getStudents);
// router.get('/getAttendance', vendorController.getAttendance);
// router.post('/markAttendance', vendorController.markAttendance);
module.exports = router;