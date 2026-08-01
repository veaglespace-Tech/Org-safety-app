const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const org = await prisma.organizations.findFirst();
    if (!org) {
      console.log("No organization found");
      return;
    }
    const admin = await prisma.users.findFirst({ where: { role: 'admin' } });
    if (!admin) {
      console.log("No admin found");
      return;
    }
    console.log("Admin ID:", admin.id);
    
    const userToDelete = await prisma.users.findFirst({ where: { role: 'member' } });
    if (!userToDelete) {
      console.log("No member found to delete");
      return;
    }
    console.log("User to delete ID:", userToDelete.id);
    
    // simulate delete API
    const http = require('http');
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: admin.id, role: admin.role }, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/org/users/${userToDelete.id}`,
      method: 'DELETE',
      headers: {
        'Cookie': `token=${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${data}`);
      });
    });
    req.end();
  } catch (e) {
    console.error(e);
  }
}
test();
