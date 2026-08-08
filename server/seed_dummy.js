const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Inserting new dummy entry into all tables...');

  // 1. Create Organization
  const org = await prisma.organizations.create({
    data: {
      name: 'Dummy Tech Pvt Ltd',
      email: 'info@dummytech.com',
      phone: '9876543210',
      address: '123 Dummy Street',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India'
    }
  });
  console.log('Created Organization:', org.name, '(ID:', org.id, ')');

  // 2. Create User (Admin for this org)
  const password_hash = await bcrypt.hash('Password@123', 10);
  const user = await prisma.users.create({
    data: {
      organization_id: org.id,
      name: 'Dummy Admin',
      email: 'admin@dummytech.com',
      password_hash: password_hash,
      role: 'admin',
      phone: '9988776655',
      city: 'Pune',
      gender: 'Male',
      blood_group: 'O+'
    }
  });
  console.log('Created User:', user.name, '(Email:', user.email, ')');

  // 3. Create Invitation
  const invitation = await prisma.invitations.create({
    data: {
      organization_id: org.id,
      email: 'newmember@dummytech.com',
      token: 'dummy-token-' + Date.now(),
      status: 'pending'
    }
  });
  console.log('Created Invitation for:', invitation.email);

  console.log('Finished inserting dummy entries successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
