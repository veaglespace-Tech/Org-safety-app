import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organizations.create({
    data: {
      name: 'Dummy Organization',
      email: 'dummy@example.com',
      phone: '+1234567890',
      address: '123 Dummy Street',
      city: 'Dummy City',
      state: 'Dummy State',
      country: 'Dummy Country',
    },
  });
  console.log('Created organization:', org);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
