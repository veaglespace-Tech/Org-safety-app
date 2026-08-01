const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function query() {
  const users = await prisma.users.findMany({
    select: { id: true, name: true, email: true, role: true, organization_id: true }
  });
  console.log("Users in DB:");
  console.log(JSON.stringify(users, null, 2));
}
query().catch(console.error).finally(() => prisma.$disconnect());
