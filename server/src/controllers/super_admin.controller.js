const prisma = require('../config/prisma');

exports.getStats = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: "Access denied" });

    const totalOrganizations = await prisma.organizations.count();
    const totalUsers = await prisma.users.count();
    const totalAdmins = await prisma.users.count({ where: { role: 'admin' } });

    res.status(200).json({
      organizations: totalOrganizations,
      users: totalUsers,
      admins: totalAdmins,
    });
  } catch (error) {
    console.error("Error fetching super admin stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getOrganizations = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: "Access denied" });

    const organizations = await prisma.organizations.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: "Access denied" });

    const users = await prisma.users.findMany({
      include: {
        organizations: {
          select: { name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const sanitizedUsers = users.map(u => {
      const { password_hash, ...rest } = u;
      return rest;
    });

    res.status(200).json({ users: sanitizedUsers });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getOrganizationById = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: "Access denied" });

    const orgId = parseInt(req.params.id, 10);
    if (isNaN(orgId)) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }

    const organization = await prisma.organizations.findUnique({
      where: { id: orgId },
      include: {
        users: true
      }
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (organization.users) {
      organization.users = organization.users.map(u => {
        const { password_hash, ...rest } = u;
        return rest;
      });
    }

    res.status(200).json({ organization });
  } catch (error) {
    console.error("Error fetching organization by id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: "Access denied. Only super admins can delete users globally." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    if (currentUser.id === parseInt(id)) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    const userToDelete = await prisma.users.findUnique({ where: { id: parseInt(id) } });
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found." });
    }

    await prisma.users.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user globally:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: "Access denied. Only super admins can delete organizations." });
    }

    const orgId = parseInt(id, 10);
    if (isNaN(orgId)) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }

    const organizationToDelete = await prisma.organizations.findUnique({ where: { id: orgId } });
    if (!organizationToDelete) {
      return res.status(404).json({ error: "Organization not found." });
    }

    await prisma.organizations.delete({ where: { id: orgId } });
    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization globally:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: "Access denied. Only super admins can update users." });
    }

    const {
      name,
      email,
      phone,
      emergency_contact,
      blood_group,
      gender,
      city,
      current_address,
      permanent_address
    } = req.body;

    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const userToUpdate = await prisma.users.findUnique({ where: { id: userId } });
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found." });
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : userToUpdate.name,
        email: email !== undefined ? email : userToUpdate.email,
        phone: phone !== undefined ? phone : userToUpdate.phone,
        emergency_contact: emergency_contact !== undefined ? emergency_contact : userToUpdate.emergency_contact,
        blood_group: blood_group !== undefined ? blood_group : userToUpdate.blood_group,
        gender: gender !== undefined ? gender : userToUpdate.gender,
        city: city !== undefined ? city : userToUpdate.city,
        current_address: current_address !== undefined ? current_address : userToUpdate.current_address,
        permanent_address: permanent_address !== undefined ? permanent_address : userToUpdate.permanent_address,
      }
    });

    const { password_hash, ...rest } = updatedUser;

    res.status(200).json({ message: "User updated successfully", user: rest });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
