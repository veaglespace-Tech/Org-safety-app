const prisma = require('../config/prisma');
const ImageKit = require('imagekit');
const bcrypt = require('bcryptjs');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});


exports.updateSettingsDetails = async (req, res) => {
  try {
    const { name, email, phone, address, city, state, country, logo } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can update organization settings." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const updateData = { name, email, phone, address, city, state, country };
    
    if (logo !== undefined) {
      if (logo && logo.startsWith('data:image/')) {
        const response = await imagekit.upload({
          file: logo,
          fileName: `org_${currentUser.organization_id}_logo_${Date.now()}`,
          folder: '/organization_logos'
        });
        updateData.logo = response.url;
      } else {
        updateData.logo = logo;
      }
    }

    const updatedOrg = await prisma.organizations.update({
      where: { id: currentUser.organization_id },
      data: updateData
    });

    res.status(200).json({ message: "Organization details updated successfully", organization: updatedOrg });
  } catch (error) {
    console.error("Error updating org details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateSettingsLogo = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can update organization logo." });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const response = await imagekit.upload({
      file: req.file.buffer,
      fileName: `org_${currentUser.organization_id}_logo_${Date.now()}`,
      folder: '/organization_logos'
    });

    const updatedOrg = await prisma.organizations.update({
      where: { id: currentUser.organization_id },
      data: { logo: response.url }
    });

    res.status(200).json({ message: "Organization logo updated successfully", logo: response.url, organization: updatedOrg });
  } catch (error) {
    console.error("Error updating org logo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!currentUser || !currentUser.organization_id) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const members = await prisma.users.findMany({
      where: { organization_id: currentUser.organization_id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        profile_photo: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching org members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
