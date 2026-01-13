// التحقق من بيانات الأدمن في Neon
const { PrismaClient } = require('@prisma/client');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_i6F5TXVnkumK@ep-super-credit-a4yy917g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

async function main() {
  console.log('🔍 Checking admin user in Neon database...\n');
  
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log('❌ No users found in database!');
    return;
  }
  
  console.log(`Found ${users.length} user(s):\n`);
  
  users.forEach((user, i) => {
    console.log(`User ${i + 1}:`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Password hash: ${user.password.substring(0, 30)}...`);
    console.log(`  Password length: ${user.password.length} chars`);
    console.log(`  Is bcrypt hash: ${user.password.startsWith('$2a$') || user.password.startsWith('$2b$')}`);
    console.log('');
  });

  // Test bcrypt verification
  const bcrypt = require('bcryptjs');
  const testPassword = 'admin123';
  
  for (const user of users) {
    console.log(`\n🔐 Testing password "${testPassword}" for user "${user.username}":`);
    
    try {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`  Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
