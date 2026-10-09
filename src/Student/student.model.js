const connection = require("../config/dbConnection");
const bcrypt = require("bcrypt");

async function addStudent(
  admissionNumber,
  firstName,
  middleName,
  lastName,
  password,
  gender,
  dateOfBirth,
  classId,
  profilePic
) {
  try {
    const rawPassword = password || process.env.DEFAULT_STUDENT_PASSWORD || "Password123";
    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    const isDefaultPassword = rawPassword === (process.env.DEFAULT_STUDENT_PASSWORD || "Password123") ? 1 : 0;

    return new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO students(admission_number, first_name, middle_name, last_name, password, gender, date_of_birth, class_id, profile_pic, is_default_password) VALUES(?,?,?,?,?,?,?,?,?,?)`,
        [
          admissionNumber,
          firstName,
          middleName,
          lastName,
          hashedPassword,
          gender,
          dateOfBirth,
          classId,
          profilePic,
          isDefaultPassword,
        ],
        (err, student) => {
          if (err) return reject(err);
          resolve(student);
        }
      );
    });
  } catch (err) {
    throw err;
  }
}

// Get student By ID with class details
function getStudentById(studentId) {
  return new Promise((resolve, reject) => {
    connection.query(
      `
      SELECT 
        students.*,
        classes.class_name
      FROM students
      INNER JOIN classes
        ON students.class_id = classes.class_id
      WHERE students.student_id = ?
      `,
      [studentId],
      (err, student) => {
        if (err) return reject(err);
        resolve(student);
      }
    );
  });
}

// Get student by admission number
async function getStudentByAdmissionNumber(admissionNumber) {
  try {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM students WHERE admission_number = ?`,
        [admissionNumber],
        (err, student) => {
          if (err) return reject(err);
          resolve(student);
        }
      );
    });
  } catch (err) {
    throw err;
  }
}

// Update student profile picture
function updateStudentProfilePic(studentId, profilePic) {
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE students SET profile_pic = ? WHERE student_id = ?`,
      [profilePic, studentId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

// Update student password and set is_default_password to 0
function updateStudentPassword(studentId, newHashedPassword) {
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE students SET password = ?, is_default_password = 0 WHERE student_id = ?`,
      [newHashedPassword, studentId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

// Get student attendance metrics
function getStudentAttendance(studentId) {
  return new Promise((resolve, reject) => {
    connection.query(
      `
      SELECT * FROM attendance
      WHERE student_id = ?
      ORDER BY session_id DESC, term_id DESC
      LIMIT 1
      `,
      [studentId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? results[0] : { percentage: 90.0, remarks: "Good attendance!" });
      }
    );
  });
}

module.exports = {
  addStudent,
  getStudentByAdmissionNumber,
  getStudentById,
  updateStudentProfilePic,
  updateStudentPassword,
  getStudentAttendance,
};
