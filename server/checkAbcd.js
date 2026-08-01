const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.users.findFirst({ where: { email: 'abcd@gmail.com' } });
  console.log(user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
