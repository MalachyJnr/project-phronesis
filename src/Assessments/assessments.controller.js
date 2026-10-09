const assessmentsModel = require("./assessments.model");
const studentModel = require("../Student/student.model");

const getStudentAssessments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const getStudent = await studentModel.getStudentById(studentId);
    const student = getStudent[0];

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const [assessments, summary] = await Promise.all([
      assessmentsModel.getStudentAssessments(studentId, student.class_id),
      assessmentsModel.getAssessmentSummary(studentId, student.class_id),
    ]);

    res.json({
      success: true,
      pageTitle: "Assessments",
      user: student,
      role: "student",
      assessments: assessments,
      summary: summary,
    });
  } catch (error) {
    console.error("[assessmentsController] Error in getStudentAssessments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student assessments.",
    });
  }
};

module.exports = {
  getStudentAssessments,
};
