const sosService = require('../services/sos.service');

exports.triggerSOS = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { locationUrl } = req.body;

    const result = await sosService.triggerSOS(userId, locationUrl);
    res.status(200).json(result);
  } catch (error) {
    console.error("SOS Trigger Error:", error);
    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error", message: error.message, stack: error.stack });
    }
  }
};

exports.updateSOS = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { locationUrl } = req.body;

    const result = await sosService.updateSOS(userId, locationUrl);
    res.status(200).json(result);
  } catch (error) {
    console.error("SOS Update Error:", error);
    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.stopSOS = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await sosService.stopSOS(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("SOS Stop Error:", error);
    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
