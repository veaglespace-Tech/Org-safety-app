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

    // Dynamic Member Photo (Use actual uploaded photo, or org logo fallback, or null)
    const memberPhoto = user.profile_photo || user.organizations?.logo || null;

    const distressMessage = `🚨 EMERGENCY SOS DISTRESS ALERT 🚨

👤 Name: ${user.name}
📧 Email: ${user.email}
📱 Contact: ${user.phone || 'N/A'}
🆘 Emergency Contact: ${user.emergency_contact || 'N/A'}
🏢 Organisation: ${user.organizations?.name || 'N/A'} (ID: ${user.organization_id})
${memberPhoto ? `🖼️ Member Photo: ${memberPhoto}\n` : ''}
📍 LIVE GPS LOCATION: ${locationUrl || 'Location not provided'}

⚠️ I need immediate assistance! Please verify my safety.`;

    const initials = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

    const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #e11d48; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #e11d48; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; letter-spacing: 1px;">🚨 EMERGENCY SOS DISTRESS ALERT</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Immediate assistance required</p>
      </div>

      <div style="padding: 24px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px; background-color: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
          ${
            memberPhoto
              ? `<img src="${memberPhoto}" alt="${user.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #e11d48; margin-right: 16px;" />`
              : `<div style="width: 70px; height: 70px; border-radius: 50%; background-color: #e11d48; color: #ffffff; line-height: 70px; text-align: center; font-size: 28px; font-weight: bold; margin-right: 16px;">${initials}</div>`
          }
          <div>
            <h2 style="margin: 0; font-size: 20px; color: #0f172a;">${user.name}</h2>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Role: <strong style="text-transform: uppercase;">${user.role || 'MEMBER'}</strong></p>
            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 14px;">Org: <strong>${user.organizations?.name || 'Safety Portal'}</strong></p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: bold; width: 40%;">📧 Email:</td>
            <td style="padding: 10px 0; color: #0f172a;">${user.email}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: bold;">📱 Phone:</td>
            <td style="padding: 10px 0; color: #0f172a; font-family: monospace; font-weight: bold;">${user.phone || 'Not provided'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #e11d48; font-weight: bold;">🆘 Emergency Contact:</td>
            <td style="padding: 10px 0; color: #e11d48; font-family: monospace; font-weight: bold;">${user.emergency_contact || 'Not provided'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: bold;">🩸 Blood Group:</td>
            <td style="padding: 10px 0; color: #0f172a;">${user.blood_group || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-weight: bold;">📍 City:</td>
            <td style="padding: 10px 0; color: #0f172a;">${user.city || 'N/A'}</td>
          </tr>
        </table>

        ${locationUrl ? `
        <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #be123c; font-size: 15px;">📍 LIVE GPS LOCATION PINPOINTED</p>
          <a href="${locationUrl}" target="_blank" style="display: inline-block; background-color: #e11d48; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px;">View Live Google Maps Location</a>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #9f1239; word-break: break-all;">${locationUrl}</p>
        </div>
        ` : `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px;">
          <p style="margin: 0; color: #64748b;">GPS Coordinates not provided at time of dispatch.</p>
        </div>
        `}

        <div style="font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          This is an automated emergency distress message from <strong>${user.organizations?.name || 'तिची सुरक्षा'}</strong>.
        </div>
      </div>
    </div>
    `;

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
    const emailPromise = notificationService.sendEmail(adminEmails.join(','), emailSubject, distressMessage, htmlMessage);

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
