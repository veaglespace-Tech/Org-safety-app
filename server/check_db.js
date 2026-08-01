const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const user = await prisma.users.findUnique({ where: { id: 1 }});
  console.log("Name:", user.name);
  console.log("Email:", user.email);
  console.log("Phone:", user.phone);
  console.log("EC:", user.emergency_contact);
}
run();
