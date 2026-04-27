const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  password: '221804Nn',
  host: 'localhost',
  port: 5432,
  database: 'my_cinema_db'
});

async function run() {
  await client.connect();
  let res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'halls'`);
  console.log('HALLS:', res.rows);
  res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'seats'`);
  console.log('SEATS:', res.rows);
  await client.end();
}
run();
