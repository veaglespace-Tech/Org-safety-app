const prisma = require('../config/prisma');

exports.getEmails = async (req, res) => {
  try {
    const userId = req.user.userId;

    const emails = await prisma.emergency_emails.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ emails });
  } catch (error) {
    console.error("Error fetching emergency emails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addEmail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check limit (e.g. max 10 emails per user)
    const count = await prisma.emergency_emails.count({
      where: { user_id: userId }
    });

    if (count >= 10) {
      return res.status(400).json({ error: "Maximum limit of 10 emergency emails reached." });
    }

    // Check if email already exists for this user
    const existing = await prisma.emergency_emails.findFirst({
      where: { user_id: userId, email: email }
    });

    if (existing) {
      return res.status(400).json({ error: "This email is already added." });
    }

    const newEmail = await prisma.emergency_emails.create({
      data: {
        user_id: userId,
        email: email
      }
    });

    res.status(201).json({ message: "Emergency email added successfully", email: newEmail });
  } catch (error) {
    console.error("Error adding emergency email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteEmail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const emailRecord = await prisma.emergency_emails.findUnique({
      where: { id: parseInt(id) }
    });

    if (!emailRecord || emailRecord.user_id !== userId) {
      return res.status(404).json({ error: "Emergency email not found" });
    }

    await prisma.emergency_emails.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: "Emergency email deleted successfully" });
  } catch (error) {
    console.error("Error deleting emergency email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
