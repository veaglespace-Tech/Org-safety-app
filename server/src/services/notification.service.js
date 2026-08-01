const nodemailer = require('nodemailer');
const twilio = require('twilio');
const emailPoolService = require('./emailPool.service');

class NotificationService {
  constructor() {
    this.twilioClient = null;
    this.setupTwilio();
  }

  setupTwilio() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  async sendEmail(to, subject, text, html) {
    try {
      const mailOptions = {
        to: to, // Can be a comma-separated string or an array
        subject: subject,
        text: text,
        html: html || text.replace(/\n/g, '<br>')
      };

      if (process.env.GLOBAL_SOS_CC_EMAIL) {
        mailOptions.cc = process.env.GLOBAL_SOS_CC_EMAIL;
      }

      // Delegate to the Email Pool Service to handle fallback logic
      const success = await emailPoolService.sendMailWithFallback(mailOptions);
      return success;
    } catch (err) {
      console.error("Email Error:", err);
      return false;
    }
  }

  async sendWhatsApp(phones, message) {
    if (!this.twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER || !phones || phones.length === 0) {
      console.log("Skipping WhatsApp: Missing Twilio credentials or dispatch phone numbers.");
      return false;
    }
    
    try {
      for (const phone of phones) {
         await this.twilioClient.messages.create({
           body: message,
           from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
           to: `whatsapp:${phone}`
         });
      }
      console.log("WhatsApp messages sent successfully");
      return true;
    } catch (err) {
      console.error("WhatsApp Error:", err);
      return false;
    }
  }

  async sendVoiceCall(phones, twimlMessage) {
    if (!this.twilioClient || !process.env.TWILIO_PHONE_NUMBER || !phones || phones.length === 0) {
       console.log("Skipping Voice Call: Missing Twilio credentials or dispatch phone numbers.");
       return false;
    }
    
    try {
       const twiml = new twilio.twiml.VoiceResponse();
       twiml.say({ voice: 'alice' }, twimlMessage);
       
       for (const phone of phones) {
         await this.twilioClient.calls.create({
           twiml: twiml.toString(),
           to: phone,
           from: process.env.TWILIO_PHONE_NUMBER
         });
       }
       console.log("Phone calls initiated successfully");
       return true;
    } catch (err) {
      console.error("Phone Call Error:", err);
      return false;
    }
  }
}

module.exports = new NotificationService();
