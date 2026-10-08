//verify user role
const verifyRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      const redirectPath = role === "student" ? "/login/student" : `/${role}/login`;
      return res.redirect(redirectPath);
    }

    if (req.user.role !== role) {
      console.log("Unauthorized");
      const redirectPath = req.user.role === "student" ? "/login/student" : `/${req.user.role}/login`;
      return res.redirect(redirectPath);
    }

    next();
  };
};

module.exports = verifyRole;