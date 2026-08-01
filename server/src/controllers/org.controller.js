const prisma = require('../config/prisma');
const ImageKit = require('imagekit');
const bcrypt = require('bcryptjs');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

exports.getMembers = async (req, res) => {
  try {
    const currentUser = await prisma.users.findUnique({
      where: { id: req.user.userId }
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const members = await prisma.users.findMany({
      where: {
        organization_id: currentUser.organization_id,
        role: { not: 'super_admin' }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        emergency_contact: true,
        created_at: true,
        city: true,
        gender: true,
        blood_group: true,
        current_address: true,
        permanent_address: true,
        profile_photo: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.status(200).json({ members, items: members });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

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

exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, emergency_contact, role } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can create users." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const defaultPassword = "Password@123";
    const password_hash = await bcrypt.hash(defaultPassword, 10);

    const newUser = await prisma.users.create({
      data: {
        organization_id: currentUser.organization_id,
        name,
        email,
        password_hash,
        phone,
        emergency_contact,
        role: role || 'member'
      }
    });

    const { password_hash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, emergency_contact, role, city, gender, blood_group, current_address, permanent_address } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can update users." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const userToUpdate = await prisma.users.findUnique({ where: { id: parseInt(userId) } });
    if (!userToUpdate || userToUpdate.organization_id !== currentUser.organization_id) {
      return res.status(404).json({ error: "User not found in your organization." });
    }

    if (userToUpdate.role === 'super_admin') {
      return res.status(403).json({ error: "You cannot modify a super admin." });
    }

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(userId) },
      data: { name, email, phone, emergency_contact, role, city, gender, blood_group, current_address, permanent_address }
    });

    const { password_hash: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json({ message: "User updated successfully", user: userWithoutPassword });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can delete users." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    if (currentUser.id === parseInt(userId)) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    const userToDelete = await prisma.users.findUnique({ where: { id: parseInt(userId) } });
    if (!userToDelete || userToDelete.organization_id !== currentUser.organization_id) {
      return res.status(404).json({ error: "User not found in your organization." });
    }

    if (userToDelete.role === 'super_admin') {
      return res.status(403).json({ error: "You cannot delete a super admin." });
    }

    await prisma.users.delete({ where: { id: parseInt(userId) } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
