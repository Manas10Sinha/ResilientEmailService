const express = require("express");
const router = express.Router();
const EmailManager = require("../services/EmailManager");

router.post("/send", async (req, res) => {
  const { to, subject, body, messageId } = req.body;
  try {
    const result = await EmailManager.sendEmail(to, subject, body, messageId);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
