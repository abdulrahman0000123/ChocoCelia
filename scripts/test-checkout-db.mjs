// Run checkout against a disposable schema, never against existing orders or coupons.
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
nextEnv.loadEnvConfig(process.cwd());

async function main() {
  const source = process.env.DATABASE_URL;
  if (!source) throw new Error('DATABASE_URL is required for the isolated checkout check.');
  const schema = `checkout_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new PrismaClient();
  const isolated = new URL(source);
  isolated.searchParams.set('schema', schema);
  try {
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const env = { ...process.env, DATABASE_URL: isolated.toString(), CHECKOUT_TEST_DATABASE_URL: isolated.toString() };
    const setup = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], { env, encoding: 'utf8' });
    if (setup.status !== 0) throw new Error('Could not provision the disposable test schema.');
    const tests = spawnSync(process.execPath, ['node_modules/jest/bin/jest.js', '--runInBand', '__tests__/api/checkout.integration.test.ts'], { env, stdio: 'inherit' });
    if (tests.status !== 0) process.exitCode = 1;
  } finally {
    await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.$disconnect();
    console.log('Disposable checkout schema removed.');
  }
}
main().catch(() => { console.error('Isolated checkout database check failed.'); process.exitCode = 1; });
