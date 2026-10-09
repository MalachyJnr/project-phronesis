const express = require("express");
const router = express.Router();
const paymentsController = require("./payments.controller");
const verifyRole = require("../middleware/verifyRole");
const { requireAuth } = require("../middleware/verifyToken");

router.use("/student", requireAuth, verifyRole("student"));

router.get("/student/payments", paymentsController.getStudentPayments);

module.exports = router;
