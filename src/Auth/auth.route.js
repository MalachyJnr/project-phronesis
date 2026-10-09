const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const loginLimiter = require("../middleware/loginLimiter");

router
  .route("/login/student")
  .get(authController.getStudentLogin)
  .post(loginLimiter, authController.postStudentLogin);

router.get("/student/logout", authController.getStudentLogout);

module.exports = router;
