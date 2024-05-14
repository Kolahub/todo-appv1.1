const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    auth: './scripts/auth.js',
    user: './scripts/script.js',
    resetPwrd: './scripts/resetPwrd.js',
    verifyEmail: './scripts/verify_email.js'
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  watch: true
};

