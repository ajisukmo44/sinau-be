// config/pg.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('sinau_pos', 'neondb_owner', 'npg_CeR3Th8GPoMd', {
  host: 'ep-yellow-resonance-a1ljefyc-pooler.ap-southeast-1.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, 
    },
  },
  logging: true, 
});

module.exports = sequelize;