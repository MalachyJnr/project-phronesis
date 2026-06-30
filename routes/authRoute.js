const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");


router
  .route("/login/student")
  .get(authController.getStudentLogin)
  .post(authController.postStudentLogin);

router.get("/student/logout", authController.getStudentLogout);

module.exports = router;    