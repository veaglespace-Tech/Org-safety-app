const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Create an organization
    const org = await prisma.organizations.create({
      data: {
        name: 'Fake Org',
        email: 'org@fake.com',
        phone: '1234567890',
        address: '123 Fake St',
        city: 'Fake City',
        state: 'FS',
        country: 'FC',
      },
    });

    // Create Admin
    const admin = await prisma.users.create({
      data: {
        name: 'Fake Admin',
        email: 'admin@fake.com',
        password_hash: hashedPassword,
        role: 'admin',
        phone: '1234567891',
        organization_id: org.id,
      },
    });

    // Create Member
    const member = await prisma.users.create({
      data: {
        name: 'Fake Member',
        email: 'member@fake.com',
        password_hash: hashedPassword,
        role: 'member',
        phone: '1234567892',
        organization_id: org.id,
      },
    });

    console.log('Seed data created successfully!');
    console.log('Admin Login: admin@fake.com / 123456');
    console.log('Member Login: member@fake.com / 123456');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
