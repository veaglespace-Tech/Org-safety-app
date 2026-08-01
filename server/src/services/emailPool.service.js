const nodemailer = require('nodemailer');

class EmailPoolService {
  constructor() {
    this.transporters = [];
    this.initializePool();
  }

  initializePool() {
    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = parseInt(process.env.SMTP_PORT) || 465;
    const secure = process.env.SMTP_SECURE === 'true' || true;

    // We have 10 possible credentials: 0 to 9
    for (let i = 0; i < 10; i++) {
      const user = process.env[`SMTP_USER_${i}`];
      const pass = process.env[`SMTP_PASS_${i}`];

      if (user && pass) {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
        });
        
        // Store the transporter and the email address it belongs to (useful for setting the 'from' field properly)
        this.transporters.push({
          transporter,
          userEmail: user,
          id: i
        });
      }
    }

    if (this.transporters.length === 0) {
      console.error('[EmailPool] No valid SMTP credentials found in environment variables.');
    } else {
      console.log(`[EmailPool] Successfully initialized ${this.transporters.length} email transporters for fallback.`);
    }
  }

  async sendMailWithFallback(baseMailOptions) {
    if (this.transporters.length === 0) {
      console.error('[EmailPool] Cannot send email. No transporters available.');
      return false;
    }

    let lastError = null;

    for (let i = 0; i < this.transporters.length; i++) {
      const config = this.transporters[i];
      try {
        // We override the 'from' field to match the transporter's authenticated user
        // so the SMTP server doesn't reject it for spoofing
        const fromName = process.env.EMAIL_FROM_NAME || 'Veagle Attendee';
        
        const mailOptions = {
          ...baseMailOptions,
          from: `"${fromName}" <${config.userEmail}>`
        };

        const info = await config.transporter.sendMail(mailOptions);
        console.log(`[EmailPool] Email sent successfully using account ${config.userEmail} (ID: ${config.id}). Message ID: ${info.messageId}`);
        return true; // Email sent successfully, break out of fallback loop

      } catch (error) {
        console.error(`[EmailPool] Failed to send email using account ${config.userEmail} (ID: ${config.id}). Trying next...`, error.message);
        lastError = error;
      }
    }

    // If it reaches here, all transporters failed
    console.error('[EmailPool] CRITICAL: All fallback email accounts failed to send the email.', lastError);
    return false;
  }
}

module.exports = new EmailPoolService();
