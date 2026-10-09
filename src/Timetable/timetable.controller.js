const timetableModel = require("./timetable.model");
const studentModel = require("../Student/student.model");
const { formatTime, formatTimetableEntries } = require("../utils/formatTimetable");

const getStudentTimetable = async (req, res) => {
  try {
    const studentId = req.user.id;
    const getStudent = await studentModel.getStudentById(studentId);
    const student = getStudent[0];

    if (!student) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        title: "Student Not Found",
        message: "We could not find your student record.",
      });
    }

    const dbEntries = await timetableModel.getTimetableByClassId(student.class_id);
    const timetableDataGrouped = formatTimetableEntries(dbEntries);

    res.json({
      success: true,
      pageTitle: "Timetable",
      view: "timetable",
      user: student,
      role: "student",
      timetableDataGrouped: timetableDataGrouped,
    });
  } catch (error) {
    console.error("[timetableController] Error in getStudentTimetable:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      title: "Something Went Wrong",
      message: "We encountered an unexpected problem processing your request.",
    });
  }
};

const getSubjectDetailsAPI = async (req, res) => {
  try {
    const studentId = req.user.id;
    const subjectName = req.query.subject;

    if (!subjectName) {
      return res.status(400).json({ success: false, message: "Subject parameter is required." });
    }

    const getStudent = await studentModel.getStudentById(studentId);
    const student = getStudent[0];
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    const details = await timetableModel.getSubjectDetails(student.class_id, subjectName);

    if (!details || details.length === 0) {
      return res.json({
        success: true,
        data: {
          teacher: "TBD",
          room: "TBD",
          time: "TBD",
          syllabus: "No syllabus details available in database.",
        },
      });
    }

    const teacherName = details[0].teacher_name || "TBD";
    const syllabus = details[0].syllabus || "No syllabus details available in database.";

    const rooms = [...new Set(details.map((d) => d.room).filter(Boolean))];
    const roomStr = rooms.length > 0 ? rooms.join(", ") : "TBD";

    const scheduleLines = details.map((d) => {
      const startFormatted = formatTime(d.start_time);
      const endFormatted = formatTime(d.end_time);
      return `${d.day}: ${startFormatted.time} ${startFormatted.period} - ${endFormatted.time} ${endFormatted.period}`;
    });
    const scheduleStr = scheduleLines.join("<br>");

    return res.json({
      success: true,
      data: {
        teacher: teacherName,
        room: roomStr,
        time: scheduleStr,
        syllabus: syllabus,
      },
    });
  } catch (error) {
    console.error("[timetableController] Error in getSubjectDetailsAPI:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getStudentTimetable,
  getSubjectDetailsAPI,
};
