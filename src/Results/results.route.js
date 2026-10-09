const express = require("express");
const router = express.Router();
const resultsController = require("./results.controller");
const verifyRole = require("../middleware/verifyRole");
const { requireAuth } = require("../middleware/verifyToken");

router.use("/student", requireAuth, verifyRole("student"));

router.get("/student/results", resultsController.getStudentResults);
router.get("/student/results/print", resultsController.printStudentResults);

module.exports = router;
