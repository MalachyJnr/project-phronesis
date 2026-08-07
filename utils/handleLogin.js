const createToken = require("../utils/createToken");
const bcrypt = require("bcrypt");

/**
 * Handles login for any user role.
 * On error, redirects back to the login page with an ?error= query param
 * so the client-side toast system can display it.
 */
async function handleLogin(identifier, password, role, model, idField, res) {
  const loginPage = `/login/${role.toLowerCase()}`;

  // 1. Validate required fields
  if (!identifier || !password) {
    res.locals.loginFailed = true;
    return res.redirect(
      `${loginPage}?error=${encodeURIComponent("Please fill in all fields before signing in.")}`
    );
  }

  try {
    // 2. Look up user by identifier
    const userData = await model(identifier);

    if (!userData || userData.length === 0) {
      res.locals.loginFailed = true;
      return res.redirect(
        `${loginPage}?error=${encodeURIComponent(
          `No ${role.toLowerCase()} account was found with that ID. Please check and try again.`
        )}`
      );
    }

    const user = userData[0];

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.locals.loginFailed = true;
      return res.redirect(
        `${loginPage}?error=${encodeURIComponent(
          "Incorrect password. Please try again or contact your administrator."
        )}`
      );
    }

    // 4. Create JWT token
    const payload = {
      id: user[idField],
      role,
    };
    const token = createToken(payload);

    // 5. Set secure cookie and redirect to dashboard
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    res.redirect(`/${role.toLowerCase()}/dashboard`);
  } catch (error) {
    console.error(`[handleLogin] Unexpected error for role "${role}":`, error);
    res.locals.loginFailed = true;
    return res.redirect(
      `${loginPage}?error=${encodeURIComponent(
        "A server error occurred. Please try again in a moment."
      )}`
    );
  }
}

module.exports = handleLogin;
