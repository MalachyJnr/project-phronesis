const studentModel = require("../models/student");
const timetableModel = require("../models/timetable");
const resultsModel = require("../models/results");
const assessmentsModel = require("../models/assessments");
const paymentsModel = require("../models/payments");
const announcementsModel = require("../models/announcements");
const upload = require("../middlewares/multer");
const bcrypt = require("bcrypt");

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

// Helper to get duration in minutes between 'HH:MM:SS' time strings
const getDurationMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    const sParts = startTime.split(":");
    const eParts = endTime.split(":");
    const sMin = parseInt(sParts[0], 10) * 60 + parseInt(sParts[1], 10);
    const eMin = parseInt(eParts[0], 10) * 60 + parseInt(eParts[1], 10);
    return eMin - sMin;
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

            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            days.forEach(day => {
                const dayDbEntries = dbEntries
                    .filter(entry => entry.day === day)
                    .map(entry => {
                        const formatted = formatTime(entry.start_time);
                        const isBreak = entry.subject_name && entry.subject_name.toLowerCase().includes("break");
                        return {
                            start_time: entry.start_time,   
                            time: formatted.time,
                            period: isBreak ? "" : formatted.period,   
                            subject: entry.subject_name || "",
                            room: entry.room || "",
                            teacher: entry.teacher_name || "",
                            color: isBreak ? "break" : "primary",
                            duration: getDurationMinutes(entry.start_time, entry.end_time)
                        };
                    });

                dayDbEntries.sort((a, b) => a.start_time.localeCompare(b.start_time));
                timetableDataGrouped[day] = dayDbEntries;
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


const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user.id;
        const getStudent = await studentModel.getStudentById(studentId);
        const student = getStudent[0];

        if (!student) {
            return res.status(404).render("error", {
                statusCode: 404,
                title: "Student Not Found",
                message: "We could not find your student record.",
                backUrl: "/login/student",
                backLabel: "Back to Login",
            });
        }

        // Parallel data loading from database
        const [
            attendance,
            latestSessionTerm,
            paymentSummary,
            announcements,
            assessmentsSummary,
            dbEntries
        ] = await Promise.all([
            studentModel.getStudentAttendance(studentId),
            resultsModel.getLatestResultSessionAndTerm(studentId),
            paymentsModel.getPaymentStatusSummary(studentId),
            announcementsModel.getLatestAnnouncements(3),
            assessmentsModel.getAssessmentSummary(studentId, student.class_id),
            timetableModel.getTimetableByClassId(student.class_id)
        ]);

        let resultSummary = null;
        if (latestSessionTerm) {
            resultSummary = await resultsModel.getResultSummary(
                studentId,
                latestSessionTerm.session_id,
                latestSessionTerm.term_id
            );
        }

        let timetableDataGrouped = {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
        };
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        days.forEach(day => {
            const dayDbEntries = dbEntries
                .filter(entry => entry.day === day)
                .map(entry => {
                    const formatted = formatTime(entry.start_time);
                    const isBreak = entry.subject_name && entry.subject_name.toLowerCase().includes("break");
                    return {
                        start_time: entry.start_time,
                        time: formatted.time,
                        period: isBreak ? "" : formatted.period,
                        subject: entry.subject_name || "",
                        room: entry.room || "",
                        teacher: entry.teacher_name || "",
                        color: isBreak ? "break" : "primary",
                        duration: getDurationMinutes(entry.start_time, entry.end_time)
                    };
                });
            dayDbEntries.sort((a, b) => a.start_time.localeCompare(b.start_time));
            timetableDataGrouped[day] = dayDbEntries;
        });

        res.render("home-dashboard", {
            pageTitle: "Student Dashboard",
            user: student,
            role: "student",
            attendance: attendance,
            resultSummary: resultSummary,
            paymentSummary: paymentSummary,
            announcements: announcements,
            assessmentsSummary: assessmentsSummary,
            timetableDataGrouped: timetableDataGrouped
        });
    } catch (error) {
        console.error("[studentController] Error in getStudentDashboard:", error);
        res.status(500).render("error", {
            statusCode: 500,
            title: "Something Went Wrong",
            message: "We encountered an error loading your dashboard.",
            backUrl: "/student/dashboard",
            backLabel: "Reload Dashboard",
        });
    }
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

const getStudentAssessments = async (req, res) => {
    try {
        const studentId = req.user.id;
        const getStudent = await studentModel.getStudentById(studentId);
        const student = getStudent[0];

        const [assessments, summary] = await Promise.all([
            assessmentsModel.getStudentAssessments(studentId, student.class_id),
            assessmentsModel.getAssessmentSummary(studentId, student.class_id)
        ]);

        res.render("assessments", {
            pageTitle: "Assessments",
            user: student,
            role: "student",
            assessments: assessments,
            summary: summary
        });
    } catch (error) {
        console.error("[studentController] Error in getStudentAssessments:", error);
        renderStudentView(req, res, "assessments", "Assessments");
    }
};

const getStudentPayments = async (req, res) => {
    try {
        const studentId = req.user.id;
        const getStudent = await studentModel.getStudentById(studentId);
        const student = getStudent[0];

        const [payments, paymentSummary] = await Promise.all([
            paymentsModel.getStudentPayments(studentId),
            paymentsModel.getPaymentStatusSummary(studentId)
        ]);

        res.render("payments", {
            pageTitle: "Fees & Payments",
            user: student,
            role: "student",
            payments: payments,
            paymentSummary: paymentSummary
        });
    } catch (error) {
        console.error("[studentController] Error in getStudentPayments:", error);
        renderStudentView(req, res, "payments", "Payments");
    }
};

const getStudentSettings = (req, res) => {
    renderStudentView(req, res, "settings", "Settings");
};

const getStudentProfile = async (req, res) => {
    try {
        const studentId = req.user.id;
        const getStudent = await studentModel.getStudentById(studentId);
        const student = getStudent[0];

        const [attendance, latestSessionTerm] = await Promise.all([
            studentModel.getStudentAttendance(studentId),
            resultsModel.getLatestResultSessionAndTerm(studentId)
        ]);

        let resultSummary = null;
        if (latestSessionTerm) {
            resultSummary = await resultsModel.getResultSummary(
                studentId,
                latestSessionTerm.session_id,
                latestSessionTerm.term_id
            );
        }

        res.render("profile", {
            pageTitle: "Student Profile",
            user: student,
            role: "student",
            attendance: attendance,
            resultSummary: resultSummary
        });
    } catch (error) {
        console.error("[studentController] Error in getStudentProfile:", error);
        renderStudentView(req, res, "profile", "Profile");
    }
};

// Handle student profile image upload
const uploadSingle = upload.single("profile_pic");

const uploadProfilePic = (req, res) => {
    uploadSingle(req, res, async (err) => {
        if (err) {
            let message = "An error occurred during file upload.";
            if (err.code === "LIMIT_FILE_SIZE") {
                message = "File is too large. Maximum size allowed is 5MB.";
            } else if (err.code === "INVALID_FILE_TYPE") {
                message = err.message;
            }
            return res.status(400).json({ success: false, message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file was selected." });
        }

        try {
            const studentId = req.user.id;
            const newFilename = req.file.filename;

            const getStudent = await studentModel.getStudentById(studentId);
            const student = getStudent[0];
            const oldProfilePic = student ? student.profile_pic : null;

            await studentModel.updateStudentProfilePic(studentId, newFilename);

            if (oldProfilePic) {
                const fs = require("fs");
                const path = require("path");
                const oldPath = path.join(__dirname, "../public/uploads", oldProfilePic);
                
                fs.unlink(oldPath, (unlinkErr) => {
                    if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                        console.error("[studentController] Failed to delete old profile picture:", unlinkErr);
                    }
                });
            }

            return res.json({
                success: true,
                message: "Profile picture updated successfully.",
                filePath: `/uploads/${newFilename}`
            });
        } catch (dbErr) {
            console.error("[studentController] Database error updating profile pic:", dbErr);
            return res.status(500).json({ success: false, message: "Failed to save profile picture in the database." });
        }
    });
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
                    syllabus: "No syllabus details available in database."
                }
            });
        }

        const teacherName = details[0].teacher_name || "TBD";
        const syllabus = details[0].syllabus || "No syllabus details available in database.";
        
        const rooms = [...new Set(details.map(d => d.room).filter(Boolean))];
        const roomStr = rooms.length > 0 ? rooms.join(", ") : "TBD";

        const scheduleLines = details.map(d => {
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
                syllabus: syllabus
            }
        });
    } catch (error) {
        console.error("[studentController] Error in getSubjectDetailsAPI:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const studentId = req.user.id;

        // 1. Validate required fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.redirect(
                `/student/settings?error=${encodeURIComponent("Please fill in all password fields.")}`
            );
        }

        // 2. Validate password confirmation
        if (newPassword !== confirmPassword) {
            return res.redirect(
                `/student/settings?error=${encodeURIComponent("New password and confirmation password do not match.")}`
            );
        }

        // 3. Enforce password complexity (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.redirect(
                `/student/settings?error=${encodeURIComponent("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.")}`
            );
        }

        // 4. Fetch student details from database
        const getStudent = await studentModel.getStudentById(studentId);
        const student = getStudent[0];

        if (!student) {
            return res.redirect(
                `/student/settings?error=${encodeURIComponent("Student account not found.")}`
            );
        }

        // 5. Verify current password matches
        const isCurrentMatch = await bcrypt.compare(currentPassword, student.password);
        if (!isCurrentMatch) {
            return res.redirect(
                `/student/settings?error=${encodeURIComponent("Incorrect current password. Please check and try again.")}`
            );
        }

        // 6. Prevent setting new password to the same current password
        const isSameAsCurrent = await bcrypt.compare(newPassword, student.password);
        if (isSameAsCurrent) {
            return res.redirect(
                `/student/settings?error=${encodeURIComponent("New password cannot be the same as your current password.")}`
            );
        }

        // 7. Hash new password & update database
        const newHashedPassword = await bcrypt.hash(newPassword, 12);
        await studentModel.updateStudentPassword(studentId, newHashedPassword);

        // 8. Invalidate session / cookie and redirect to login page with success notification
        res.clearCookie("token");
        return res.redirect(
            `/login/student?success=${encodeURIComponent("Password changed successfully. Please log in with your new password.")}`
        );
    } catch (error) {
        console.error("[studentController] Error in changePassword:", error);
        return res.redirect(
            `/student/settings?error=${encodeURIComponent("An unexpected error occurred while updating your password. Please try again.")}`
        );
    }
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
    getStudentProfile,
    uploadProfilePic,
    getSubjectDetailsAPI,
    changePassword
};
