import mysql from 'mysql2/promise';

const HOST = '127.0.0.1';
const USER = 'root';
const PASS = process.env.MYSQL_PASSWORD ?? '';

async function main() {
  const conn = await mysql.createConnection({ host: HOST, user: USER, password: PASS });

  const [dbs] = await conn.query(
    `SELECT SCHEMA_NAME AS name FROM information_schema.SCHEMATA 
     WHERE SCHEMA_NAME LIKE 'kuberone%' OR SCHEMA_NAME = 'motorcart'
     ORDER BY SCHEMA_NAME`,
  );

  console.log('=== KUBERONE DATABASES ON MYSQL ===\n');

  for (const row of dbs) {
    const db = row.name;
    const [tables] = await conn.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ?`,
      [db],
    );
    const [key] = await conn.query(
      `SELECT table_name AS name FROM information_schema.tables 
       WHERE table_schema = ? AND table_name IN ('leads','applications','customers','partners','products')
       ORDER BY table_name`,
      [db],
    );
    const [leadCount] = await conn.query(`SELECT COUNT(*) AS cnt FROM \`${db}\`.leads`).catch(() => [[{ cnt: 'N/A' }]]);

    console.log(`📦 ${db}`);
    console.log(`   total tables: ${tables[0].cnt}`);
    console.log(`   core tables: ${key.map((t) => t.name).join(', ') || 'NONE — schema missing!'}`);
    console.log(`   leads rows: ${leadCount[0]?.cnt ?? 'table missing'}`);
    console.log('');
  }

  // Show where "leads" sits alphabetically in kuberone_dev
  const [around] = await conn.query(
    `SELECT table_name AS name FROM information_schema.tables 
     WHERE table_schema = 'kuberone_dev' AND table_name BETWEEN 'l' AND 'm'
     ORDER BY table_name LIMIT 30`,
  );
  console.log('=== kuberone_dev tables starting with L–M (sample) ===');
  for (const t of around) console.log(`   ${t.name}`);

  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
