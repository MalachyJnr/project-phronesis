// Root server entry point - delegates to separated backend service
const app = require("./backend/server");
const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`PHRONESIS API backend running on port ${port}`);
  });
}

module.exports = app;
