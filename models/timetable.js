const connection = require("../config/dbConnection");

/**
 * Retrieve timetable entries for a specific class, joined with subjects and teachers.
 * Ordered chronologically by day and start time.
 * @param {number} classId 
 * @returns {Promise<Array>}
 */
function getTimetableByClassId(classId) {
  return new Promise((resolve, reject) => {
    connection.query(
      `
      SELECT 
        timetables.id,
        timetables.class_id,
        timetables.subject_id,
        timetables.teacher_id,
        timetables.day,
        timetables.start_time,
        timetables.end_time,
        timetables.room,
        subjects.subject_name,
        teachers.name AS teacher_name
      FROM timetables
      LEFT JOIN subjects
        ON timetables.subject_id = subjects.subject_id
      LEFT JOIN teachers
        ON timetables.teacher_id = teachers.teacher_id
      WHERE timetables.class_id = ?
      ORDER BY timetables.day, timetables.start_time
      `,
      [classId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

/**
 * Add a new timetable entry
 */
function addTimetableEntry(classId, subjectId, teacherId, day, startTime, endTime, room) {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO timetables (class_id, subject_id, teacher_id, day, start_time, end_time, room) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [classId, subjectId, teacherId, day, startTime, endTime, room],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

/**
 * Update an existing timetable entry
 */
function updateTimetableEntry(id, classId, subjectId, teacherId, day, startTime, endTime, room) {
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE timetables SET class_id = ?, subject_id = ?, teacher_id = ?, day = ?, start_time = ?, end_time = ?, room = ? WHERE id = ?`,
      [classId, subjectId, teacherId, day, startTime, endTime, room, id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

/**
 * Delete a timetable entry
 */
function deleteTimetableEntry(id) {
  return new Promise((resolve, reject) => {
    connection.query(
      `DELETE FROM timetables WHERE id = ?`,
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

module.exports = {
  getTimetableByClassId,
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry
};
