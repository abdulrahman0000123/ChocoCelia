// Run checkout against a disposable schema, never against existing orders or coupons.
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { deploymentDatabaseUrl } from './deployment-db-url.mjs';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
nextEnv.loadEnvConfig(process.cwd());

async function main() {
  const source = deploymentDatabaseUrl();
  const schema = `checkout_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new PrismaClient({ datasources: { db: { url: source } } });
  const isolated = new URL(source);
  isolated.searchParams.set('schema', schema);
  // Prisma qualifies ORM queries; raw queries also need the isolated startup search path.
  isolated.searchParams.set('options', `-c search_path=${schema}`);
  const sqlFile = join(tmpdir(), `${schema}.sql`);
  try {
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const env = { ...process.env, DATABASE_URL: isolated.toString(), CHECKOUT_TEST_DATABASE_URL: isolated.toString() };
    const setup = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], { env, encoding: 'utf8' });
    if (setup.status !== 0) throw new Error('Could not provision the disposable test schema.');
    // Reproduce the deployment failure with a nonexistent default search path.
    await admin.$executeRawUnsafe(`ALTER TABLE "${schema}"."Order" DROP COLUMN "requestedDeliveryDate"`);
    for (let pass = 0; pass < 2; pass++) {
      for (const file of ['ensure-login-attempts.sql', 'ensure-seo.sql', 'ensure-checkout.sql']) {
        const sql = readFileSync(`scripts/${file}`, 'utf8').replace('SET LOCAL search_path TO public;', `SET LOCAL search_path TO "${schema}";`);
        writeFileSync(sqlFile, 'SET search_path TO missing_checkout_schema;\n' + sql);
        const provision = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'execute', '--file', sqlFile, '--schema', 'prisma/schema.prisma'], { env, encoding: 'utf8' });
        if (provision.status !== 0) throw new Error('Provisioning failed with an empty search path.');
      }
    }
    console.log('All provisioning scripts passed twice with a nonexistent default search path.');
    const tests = spawnSync(process.execPath, ['node_modules/jest/bin/jest.js', '--runInBand', '__tests__/api/checkout.integration.test.ts'], { env, stdio: 'inherit' });
    if (tests.status !== 0) process.exitCode = 1;
  } finally {
    try { unlinkSync(sqlFile); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.$disconnect();
    console.log('Disposable checkout schema removed.');
  }
}
main().catch(() => { console.error('Isolated checkout database check failed.'); process.exitCode = 1; });
