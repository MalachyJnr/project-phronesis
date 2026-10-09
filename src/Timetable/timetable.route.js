const express = require("express");
const router = express.Router();
const timetableController = require("./timetable.controller");
const verifyRole = require("../middleware/verifyRole");
const { requireAuth } = require("../middleware/verifyToken");

router.use("/student", requireAuth, verifyRole("student"));

router.get("/student/timetable", timetableController.getStudentTimetable);
router.get("/student/api/subject-details", timetableController.getSubjectDetailsAPI);

module.exports = router;
