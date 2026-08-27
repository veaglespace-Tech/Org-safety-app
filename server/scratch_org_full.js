const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const result = await prisma.$transaction(async (tx) => {
    const newOrg = await tx.organizations.create({
      data: {
        name: 'Veagle Dummy Org',
        email: 'org@veagle.com',
        phone: '+91 98765 00000',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        address: 'Veagle Tech Park'
      }
    });

    const newUser = await tx.users.create({
      data: {
        organization_id: newOrg.id,
        name: 'Admin Dummy',
        email: 'admin@veagle.com',
        password_hash: passwordHash,
        role: 'admin',
        phone: '+91 98765 00001',
      }
    });

    return { newOrg, newUser };
  });

  console.log('Created Organization:', result.newOrg);
  console.log('Created Admin User:', { ...result.newUser, password: 'password123' });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
