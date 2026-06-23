import mysql from 'mysql2/promise';

const HOST = '127.0.0.1';
const USER = 'root';
const PASS = process.env.MYSQL_PASSWORD ?? '';

/** Tables that only hold dev/ops-hub filler — safe to truncate in kuberone_dev. */
const OPS_TABLE_PATTERNS = [
  'uat_%',
  'devops_%',
  'hypercare_%',
  'go_live_%',
  'launch_%',
  'staging_%',
  'production_%',
  'play_store_%',
  'app_store_%',
  'backend_deployment_%',
  'disaster_%',
  'dr_%',
  'infrastructure_%',
  'mobile_release_%',
  'mobile_build_%',
  'monitoring_%',
  'observability_%',
  'backup_%',
  'pipeline_%',
  'deployment_%',
  'release_%',
  'rollback_%',
  'environment_%',
  'war_room_%',
  'recovery_%',
  'runbook_%',
];

/** Unrelated local databases — not part of KuberOne. */
const DROP_DATABASES = ['motorcart'];

async function main() {
  const conn = await mysql.createConnection({ host: HOST, user: USER, password: PASS, multipleStatements: true });

  console.log('=== CLEAN KUBERONE MYSQL ===\n');

  // 1. Truncate ops filler in kuberone_dev
  const [tables] = await conn.query(
    `SELECT table_name AS name FROM information_schema.tables WHERE table_schema = 'kuberone_dev' ORDER BY table_name`,
  );

  const opsTables = tables.filter((t) =>
    OPS_TABLE_PATTERNS.some((p) => {
      const re = new RegExp('^' + p.replace(/%/g, '.*') + '$');
      return re.test(t.name);
    }),
  );

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  let truncated = 0;
  for (const { name } of opsTables) {
    const [rows] = await conn.query(`SELECT COUNT(*) AS cnt FROM \`kuberone_dev\`.\`${name}\``);
    if (rows[0].cnt > 0) {
      await conn.query(`TRUNCATE TABLE \`kuberone_dev\`.\`${name}\``);
      console.log(`  truncated ${name} (${rows[0].cnt} rows)`);
      truncated += 1;
    }
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log(`\n✓ Ops filler: ${opsTables.length} tables scanned, ${truncated} truncated\n`);

  // 2. Drop unrelated databases
  for (const db of DROP_DATABASES) {
    const [exists] = await conn.query(`SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`, [db]);
    if (exists.length > 0) {
      await conn.query(`DROP DATABASE \`${db}\``);
      console.log(`✓ Dropped unrelated database: ${db}`);
    }
  }

  // 3. Drop prisma shadow DB if present
  const [shadows] = await conn.query(
    `SELECT SCHEMA_NAME AS name FROM information_schema.SCHEMATA WHERE SCHEMA_NAME LIKE 'prisma_migrate_shadow_db_%'`,
  );
  for (const { name } of shadows) {
    await conn.query(`DROP DATABASE \`${name}\``);
    console.log(`✓ Dropped prisma shadow: ${name}`);
  }

  // 4. Summary
  const [dbs] = await conn.query(
    `SELECT SCHEMA_NAME AS name FROM information_schema.SCHEMATA 
     WHERE SCHEMA_NAME NOT IN ('information_schema','mysql','performance_schema','phpmyadmin','sys')
     ORDER BY SCHEMA_NAME`,
  );
  console.log('\n=== REMAINING DATABASES ===');
  for (const { name } of dbs) {
    const [cnt] = await conn.query(
      `SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = ?`,
      [name],
    );
    console.log(`  ${name} (${cnt[0].c} tables)`);
  }

  await conn.end();
  console.log('\nDone. phpMyAdmin refresh karo — sirf kuberone_dev + kuberone_integration_test dikhenge.');
}

main().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});
