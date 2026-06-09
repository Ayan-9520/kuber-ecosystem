import { createConnection } from 'mysql2/promise';

const conn = await createConnection({ host: '127.0.0.1', user: 'root', password: '' });
try {
  await conn.query("CREATE USER IF NOT EXISTS 'kuberone'@'localhost' IDENTIFIED BY 'kuberone'");
  await conn.query("CREATE USER IF NOT EXISTS 'kuberone'@'127.0.0.1' IDENTIFIED BY 'kuberone'");
  await conn.query("GRANT ALL PRIVILEGES ON kuberone_dev.* TO 'kuberone'@'localhost'");
  await conn.query("GRANT ALL PRIVILEGES ON kuberone_dev.* TO 'kuberone'@'127.0.0.1'");
  await conn.query('FLUSH PRIVILEGES');
  console.log('user ok');
} catch (e) {
  console.error('user fail', e.message);
}
await conn.end();
