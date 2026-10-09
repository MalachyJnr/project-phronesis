const resultsModel = require("./results.model");
const studentModel = require("../Student/student.model");

const getStudentResults = async (req, res) => {
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

    const sessions = await resultsModel.getSessions();
    const terms = await resultsModel.getTerms();

    let sessionId = req.query.session ? parseInt(req.query.session, 10) : null;
    let termId = req.query.term ? parseInt(req.query.term, 10) : null;

    if (!sessionId || !termId) {
      const latest = await resultsModel.getLatestResultSessionAndTerm(studentId);
      if (latest) {
        sessionId = sessionId || latest.session_id;
        termId = termId || latest.term_id;
      } else {
        sessionId = sessionId || (sessions.length > 0 ? sessions[0].session_id : null);
        termId = termId || (terms.length > 0 ? terms[0].term_id : null);
      }
    }

    let summary = null;
    let subjectResults = [];

    if (sessionId && termId) {
      summary = await resultsModel.getResultSummary(studentId, sessionId, termId);
      if (summary) {
        subjectResults = await resultsModel.getSubjectResults(summary.result_id);
      }
    }

    res.json({
      success: true,
      pageTitle: "Academic Results",
      user: student,
      role: "student",
      sessions: sessions,
      terms: terms,
      selectedSessionId: sessionId,
      selectedTermId: termId,
      summary: summary,
      subjectResults: subjectResults,
    });
  } catch (error) {
    console.error("[resultsController] Error in getStudentResults:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      title: "Something Went Wrong",
      message: "We encountered an unexpected problem loading your results.",
    });
  }
};

const printStudentResults = async (req, res) => {
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

    const sessions = await resultsModel.getSessions();
    const terms = await resultsModel.getTerms();

    let sessionId = req.query.session ? parseInt(req.query.session, 10) : null;
    let termId = req.query.term ? parseInt(req.query.term, 10) : null;

    if (!sessionId || !termId) {
      const latest = await resultsModel.getLatestResultSessionAndTerm(studentId);
      if (latest) {
        sessionId = sessionId || latest.session_id;
        termId = termId || latest.term_id;
      } else {
        sessionId = sessionId || (sessions.length > 0 ? sessions[0].session_id : null);
        termId = termId || (terms.length > 0 ? terms[0].term_id : null);
      }
    }

    let summary = null;
    let subjectResults = [];

    if (sessionId && termId) {
      summary = await resultsModel.getResultSummary(studentId, sessionId, termId);
      if (summary) {
        subjectResults = await resultsModel.getSubjectResults(summary.result_id);
      }
    }

    res.json({
      success: true,
      pageTitle: "Official Report Card",
      user: student,
      role: "student",
      selectedSessionId: sessionId,
      selectedTermId: termId,
      summary: summary,
      subjectResults: subjectResults,
    });
  } catch (error) {
    console.error("[resultsController] Error in printStudentResults:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while generating the print report.",
    });
  }
};

module.exports = {
  getStudentResults,
  printStudentResults,
};
