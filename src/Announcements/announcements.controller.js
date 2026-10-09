const announcementsModel = require("./announcements.model");

const getAnnouncements = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
    const announcements = await announcementsModel.getLatestAnnouncements(limit);

    res.json({
      success: true,
      announcements: announcements,
    });
  } catch (error) {
    console.error("[announcementsController] Error in getAnnouncements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements.",
    });
  }
};

module.exports = {
  getAnnouncements,
};
