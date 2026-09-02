const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  console.log('Creating Organization...');
  const org = await prisma.organizations.create({
    data: {
      name: 'Veagle Space Security',
      email: 'org@veaglespace.com',
      phone: '1234567890',
      address: 'Pune, Maharashtra',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
    }
  });

  console.log('Creating Super Admin...');
  const superAdmin = await prisma.users.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@veaglespace.com',
      password_hash: passwordHash,
      role: 'super_admin',
      phone: '9999999999',
    }
  });

  console.log('Creating Admin...');
  const admin = await prisma.users.create({
    data: {
      organization_id: org.id,
      name: 'Admin User',
      email: 'admin@veaglespace.com',
      password_hash: passwordHash,
      role: 'admin',
      phone: '8888888888',
    }
  });

  console.log('Creating Member...');
  const member = await prisma.users.create({
    data: {
      organization_id: org.id,
      name: 'Member User',
      email: 'member@veaglespace.com',
      password_hash: passwordHash,
      role: 'member',
      phone: '7777777777',
    }
  });

  console.log('Entries created successfully:');
  console.log('- Super Admin:', superAdmin.email, '(Role: super_admin)');
  console.log('- Admin:', admin.email, '(Role: admin)');
  console.log('- Member:', member.email, '(Role: member)');
  console.log('Password for all users is: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
