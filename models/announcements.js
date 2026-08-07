const connection = require("../config/dbConnection");

/**
 * Fetch latest school announcements ordered chronologically
 * @param {number} limit 
 * @returns {Promise<Array>}
 */
function getLatestAnnouncements(limit = 5) {
  return new Promise((resolve, reject) => {
    connection.query(
      `
      SELECT 
        announcement_id,
        title,
        content,
        category,
        publish_date,
        author
      FROM announcements
      ORDER BY publish_date DESC, announcement_id DESC
      LIMIT ?
      `,
      [limit],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

module.exports = {
  getLatestAnnouncements
};
