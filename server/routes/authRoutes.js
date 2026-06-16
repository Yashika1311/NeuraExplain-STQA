const router = require("express").Router();
const { login } = require("../controllers/authController");

router.options("/login", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Actual routes
router.post("/login", login);

module.exports = router;
