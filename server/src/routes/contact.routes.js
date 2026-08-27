const express = require('express');
const router = express.Router();
const emailPoolService = require('../services/emailPool.service');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const toEmail = process.env.GLOBAL_SOS_CC_EMAIL || 'singareakshay7020@gmail.com';

    const mailOptions = {
      to: toEmail,
      subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
        <br/>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `
    };

    const success = await emailPoolService.sendMailWithFallback(mailOptions);

    if (success) {
      return res.status(200).json({ message: 'Your message has been sent successfully.' });
    } else {
      return res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }

  } catch (error) {
    console.error('Error handling contact form submission:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

module.exports = router;
