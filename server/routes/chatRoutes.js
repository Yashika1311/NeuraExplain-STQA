const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const { sendMessage, getHistory } = require("../controllers/chatController");

// Protected route example
router.get('/protected', protect, (req, res) => {
  res.json({ success: true, message: 'This is a protected route' });
});

// Admin-only route example
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Admin access granted' });
});

// Chat routes
router.post("/send", protect, sendMessage);
router.get("/history", protect, getHistory);

module.exports = router;
