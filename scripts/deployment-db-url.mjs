// DDL and isolated schema tests need a direct connection rather than transaction pooling.
export function deploymentDatabaseUrl(env = process.env) {
  const value = env.DIRECT_URL || env.DATABASE_URL;
  if (!value) throw new Error('A database connection is required.');
  const url = new URL(value);
  if (url.hostname.endsWith('.neon.tech')) {
    url.hostname = url.hostname.replace('-pooler.', '.');
    url.searchParams.delete('pgbouncer');
  }
  return url.toString();
}
