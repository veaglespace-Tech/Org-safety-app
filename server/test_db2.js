const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.users.findMany({ select: { id: true, name: true, email: true, role: true } });
  console.log(users);
}
run();
