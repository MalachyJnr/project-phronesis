const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Maximum 5 failed requests
    requestWasSuccessful: (req, res) => res.statusCode < 400 && !res.locals.loginFailed,
    handler: (req, res, next, options) => {
        const errorMsg = "Too many login attempts. Please try again after 15 minutes.";
        if (req.accepts("html")) {
            return res.redirect(`/login/student?error=${encodeURIComponent(errorMsg)}`);
        }
        res.status(options.statusCode).json({
            success: false,
            message: errorMsg,
        });
    },
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes.",
    },
});

module.exports = loginLimiter;