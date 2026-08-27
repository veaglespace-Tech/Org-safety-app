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
🖼️ Profile Photo: ${user.profile_photo || 'N/A'}

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

    const emergencyEmails = await prisma.emergency_emails.findMany({
      where: { user_id: userId }
    });

    emergencyEmails.forEach(record => {
      if (record.email && !adminEmails.includes(record.email)) {
        adminEmails.push(record.email);
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

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ef4444&color=fff&size=200`;
    let profileImageUrl = user.profile_photo || defaultAvatar;
    
    // Fix for email clients (like Gmail) that block images without an extension
    if (profileImageUrl && !profileImageUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
      if (profileImageUrl.includes('imagekit.io')) {
        profileImageUrl += '?tr=f-jpg#.jpg';
      } else {
        profileImageUrl += '#.jpg';
      }
    }

    const distressHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #ef4444; border-radius: 10px; padding: 20px;">
        <h2 style="color: #ef4444; text-align: center; margin-bottom: 20px;">🚨 EMERGENCY SOS DISTRESS ALERT 🚨</h2>
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p><strong>👤 Name:</strong> ${user.name}</p>
          <p><strong>📧 Email:</strong> ${user.email}</p>
          <p><strong>📱 Contact:</strong> ${user.phone || 'N/A'}</p>
          <p><strong>🆘 Emergency Contact:</strong> ${user.emergency_contact || 'N/A'}</p>
          <p><strong>🏢 Organisation:</strong> ${user.organizations?.name || 'N/A'} (ID: ${user.organization_id})</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <p><strong>🖼️ Profile Photo:</strong></p>
          <img src="${profileImageUrl}" alt="Profile Photo" style="max-width: 200px; max-height: 200px; border-radius: 10px; border: 2px solid #ccc; object-fit: cover; margin-bottom: 10px;" />
          <p style="margin:0; font-size: 0.85em;"><a href="${profileImageUrl}" target="_blank" style="color: #ef4444; text-decoration: underline;">Click here to view photo</a></p>
          <p style="margin-top:5px; font-size: 0.75em; color: #666; word-break: break-all;">URL: ${profileImageUrl}</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #22c55e;">
          <p style="margin:0;"><strong>📍 LIVE GPS LOCATION:</strong></p>
          <p style="margin-top:10px;"><a href="${locationUrl || '#'}" style="display:inline-block; background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">View Live Location</a></p>
          <p style="margin-top:10px; font-size: 0.85em; color: #666;">URL: ${locationUrl || 'Location not provided'}</p>
        </div>
        <p style="color: #ef4444; font-weight: bold; text-align: center; font-size: 1.1em; margin-top: 20px;">⚠️ I need immediate assistance! Please verify my safety.</p>
      </div>
    `;

    const emailSubject = `🚨 URGENT: SOS Alert from ${user.name}`;
    const emailPromise = notificationService.sendEmail(adminEmails.join(','), emailSubject, distressMessage, distressHtml);

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
    
    const emergencyEmails = await prisma.emergency_emails.findMany({
      where: { user_id: userId }
    });

    emergencyEmails.forEach(record => {
      if (record.email && !adminEmails.includes(record.email)) {
        adminEmails.push(record.email);
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

      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ef4444&color=fff&size=200`;
      let profileImageUrl = user.profile_photo || defaultAvatar;
      if (profileImageUrl && !profileImageUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
        if (profileImageUrl.includes('imagekit.io')) {
          profileImageUrl += '?tr=f-jpg#.jpg';
        } else {
          profileImageUrl += '#.jpg';
        }
      }
      
      const updateHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px;">
        <h2 style="color: #f59e0b; text-align: center; margin-bottom: 20px;">🚨 EMERGENCY SOS UPDATE 🚨</h2>
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p><strong>👤 Name:</strong> ${user.name}</p>
          <p><strong>📞 Phone:</strong> ${user.phone || 'Not provided'}</p>
          <p><strong>🚨 Emergency Contact:</strong> ${user.emergency_contact || 'Not provided'}</p>
          <p><strong>🏢 Organization:</strong> ${user.organizations?.name || 'N/A'}</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <p><strong>🖼️ Profile Photo:</strong></p>
          <img src="${profileImageUrl}" alt="Profile Photo" style="max-width: 200px; max-height: 200px; border-radius: 10px; border: 2px solid #ccc; object-fit: cover; margin-bottom: 10px;" />
          <p style="margin:0; font-size: 0.85em;"><a href="${profileImageUrl}" target="_blank" style="color: #f59e0b; text-decoration: underline;">Click here to view photo</a></p>
          <p style="margin-top:5px; font-size: 0.75em; color: #666; word-break: break-all;">URL: ${profileImageUrl}</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #22c55e;">
          <p style="margin:0;"><strong>📍 LATEST LIVE LOCATION:</strong></p>
          <p style="margin-top:10px;"><a href="${locationUrl || '#'}" style="display:inline-block; background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">View Live Location</a></p>
          <p style="margin-top:10px; font-size: 0.85em; color: #666;">URL: ${locationUrl || 'Location not provided'}</p>
        </div>
        <p style="color: #f59e0b; font-weight: bold; text-align: center; font-size: 1.1em; margin-top: 20px;">⚠️ THIS IS AN AUTOMATED ${process.env.SOS_INTERVAL_MINUTES || '5'}-MINUTE UPDATE.<br/>The user is STILL in an active emergency.</p>
      </div>
      `;
      
      const subject = `🚨 SOS UPDATE: ${user.name} is still in danger`;
      await notificationService.sendEmail(adminEmails.join(','), subject, updateMessage, updateHtml);
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

    const emergencyEmails = await prisma.emergency_emails.findMany({
      where: { user_id: userId }
    });

    emergencyEmails.forEach(record => {
      if (record.email && !adminEmails.includes(record.email)) {
        adminEmails.push(record.email);
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
