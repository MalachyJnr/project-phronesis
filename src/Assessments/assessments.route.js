const express = require("express");
const router = express.Router();
const assessmentsController = require("./assessments.controller");
const verifyRole = require("../middleware/verifyRole");
const { requireAuth } = require("../middleware/verifyToken");

router.use("/student", requireAuth, verifyRole("student"));

router.get("/student/assessments", assessmentsController.getStudentAssessments);

module.exports = router;
