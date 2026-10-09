const studentModel = require("./student.model");
const timetableModel = require("../Timetable/timetable.model");
const resultsModel = require("../Results/results.model");
const assessmentsModel = require("../Assessments/assessments.model");
const paymentsModel = require("../Payments/payments.model");
const announcementsModel = require("../Announcements/announcements.model");
const upload = require("../middleware/multer");
const { formatTimetableEntries } = require("../utils/formatTimetable");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

// Helper to render student views / return JSON payload
const renderStudentView = async (req, res, viewName, pageTitle) => {
  try {
    const getStudent = await studentModel.getStudentById(req.user.id);
    const student = getStudent[0];

    if (!student) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        title: "Student Not Found",
        message: "We could not find your student record.",
      });
    }

    let timetableDataGrouped = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    if (viewName === "home-dashboard" || viewName === "timetable") {
      const dbEntries = await timetableModel.getTimetableByClassId(student.class_id);
      timetableDataGrouped = formatTimetableEntries(dbEntries);
    }

    res.json({
      success: true,
      pageTitle: pageTitle,
      view: viewName,
      user: student,
      role: "student",
      timetableDataGrouped: timetableDataGrouped,
    });
  } catch (error) {
    console.error(`[studentController] Error handling "${viewName}":`, error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      title: "Something Went Wrong",
      message: "We encountered an unexpected problem processing your request.",
    });
  }
};

const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    const getStudent = await studentModel.getStudentById(studentId);
    const student = getStudent[0];

    if (!student) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        title: "Student Not Found",
        message: "We could not find your student record.",
      });
    }

    // Parallel data loading from database
    const [
      attendance,
      latestSessionTerm,
      paymentSummary,
      announcements,
      assessmentsSummary,
      dbEntries,
    ] = await Promise.all([
      studentModel.getStudentAttendance(studentId),
      resultsModel.getLatestResultSessionAndTerm(studentId),
      paymentsModel.getPaymentStatusSummary(studentId),
      announcementsModel.getLatestAnnouncements(3),
      assessmentsModel.getAssessmentSummary(studentId, student.class_id),
      timetableModel.getTimetableByClassId(student.class_id),
    ]);

    let resultSummary = null;
    if (latestSessionTerm) {
      resultSummary = await resultsModel.getResultSummary(
        studentId,
        latestSessionTerm.session_id,
        latestSessionTerm.term_id
      );
    }

    const timetableDataGrouped = formatTimetableEntries(dbEntries);

    res.json({
      success: true,
      pageTitle: "Student Dashboard",
      user: student,
      role: "student",
      attendance: attendance,
      resultSummary: resultSummary,
      paymentSummary: paymentSummary,
      announcements: announcements,
      assessmentsSummary: assessmentsSummary,
      timetableDataGrouped: timetableDataGrouped,
    });
  } catch (error) {
    console.error("[studentController] Error in getStudentDashboard:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      title: "Something Went Wrong",
      message: "We encountered an error loading your dashboard data.",
    });
  }
};

const getStudentSettings = (req, res) => {
  renderStudentView(req, res, "settings", "Settings");
};

const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const getStudent = await studentModel.getStudentById(studentId);
    const student = getStudent[0];

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const [attendance, latestSessionTerm] = await Promise.all([
      studentModel.getStudentAttendance(studentId),
      resultsModel.getLatestResultSessionAndTerm(studentId),
    ]);

    let resultSummary = null;
    if (latestSessionTerm) {
      resultSummary = await resultsModel.getResultSummary(
        studentId,
        latestSessionTerm.session_id,
        latestSessionTerm.term_id
      );
    }

    res.json({
      success: true,
      pageTitle: "Student Profile",
      user: student,
      role: "student",
      attendance: attendance,
      resultSummary: resultSummary,
    });
  } catch (error) {
    console.error("[studentController] Error in getStudentProfile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student profile.",
    });
  }
};

// Handle student profile image upload
const uploadSingle = upload.single("profile_pic");

const uploadProfilePic = (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      let message = "An error occurred during file upload.";
      if (err.code === "LIMIT_FILE_SIZE") {
        message = "File is too large. Maximum size allowed is 5MB.";
      } else if (err.code === "INVALID_FILE_TYPE") {
        message = err.message;
      }
      return res.status(400).json({ success: false, message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file was selected." });
    }

    try {
      const studentId = req.user.id;
      const newFilename = req.file.filename;

      const getStudent = await studentModel.getStudentById(studentId);
      const student = getStudent[0];
      const oldProfilePic = student ? student.profile_pic : null;

      await studentModel.updateStudentProfilePic(studentId, newFilename);

      if (oldProfilePic) {
        const oldPath = path.resolve(__dirname, "../../frontend/uploads", oldProfilePic);
        fs.unlink(oldPath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== "ENOENT") {
            console.error("[studentController] Failed to delete old profile picture:", unlinkErr);
          }
        });
      }

      return res.json({
        success: true,
        message: "Profile picture updated successfully.",
        filePath: `/uploads/${newFilename}`,
      });
    } catch (dbErr) {
      console.error("[studentController] Database error updating profile pic:", dbErr);
      return res.status(500).json({
        success: false,
        message: "Failed to save profile picture in the database.",
      });
    }
  });
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const studentId = req.user.id;

    // 1. Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all password fields.",
      });
    }

    // 2. Validate password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation password do not match.",
      });
    }

    // 3. Enforce password complexity (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.",
      });
    }

    // 4. Fetch student details from database
    const getStudent = await studentModel.getStudentById(studentId);
    const student = getStudent[0];

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student account not found.",
      });
    }

    // 5. Verify current password matches
    const isCurrentMatch = await bcrypt.compare(currentPassword, student.password);
    if (!isCurrentMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password. Please check and try again.",
      });
    }

    // 6. Prevent setting new password to the same current password
    const isSameAsCurrent = await bcrypt.compare(newPassword, student.password);
    if (isSameAsCurrent) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as your current password.",
      });
    }

    // 7. Hash new password & update database
    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    await studentModel.updateStudentPassword(studentId, newHashedPassword);

    // 8. Invalidate session / cookie
    res.clearCookie("token");
    return res.json({
      success: true,
      message: "Password changed successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("[studentController] Error in changePassword:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while updating your password. Please try again.",
    });
  }
};

module.exports = {
  getStudentDashboard,
  getStudentSettings,
  getStudentProfile,
  uploadProfilePic,
  changePassword,
  renderStudentView,
};
