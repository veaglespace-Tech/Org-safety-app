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
    const { name, email, phone, address, city, state, country } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can update organization settings." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const updatedOrg = await prisma.organizations.update({
      where: { id: currentUser.organization_id },
      data: { name, email, phone, address, city, state, country }
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
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const members = await prisma.users.findMany({
      where: { organization_id: currentUser.organization_id },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteOrgUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can delete users." });
    }

    const { id } = req.params;
    
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ error: "You cannot delete yourself." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    const userToDelete = await prisma.users.findUnique({ where: { id: parseInt(id) } });

    if (!userToDelete || userToDelete.organization_id !== currentUser.organization_id) {
      return res.status(404).json({ error: "User not found in your organization." });
    }

    await prisma.users.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createOrgUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can create users." });
    }

    const { name, email, phone, emergency_contact, role, city, gender, blood_group, current_address, permanent_address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("Password@123", salt);

    const newUser = await prisma.users.create({
      data: {
        organization_id: currentUser.organization_id,
        name,
        email,
        password_hash: passwordHash,
        role: role || 'member',
        phone: phone || null,
        emergency_contact: emergency_contact || null,
        city: city || null,
        gender: gender || null,
        blood_group: blood_group || null,
        current_address: current_address || null,
        permanent_address: permanent_address || null
      }
    });

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateOrgUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can update users." });
    }

    const { id } = req.params;
    const { name, email, phone, emergency_contact, role, city, gender, blood_group, current_address, permanent_address } = req.body;

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    const userToUpdate = await prisma.users.findUnique({ where: { id: parseInt(id) } });

    if (!userToUpdate || userToUpdate.organization_id !== currentUser.organization_id) {
      return res.status(404).json({ error: "User not found in your organization." });
    }

    if (email && email !== userToUpdate.email) {
      const existingUser = await prisma.users.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email is already registered by another user." });
      }
    }

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
        emergency_contact: emergency_contact !== undefined ? emergency_contact : undefined,
        role: role !== undefined ? role : undefined,
        city: city !== undefined ? city : undefined,
        gender: gender !== undefined ? gender : undefined,
        blood_group: blood_group !== undefined ? blood_group : undefined,
        current_address: current_address !== undefined ? current_address : undefined,
        permanent_address: permanent_address !== undefined ? permanent_address : undefined,
      }
    });

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can delete the organization." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    await prisma.organizations.delete({
      where: { id: currentUser.organization_id }
    });

    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getActiveSosAlerts = async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'org_admin' && role !== 'super_admin') {
      return res.status(403).json({ error: "Only admins can view active SOS alerts." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const activeAlerts = await prisma.sos_alerts.findMany({
      where: {
        organization_id: currentUser.organization_id,
        status: 'active'
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profile_photo: true,
            emergency_contact: true,
            blood_group: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ alerts: activeAlerts });
  } catch (error) {
    console.error("Error fetching active SOS alerts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
