import nextEnv from '@next/env';
import { spawnSync } from 'node:child_process';
import { deploymentDatabaseUrl } from './deployment-db-url.mjs';

nextEnv.loadEnvConfig(process.cwd());
const env = { ...process.env, DATABASE_URL: deploymentDatabaseUrl() };
for (const file of ['ensure-login-attempts.sql', 'ensure-seo.sql', 'ensure-checkout.sql']) {
  const result = spawnSync(process.execPath, [
    'node_modules/prisma/build/index.js', 'db', 'execute', '--file', `scripts/${file}`, '--schema', 'prisma/schema.prisma',
  ], { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
