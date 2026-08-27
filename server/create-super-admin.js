const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'riteshpote0603@gmail.com';
  const password = 'Veagle@123';
  const role = 'super_admin';
  const name = 'Super Admin';

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const existingUser = await prisma.users.findUnique({ where: { email } });

  if (existingUser) {
    const user = await prisma.users.update({
      where: { email },
      data: { password_hash: passwordHash, role, name }
    });
    console.log('Updated existing user to super_admin:', user.email);
  } else {
    const user = await prisma.users.create({
      data: {
        email,
        password_hash: passwordHash,
        role,
        name
      }
    });
    console.log('Created super_admin:', user.email);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
