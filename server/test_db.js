const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.users.findMany();
  console.log(users.map(u => u.role));
}
run();
