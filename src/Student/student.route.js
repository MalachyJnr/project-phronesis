const express = require("express");
const router = express.Router();
const studentController = require("./student.controller");
const verifyRole = require("../middleware/verifyRole");
const { requireAuth } = require("../middleware/verifyToken");

router.use("/student", requireAuth, verifyRole("student"));

router.get("/student/dashboard", studentController.getStudentDashboard);
router.get("/student/settings", studentController.getStudentSettings);
router.get("/student/profile", studentController.getStudentProfile);
router.post("/student/profile/upload-pic", studentController.uploadProfilePic);
router.post("/student/change-password", studentController.changePassword);

module.exports = router;
