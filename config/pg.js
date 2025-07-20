// setup postgres connection
const { Pool } = require('pg');

const pool = new Pool({
  user: 'neondb_owner',
  host: 'ep-yellow-resonance-a1ljefyc-pooler.ap-southeast-1.aws.neon.tech',
  database: 'sinau_pos',
  password: 'npg_CeR3Th8GPoMd',
  port: 5432,
  ssl: true
});

module.exports = pool;
