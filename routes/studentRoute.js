const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const verifyRole = require("../middlewares/verifyRole");
const { requireAuth } = require("../middlewares/verifyToken");

router.use("/student", requireAuth, verifyRole("student"));

router.route("/student/dashboard").get(studentController.getStudentDashboard);

router.get("/student/results", studentController.getStudentResults);
router.get("/student/results/print", studentController.printStudentResults);
router.get("/student/timetable", studentController.getStudentTimetable);
router.get("/student/assessments", studentController.getStudentAssessments);
router.get("/student/payments", studentController.getStudentPayments);
router.get("/student/settings", studentController.getStudentSettings);
router.get("/student/profile", studentController.getStudentProfile);
router.post("/student/profile/upload-pic", studentController.uploadProfilePic);
router.post("/student/change-password", studentController.changePassword);
router.get("/student/api/subject-details", studentController.getSubjectDetailsAPI);

module.exports = router;


