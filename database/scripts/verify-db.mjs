import { createConnection } from 'mysql2/promise';

const conn = await createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'kuberone_dev',
});

const [tables] = await conn.query("SHOW TABLES LIKE 'users'");
const [users] = await conn.query('SELECT email, user_type, status FROM users LIMIT 5');
console.log('users table:', tables.length > 0);
console.log('users:', users);
await conn.end();
