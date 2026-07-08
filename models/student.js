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
  profilePic,
) {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    return new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO students(admission_number, first_name, middle_name, last_name, password, gender, date_of_birth, class_id, profile_pic) VALUES(?,?,?,?,?,?,?,?,?)`,
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
        ],
        (err, student) => {
          if (err) return reject(err);
          resolve(student);
        },
      );
    });
  } catch (err) {
    throw err;
  }
}

// addStudent('PS003', 'John', 'Doe', 'Lyn', '123', 'Male', '15/03/2004', 1, 'NULL')

//Get student By ID
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
      },
    );
  });
}

//Get student by admission number
async function getStudentByAdmissionNumber(admissionNumber) {
  try {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM students WHERE admission_number = ?`,
        [admissionNumber],
        (err, student) => {
          if (err) return reject(err);
          resolve(student);
        },
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
      },
    );
  });
}

module.exports = { 
  addStudent, 
  getStudentByAdmissionNumber, 
  getStudentById,
  updateStudentProfilePic
};

