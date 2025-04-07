const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(notifications);
});

router.post("/mark-all-seen", authMiddleware, async (req, res) => {
  await Notification.updateMany({ user: req.user.id, seen: false }, { seen: true });
  res.json({ success: true });
});

module.exports = router;
