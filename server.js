// Root server entry point - delegates to modular backend service in src/
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config(); // fallback

const app = require("./src/app");
const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`PHRONESIS API backend running on port ${port}`);
  });
}

module.exports = app;
