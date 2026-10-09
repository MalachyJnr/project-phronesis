const connection = require("../config/dbConnection");

/**
 * Fetch all assessments for a student's class with student specific submission status
 * @param {number} studentId 
 * @param {number} classId 
 * @returns {Promise<Array>}
 */
function getStudentAssessments(studentId, classId) {
  return new Promise((resolve, reject) => {
    connection.query(
      `
      SELECT 
        a.assessment_id,
        a.title,
        a.description,
        a.assessment_type,
        a.due_date,
        a.total_marks,
        s.subject_name,
        t.name AS teacher_name,
        COALESCE(sa.submission_status, 
          IF(a.due_date < NOW(), 'Overdue', 'Upcoming')
        ) AS status,
        sa.score,
        sa.feedback,
        sa.submission_date
      FROM assessments a
      JOIN subjects s ON a.subject_id = s.subject_id
      LEFT JOIN teachers t ON a.teacher_id = t.teacher_id
      LEFT JOIN student_assessments sa ON (sa.assessment_id = a.assessment_id AND sa.student_id = ?)
      WHERE a.class_id = ?
      ORDER BY a.due_date ASC
      `,
      [studentId, classId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

/**
 * Get summary counts for student assessments (Pending, Upcoming, Completed, Overdue)
 * @param {number} studentId 
 * @param {number} classId 
 * @returns {Promise<Object>}
 */
function getAssessmentSummary(studentId, classId) {
  return new Promise((resolve, reject) => {
    getStudentAssessments(studentId, classId)
      .then((items) => {
        const pendingCount = items.filter((i) => i.status === "Pending" || i.status === "Upcoming").length;
        const upcomingThisWeekCount = items.filter((i) => i.status === "Upcoming" || i.status === "Pending").length;
        const completedCount = items.filter((i) => i.status === "Completed").length;
        const overdueCount = items.filter((i) => i.status === "Overdue").length;

        resolve({
          pending: pendingCount,
          upcomingThisWeek: upcomingThisWeekCount,
          completed: completedCount,
          overdue: overdueCount,
          total: items.length,
        });
      })
      .catch(reject);
  });
}

module.exports = {
  getStudentAssessments,
  getAssessmentSummary,
};
