const jwt = require("jsonwebtoken");
const createToken = require("../utils/createToken");

// Authenticate user
const requireAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login/student");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT Error:", err.message);

      // Remove the expired/invalid cookie
      res.clearCookie("token");

      return res.redirect(
        `/login/student?error=${encodeURIComponent(
          "Session expired due to 30 minutes of inactivity. Please log in again."
        )}`
      );
    }

    // Store user information
    req.user = decoded;

    // Sliding expiration: only renew if less than 15 minutes remain before expiry
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = decoded.exp - currentTime;

    if (timeRemaining < 15 * 60) {
      const newToken = createToken({
        id: decoded.id,
        role: decoded.role,
      });

      // Replace the old cookie with the renewed one
      res.cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 60 * 1000, // 30 minutes
      });
    }

    next();
  });
};

module.exports = { requireAuth };