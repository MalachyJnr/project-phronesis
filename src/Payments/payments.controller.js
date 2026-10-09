const paymentsModel = require("./payments.model");
const studentModel = require("../Student/student.model");

const getStudentPayments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const getStudent = await studentModel.getStudentById(studentId);
    const student = getStudent[0];

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const [payments, paymentSummary] = await Promise.all([
      paymentsModel.getStudentPayments(studentId),
      paymentsModel.getPaymentStatusSummary(studentId),
    ]);

    res.json({
      success: true,
      pageTitle: "Fees & Payments",
      user: student,
      role: "student",
      payments: payments,
      paymentSummary: paymentSummary,
    });
  } catch (error) {
    console.error("[paymentsController] Error in getStudentPayments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student payments.",
    });
  }
};

module.exports = {
  getStudentPayments,
};
