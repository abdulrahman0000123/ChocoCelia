// إصلاح باسورد الأدمن
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_i6F5TXVnkumK@ep-super-credit-a4yy917g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

async function main() {
  const newPassword = 'admin123';
  
  console.log('🔐 Generating new password hash for:', newPassword);
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  console.log('New hash:', hashedPassword);
  
  // Update admin user
  const updated = await prisma.user.update({
    where: { username: 'admin' },
    data: { password: hashedPassword }
  });
  
  console.log('\n✅ Admin password updated!');
  console.log('  Username:', updated.username);
  console.log('  New password:', newPassword);
  
  // Verify
  const isValid = await bcrypt.compare(newPassword, hashedPassword);
  console.log('  Verification:', isValid ? '✅ VALID' : '❌ INVALID');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
