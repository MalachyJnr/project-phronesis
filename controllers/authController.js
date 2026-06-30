const studentModel = require("../models/student");

// Utility login handler
const handleLogin = require("../utils/handleLogin");

//render student login page
const getStudentLogin = (req, res) => {
    res.render("auth/student-login");
}

// Post Student login
const postStudentLogin = (req, res) => {
  const { admissionNumber, password } = req.body;

  handleLogin(
    admissionNumber,
    password,
    "student",
    studentModel.getStudentByAdmissionNumber,
    "student_id",
    res,
  );
};


// Student Logout
const getStudentLogout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login/student");
};

module.exports = { getStudentLogin, postStudentLogin, getStudentLogout };
