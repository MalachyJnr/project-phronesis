const express = require("express");
const router = express.Router();
const announcementsController = require("./announcements.controller");

router.get("/announcements", announcementsController.getAnnouncements);
router.get("/student/announcements", announcementsController.getAnnouncements);

module.exports = router;
