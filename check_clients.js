require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ user: process.env.DB_USER, password: process.env.DB_PASSWORD, host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME });
async function run() {
  await client.connect();
  let res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clients'`);
  console.log('CLIENTS:', res.rows);
  await client.end();
}
run();
