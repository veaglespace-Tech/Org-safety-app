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
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            created_at: true,
          }
        }
      }
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
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
