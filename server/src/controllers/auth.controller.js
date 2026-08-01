const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const generateTokenAndSetCookie = (res, userId, role) => {
  const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  return token;
};

exports.registerOrganization = async (req, res) => {
  try {
    const { org, admin } = req.body;

    if (!org || !admin) {
      return res.status(400).json({ error: "Organization and Admin details are required." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(admin.password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const newOrg = await tx.organizations.create({
        data: {
          name: org.name,
          email: org.email,
          phone: org.phone,
          city: org.city,
          state: org.state,
          country: org.country,
          address: org.address
        }
      });

      const newUser = await tx.users.create({
        data: {
          organization_id: newOrg.id,
          name: admin.name,
          email: admin.email,
          password_hash: passwordHash,
          role: 'admin',
          phone: admin.mobile,
          city: admin.city || null,
          gender: admin.gender || null,
          blood_group: admin.bloodGroup || null
        }
      });

      return { newOrg, newUser };
    });

    const token = generateTokenAndSetCookie(res, result.newUser.id, result.newUser.role);

    res.status(201).json({ 
      message: "Organization created successfully", 
      organization: result.newOrg,
      admin: result.newUser,
      user: {
        id: result.newUser.id,
        name: result.newUser.name,
        email: result.newUser.email,
        role: result.newUser.role,
        organization_id: result.newUser.organization_id,
        profilePhoto: result.newUser.profile_photo,
        city: result.newUser.city,
        gender: result.newUser.gender,
        bloodGroup: result.newUser.blood_group,
        currentAddress: result.newUser.current_address,
        permanentAddress: result.newUser.permanent_address,
        organization: result.newOrg
      }
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "An organization or admin with this email already exists." });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { organizations: true }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateTokenAndSetCookie(res, user.id, user.role);

    res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        emergencyContact: user.emergency_contact,
        profilePhoto: user.profile_photo,
        city: user.city,
        gender: user.gender,
        bloodGroup: user.blood_group,
        currentAddress: user.current_address,
        permanentAddress: user.permanent_address,
        organization_id: user.organization_id,
        organization: user.organizations
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { organizations: true }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    if (user.role !== 'super_admin') {
      return res.status(403).json({ error: "Access denied. Only Super Admins can log in here." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = generateTokenAndSetCookie(res, user.id, user.role);

    res.status(200).json({
      message: "Super Admin logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profile_photo,
      }
    });
  } catch (error) {
    console.error("Super admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.joinOrganization = async (req, res) => {
  try {
    const { referralCode } = req.params;
    const { name, email, password, mobile, emergencyContact } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }

    let orgId;
    if (referralCode.toUpperCase().startsWith('REF-')) {
      orgId = parseInt(referralCode.split('-')[1], 10);
    } else {
      orgId = parseInt(referralCode, 10);
    }

    if (isNaN(orgId)) {
      return res.status(400).json({ error: "Invalid referral code format." });
    }

    const org = await prisma.organizations.findUnique({ where: { id: orgId } });
    if (!org) {
      return res.status(404).json({ error: "Organization not found." });
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.users.create({
      data: {
        organization_id: orgId,
        name: name,
        email: email,
        password_hash: passwordHash,
        role: 'member',
        phone: mobile || null,
        emergency_contact: emergencyContact || null,
        city: req.body.city || null,
        gender: req.body.gender || null,
        blood_group: req.body.bloodGroup || null,
        current_address: req.body.currentAddress || null,
        permanent_address: req.body.permanentAddress || null
      },
      include: { organizations: true }
    });

    const token = generateTokenAndSetCookie(res, newUser.id, newUser.role);

    res.status(201).json({
      message: "Successfully joined organization",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        emergencyContact: newUser.emergency_contact,
        profilePhoto: newUser.profile_photo,
        city: newUser.city,
        gender: newUser.gender,
        bloodGroup: newUser.blood_group,
        currentAddress: newUser.current_address,
        permanentAddress: newUser.permanent_address,
        organization_id: newUser.organization_id,
        organization: newUser.organizations
      }
    });
  } catch (error) {
    console.error("Join error:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "An account with this email already exists." });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
      include: { organizations: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        emergencyContact: user.emergency_contact,
        profilePhoto: user.profile_photo,
        city: user.city,
        gender: user.gender,
        bloodGroup: user.blood_group,
        currentAddress: user.current_address,
        permanentAddress: user.permanent_address,
        organization_id: user.organization_id,
        organization: user.organizations
      }
    });
  } catch (error) {
    console.error("Error fetching me:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, phone, emergencyContact, email, password, profilePhoto, city, gender, bloodGroup, currentAddress, permanentAddress } = req.body;
    
    const updateData = {
      name,
      phone,
      emergency_contact: emergencyContact,
      city,
      gender,
      blood_group: bloodGroup,
      current_address: currentAddress,
      permanent_address: permanentAddress
    };

    if (profilePhoto !== undefined) {
      if (profilePhoto && profilePhoto.startsWith('data:image/')) {
        const response = await imagekit.upload({
          file: profilePhoto,
          fileName: `user_${req.user.userId}_profile_${Date.now()}`,
          folder: '/user_profiles'
        });
        updateData.profile_photo = response.url;
      } else {
        updateData.profile_photo = profilePhoto;
      }
    }

    if (email) {
      updateData.email = email;
    }

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }
    
    const updatedUser = await prisma.users.update({
      where: { id: req.user.userId },
      data: updateData,
      include: { organizations: true }
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        emergencyContact: updatedUser.emergency_contact,
        profilePhoto: updatedUser.profile_photo,
        city: updatedUser.city,
        gender: updatedUser.gender,
        bloodGroup: updatedUser.blood_group,
        currentAddress: updatedUser.current_address,
        permanentAddress: updatedUser.permanent_address,
        organization_id: updatedUser.organization_id,
        organization: updatedUser.organizations
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: "Logged out successfully" });
};
