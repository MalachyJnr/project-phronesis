require("dotenv").config();
const csrf = require("@dr.pogodin/csurf");
require("./config/dbConnection");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 3000;
const authRoute = require("./routes/authRoute");
const studentRoute = require("./routes/studentRoute");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  csrf({
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.set("view engine", "ejs");
app.set("views", "views");

// Global CSRF token & environment variables for forms & views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.defaultStudentPassword = process.env.DEFAULT_STUDENT_PASSWORD || "Password123";
  next();
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/admission-info", (req, res) => {
  res.render("admission-info");
});

app.use(authRoute);
app.use(studentRoute);

// ─── 404 Handler 
// Catches any request that didn't match a route above
app.use((req, res) => {
  res.status(404).render("error", {
    statusCode: 404,
    title: "Page Not Found",
    message: `The page you're looking for doesn't exist or may have been moved. Check the URL and try again.`,
    backUrl: req.headers.referer || null,
    backLabel: "Go Back",
  });
});

// ─── 500 / Global Error Handler 
// Catches any unhandled errors passed via next(err)
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.warn("[CSRF Error]", err.message, "IP:", req.ip, "URL:", req.originalUrl);
    if (req.xhr || (req.headers.accept && req.headers.accept.includes("json"))) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired security token. Please refresh the page and try again.",
      });
    }
    return res.status(403).render("error", {
      statusCode: 403,
      title: "Invalid Security Token",
      message:
        "Your request could not be processed due to an invalid or expired security token. Please refresh the page and try again.",
      backUrl: req.headers.referer || "/login/student",
      backLabel: "Return to Safety",
    });
  }

  console.error("[Global Error Handler]", err);
  res.status(err.status || 500).render("error", {
    statusCode: err.status || 500,
    title: "Something Went Wrong",
    message:
      "An unexpected server error occurred. Our team has been notified. Please try again or contact your administrator.",
    backUrl: req.headers.referer || null,
    backLabel: "Go Back",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
