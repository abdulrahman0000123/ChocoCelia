import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deploymentDatabaseUrl } from './deployment-db-url.mjs';

nextEnv.loadEnvConfig(process.cwd());
async function main() {
  const source = deploymentDatabaseUrl();
  const schema = `finance_test_${randomUUID().replaceAll('-','')}`;
  const admin = new PrismaClient({datasources:{db:{url:source}}});
  const isolated = new URL(source);isolated.searchParams.set('schema',schema);isolated.searchParams.set('options',`-c search_path=${schema}`);
  const sqlFile = join(tmpdir(),`${schema}.sql`);
  try {
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const env = {...process.env,DATABASE_URL:isolated.toString(),FINANCE_TEST_DATABASE_URL:isolated.toString()};
    const setup = spawnSync(process.execPath,['node_modules/prisma/build/index.js','db','push','--skip-generate'],{env,encoding:'utf8'});
    if(setup.status !== 0) throw new Error('Could not provision isolated finance schema.');
    // Reproduce upgrading a storefront with no financial tables or request keys.
    await admin.$executeRawUnsafe(`DROP TABLE "${schema}"."FinanceEvent"`);
    await admin.$executeRawUnsafe(`DROP TABLE "${schema}"."OrderFinance"`);
    await admin.$executeRawUnsafe(`DROP TABLE "${schema}"."ProductCost"`);
    await admin.$executeRawUnsafe(`DROP TABLE "${schema}"."FinanceSettings"`);
    await admin.$executeRawUnsafe(`ALTER TABLE "${schema}"."Order" DROP COLUMN "requestKey", DROP COLUMN "requestHash"`);
    for(let pass=0;pass<2;pass++) {
      const sql = readFileSync('scripts/ensure-finance.sql','utf8').replace('SET LOCAL search_path TO public;',`SET LOCAL search_path TO "${schema}";`);
      writeFileSync(sqlFile,'SET search_path TO missing_finance_schema;\n'+sql);
      const migrate = spawnSync(process.execPath,['node_modules/prisma/build/index.js','db','execute','--file',sqlFile,'--schema','prisma/schema.prisma'],{env,encoding:'utf8'});
      if(migrate.status !== 0) throw new Error('Finance migration failed in isolated schema.');
    }
    console.log('Finance upgrade passed twice with an empty default search path.');
    const test = spawnSync(process.execPath,['node_modules/jest/bin/jest.js','--runInBand','__tests__/api/finance.integration.test.ts'],{env,stdio:'inherit'});
    if(test.status !== 0) process.exitCode=1;
  } finally {
    try {unlinkSync(sqlFile);} catch(e) {if(e.code !== 'ENOENT') throw e;}
    await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);await admin.$disconnect();
    console.log('Disposable finance schema removed.');
  }
}
main().catch(()=>{console.error('Isolated finance database check failed.');process.exitCode=1;});
