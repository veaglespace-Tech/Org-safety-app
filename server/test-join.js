const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const newUser = await prisma.users.create({
    data: {
      organization_id: 1,
      name: "Test Member",
      email: "testmember123@example.com",
      password_hash: "dummy",
      role: 'member',
    },
    include: { organizations: true }
  });
  console.log(JSON.stringify(newUser, null, 2));
}
test().catch(console.error).finally(() => prisma.$disconnect());
