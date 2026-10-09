const connection = require("../config/dbConnection");

/**
 * Fetch all academic sessions
 * @returns {Promise<Array>}
 */
function getSessions() {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM sessions ORDER BY session_name DESC",
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

/**
 * Fetch all academic terms
 * @returns {Promise<Array>}
 */
function getTerms() {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM terms ORDER BY term_id ASC",
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

/**
 * Fetch the latest session and term for which a student has results
 * @param {number} studentId
 * @returns {Promise<Object|null>}
 */
function getLatestResultSessionAndTerm(studentId) {
  return new Promise((resolve, reject) => {
    connection.query(
      `
      SELECT session_id, term_id 
      FROM student_results 
      WHERE student_id = ? 
      ORDER BY session_id DESC, term_id DESC 
      LIMIT 1
      `,
      [studentId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? results[0] : null);
      }
    );
  });
}

/**
 * Fetch the student's result summary for a session and term
 * @param {number} studentId
 * @param {number} sessionId
 * @param {number} termId
 * @returns {Promise<Object|null>}
 */
function getResultSummary(studentId, sessionId, termId) {
  return new Promise((resolve, reject) => {
    connection.query(
      `
      SELECT 
        sr.*, 
        s.session_name, 
        t.term_name,
        c.class_name
      FROM student_results sr
      JOIN sessions s ON sr.session_id = s.session_id
      JOIN terms t ON sr.term_id = t.term_id
      JOIN classes c ON sr.class_id = c.class_id
      WHERE sr.student_id = ? AND sr.session_id = ? AND sr.term_id = ?
      `,
      [studentId, sessionId, termId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? results[0] : null);
      }
    );
  });
}

/**
 * Fetch the detailed subject breakdown for a given result summary ID
 * @param {number} resultId
 * @returns {Promise<Array>}
 */
function getSubjectResults(resultId) {
  return new Promise((resolve, reject) => {
    connection.query(
      `
      SELECT 
        rs.result_subject_id,
        rs.result_id,
        rs.subject_id,
        rs.ca_score,
        rs.mid_term_score,
        rs.exam_score,
        rs.total_score,
        rs.grade,
        rs.remarks AS subject_remarks,
        s.subject_name,
        t.name AS teacher_name
      FROM result_subjects rs
      JOIN subjects s ON rs.subject_id = s.subject_id
      LEFT JOIN student_results sr ON rs.result_id = sr.result_id
      LEFT JOIN subject_teachers st ON (st.subject_id = rs.subject_id AND st.class_id = sr.class_id)
      LEFT JOIN teachers t ON st.teacher_id = t.teacher_id
      WHERE rs.result_id = ?
      ORDER BY s.subject_name ASC
      `,
      [resultId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

module.exports = {
  getSessions,
  getTerms,
  getLatestResultSessionAndTerm,
  getResultSummary,
  getSubjectResults,
};
