const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@gmail.com';
  const password = 'Veagle@123';
  const password_hash = await bcrypt.hash(password, 10);

  const existing = await prisma.users.findUnique({ where: { email } });
  
  if (existing) {
    console.log('Super admin already exists. Updating password...');
    await prisma.users.update({
      where: { email },
      data: { password_hash, role: 'super_admin' }
    });
    console.log('Successfully updated super_admin password.');
  } else {
    await prisma.users.create({
      data: {
        name: 'Global Super Admin',
        email: email,
        password_hash: password_hash,
        role: 'super_admin',
      },
    });
    console.log('Successfully created super_admin account:');
  }

  console.log('Email:', email);
  console.log('Password:', password);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
