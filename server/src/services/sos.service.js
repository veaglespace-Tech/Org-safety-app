const prisma = require('../config/prisma');
const notificationService = require('./notification.service');

class SOSService {
  async triggerSOS(userId, locationUrl) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const distressMessage = `🚨 EMERGENCY SOS DISTRESS ALERT 🚨

👤 Name: ${user.name}
📧 Email: ${user.email}
📱 Contact: ${user.phone || 'N/A'}
🆘 Emergency Contact: ${user.emergency_contact || 'N/A'}
🏢 Organisation: ${user.organizations?.name || 'N/A'} (ID: ${user.organization_id})
🖼️ Profile Photo: https://res.cloudinary.com/dbehhnhhi/image/upload/v1782374811/veagle-attendee/profile-images/user-9-1782374808503.jpg

📍 LIVE GPS LOCATION: ${locationUrl || 'Location not provided'}

⚠️ I need immediate assistance! Please verify my safety.`;

    const adminEmails = [];
    if (process.env.GLOBAL_SOS_EMAIL) {
      adminEmails.push(process.env.GLOBAL_SOS_EMAIL);
    }
    
    const admins = await prisma.users.findMany({
      where: {
        organization_id: user.organization_id,
        role: 'admin'
      }
    });

    admins.forEach(a => {
      if (a.email && !adminEmails.includes(a.email)) {
        adminEmails.push(a.email);
      }
    });
    
    const adminPhones = admins.map(a => a.phone).filter(Boolean);
    if (process.env.ADMIN_PHONE && !adminPhones.includes(process.env.ADMIN_PHONE)) {
      adminPhones.push(process.env.ADMIN_PHONE);
    }
    
    const dispatchPhones = [...adminPhones];
    if (user.emergency_contact && !dispatchPhones.includes(user.emergency_contact)) {
      dispatchPhones.push(user.emergency_contact);
    }

    const emailSubject = `🚨 URGENT: SOS Alert from ${user.name}`;
    const emailPromise = notificationService.sendEmail(adminEmails.join(','), emailSubject, distressMessage);

    const whatsappPromise = notificationService.sendWhatsApp(dispatchPhones, distressMessage);

    const voiceMessage = `Emergency S O S Distress Alert. ${user.name} has pressed the S O S button. Please check your WhatsApp and Email immediately for their live G P S location. I repeat, ${user.name} needs immediate assistance.`;
    const phonePromise = notificationService.sendVoiceCall(dispatchPhones, voiceMessage);

    await Promise.all([emailPromise, whatsappPromise, phonePromise]);
    
    return { success: true, message: "SOS Distress Dispatched via all available channels." };
  }

  async updateSOS(userId, locationUrl) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const adminEmails = [];
    if (process.env.GLOBAL_SOS_EMAIL) {
      adminEmails.push(process.env.GLOBAL_SOS_EMAIL);
    }
    
    const admins = await prisma.users.findMany({
      where: {
        organization_id: user.organization_id,
        role: 'admin'
      }
    });

    admins.forEach(a => {
      if (a.email && !adminEmails.includes(a.email)) {
        adminEmails.push(a.email);
      }
    });
    
    if (adminEmails.length > 0) {
      const updateMessage = `🚨 EMERGENCY SOS UPDATE 🚨

👤 Name: ${user.name}
📞 Phone: ${user.phone || 'Not provided'}
🚨 Emergency Contact: ${user.emergency_contact || 'Not provided'}
🏢 Organization: ${user.organizations?.name || 'N/A'}

⚠️ THIS IS AN AUTOMATED ${process.env.SOS_INTERVAL_MINUTES || '5'}-MINUTE UPDATE.
The user is STILL in an active emergency and has not marked themselves as safe.

📍 LATEST LIVE LOCATION: ${locationUrl || 'Location not available'}
`;
      
      const subject = `🚨 SOS UPDATE: ${user.name} is still in danger`;
      await notificationService.sendEmail(adminEmails.join(','), subject, updateMessage);
    }

    return { success: true, message: "SOS location update sent successfully" };
  }

  async stopSOS(userId) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const adminEmails = [];
    if (process.env.GLOBAL_SOS_EMAIL) {
      adminEmails.push(process.env.GLOBAL_SOS_EMAIL);
    }
    
    const admins = await prisma.users.findMany({
      where: {
        organization_id: user.organization_id,
        role: 'admin'
      }
    });

    admins.forEach(a => {
      if (a.email && !adminEmails.includes(a.email)) {
        adminEmails.push(a.email);
      }
    });
    
    if (adminEmails.length > 0) {
      const stopMessage = `✅ SOS RESOLVED ✅

👤 Name: ${user.name}
📞 Phone: ${user.phone || 'Not provided'}
🏢 Organization: ${user.organizations?.name || 'N/A'}

This is to notify you that the SOS emergency triggered by ${user.name} has been stopped/resolved.
The user has confirmed they are now safe.
`;
      
      const subject = `✅ SOS RESOLVED: ${user.name} is safe`;
      await notificationService.sendEmail(adminEmails.join(','), subject, stopMessage);
    }

    return { success: true, message: "SOS cancelled successfully and notification sent" };
  }
}

module.exports = new SOSService();
