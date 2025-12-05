const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword },
    create: { username: 'admin', password: hashedPassword }
  });
  
  console.log('Admin user updated with hashed password:', user);
  await prisma.$disconnect();
}

main();
