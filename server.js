require("dotenv").config();
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
app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/admission-info", (req, res) => {
  res.render("admission-info");
});

app.use(authRoute);
app.use(studentRoute);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
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

// ─── 500 / Global Error Handler ──────────────────────────────────────────────
// Catches any unhandled errors passed via next(err)
app.use((err, req, res, next) => {
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
