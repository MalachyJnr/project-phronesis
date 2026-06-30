const jwt = require("jsonwebtoken");

//authenticate user
const requireAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT error:", err.message);
      return res.redirect("/");
    }

    req.user = decoded;
    next();
  });
};

module.exports = { requireAuth };