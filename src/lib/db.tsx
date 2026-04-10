import mysql from 'mysql2/promise';

console.log('DB_USER:', process.env.DB_USER); // ✅ Add this here for debugging

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
