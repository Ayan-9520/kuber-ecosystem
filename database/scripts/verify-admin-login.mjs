import bcrypt from 'bcryptjs';
import { createConnection } from 'mysql2/promise';

const conn = await createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'kuberone_dev',
});

const [rows] = await conn.query(
  'SELECT password_hash FROM users WHERE email = ? LIMIT 1',
  ['admin@kuberone.com'],
);

const hash = rows[0]?.password_hash;
const ok = hash ? await bcrypt.compare('Admin@123', hash) : false;
console.log('password valid:', ok);
await conn.end();
