import { execSync } from 'node:child_process';
import { createConnection } from 'mysql2/promise';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const dbUrl = process.env.DATABASE_URL ?? 'mysql://root@127.0.0.1:3306/kuberone_dev';

async function ensureDatabase() {
  const conn = await createConnection({ host: '127.0.0.1', user: 'root', password: '' });
  await conn.query(
    'CREATE DATABASE IF NOT EXISTS kuberone_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
  );
  await conn.end();
  console.log('✅ Database kuberone_dev ready');
}

function run(cmd, cwd = root) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, DATABASE_URL: dbUrl } });
}

async function main() {
  await ensureDatabase();
  run('pnpm db:generate');
  run('pnpm --filter @kuberone/database migrate:deploy');
  run('pnpm db:seed');
  console.log('\n✅ Local DB setup complete');
  console.log('   Login: admin@kuberone.com / Admin@123');
}

main().catch((err) => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
