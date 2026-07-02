const studentModel = require("../models/student");
const timetableModel = require("../models/timetable");
const resultsModel = require("../models/results");

// Helper to format database 'HH:MM:SS' time into { time: 'H:MM', period: 'AM/PM' }
const formatTime = (timeStr) => {
    if (!timeStr) return { time: "", period: "" };
    const parts = timeStr.split(":");
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return {
        time: `${hours}:${minutes}`,
        period: period
    };
};

const getStudentLogin = (req, res) => {
    res.render("auth/student-login");
};

// Helper to render student views under authentication
const renderStudentView = async (req, res, viewName, pageTitle) => {
    try {
        const getStudent = await studentModel.getStudentById(req.user.id);
        const student = getStudent[0];

        let timetableDataGrouped = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: []
        };

        if (viewName === "home-dashboard" || viewName === "timetable") {
            const dbEntries = await timetableModel.getTimetableByClassId(student.class_id);
            const defaultBreaks = [
                { start_time: '10:30:00', time: '10:30', period: '', subject: 'Short Break', room: '', teacher: '', color: 'break' },
                { start_time: '12:30:00', time: '12:30', period: '', subject: 'Lunch Break', room: '', teacher: '', color: 'break' }
            ];

            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            days.forEach(day => {
                const dayDbEntries = dbEntries
                    .filter(entry => entry.day === day)
                    .map(entry => {
                        const formatted = formatTime(entry.start_time);
                        return {
                            start_time: entry.start_time,
                            time: formatted.time,
                            period: formatted.period,
                            subject: entry.subject_name || "",
                            room: entry.room || "",
                            teacher: entry.teacher_name || "",
                            color: "primary"
                        };
                    });

                const combined = [...dayDbEntries, ...defaultBreaks];
                combined.sort((a, b) => a.start_time.localeCompare(b.start_time));
                timetableDataGrouped[day] = combined;
            });
        }

        res.render(viewName, {
            pageTitle: pageTitle,
            user: student,
            role: "student",
            timetableDataGrouped: timetableDataGrouped
        });
    } catch (error) {
        console.error(`[studentController] Error rendering "${viewName}":`, error);
        res.status(500).render("error", {
            statusCode: 500,
            title: "Something Went Wrong",
            message: "We encountered an unexpected problem loading your page. Please try again or contact your administrator if the issue persists.",
            backUrl: "/student/dashboard",
            backLabel: "Back to Dashboard",
        });
    }
};

const getStudentDashboard = (req, res) => {
    renderStudentView(req, res, "home-dashboard", "Student Dashboard");
};

const getStudentResults = async (req, res) => {
    try {
        const studentId = req.user.id;
        const getStudent = await studentModel.getStudentById(studentId);
        const student = getStudent[0];

        if (!student) {
            return res.status(404).render("error", {
                statusCode: 404,
                title: "Student Not Found",
                message: "We could not find your student record.",
                backUrl: "/student/dashboard",
                backLabel: "Back to Dashboard",
            });
        }

        const sessions = await resultsModel.getSessions();
        const terms = await resultsModel.getTerms();

        let sessionId = req.query.session ? parseInt(req.query.session, 10) : null;
        let termId = req.query.term ? parseInt(req.query.term, 10) : null;

        // If not specified in query, find the latest result session and term
        if (!sessionId || !termId) {
            const latest = await resultsModel.getLatestResultSessionAndTerm(studentId);
            if (latest) {
                sessionId = sessionId || latest.session_id;
                termId = termId || latest.term_id;
            } else {
                // Fallback to first session and term if no results exist
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

        res.render("results", {
            pageTitle: "Academic Results",
            user: student,
            role: "student",
            sessions: sessions,
            terms: terms,
            selectedSessionId: sessionId,
            selectedTermId: termId,
            summary: summary,
            subjectResults: subjectResults
        });
    } catch (error) {
        console.error("[studentController] Error in getStudentResults:", error);
        res.status(500).render("error", {
            statusCode: 500,
            title: "Something Went Wrong",
            message: "We encountered an unexpected problem loading your results. Please try again later.",
            backUrl: "/student/dashboard",
            backLabel: "Back to Dashboard",
        });
    }
};

const printStudentResults = async (req, res) => {
    try {
        const studentId = req.user.id;
        const getStudent = await studentModel.getStudentById(studentId);
        const student = getStudent[0];

        if (!student) {
            return res.status(404).render("error", {
                statusCode: 404,
                title: "Student Not Found",
                message: "We could not find your student record.",
                backUrl: "/student/dashboard",
                backLabel: "Back to Dashboard",
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

        res.render("print-results", {
            pageTitle: "Official Report Card",
            user: student,
            role: "student",
            selectedSessionId: sessionId,
            selectedTermId: termId,
            summary: summary,
            subjectResults: subjectResults
        });
    } catch (error) {
        console.error("[studentController] Error in printStudentResults:", error);
        res.status(500).send("An unexpected error occurred while generating the print report.");
    }
};

const getStudentTimetable = (req, res) => {
    renderStudentView(req, res, "timetable", "Timetable");
};

const getStudentAssessments = (req, res) => {
    renderStudentView(req, res, "assessments", "Assessments");
};

const getStudentPayments = (req, res) => {
    renderStudentView(req, res, "payments", "Payments");
};

const getStudentSettings = (req, res) => {
    renderStudentView(req, res, "settings", "Settings");
};

const getStudentProfile = (req, res) => {
    renderStudentView(req, res, "profile", "Profile");
};

module.exports = {
    getStudentLogin,
    getStudentDashboard,
    getStudentResults,
    printStudentResults,
    getStudentTimetable,
    getStudentAssessments,
    getStudentPayments,
    getStudentSettings,
    getStudentProfile
};
