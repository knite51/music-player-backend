require('dotenv').config();
const Op = require('sequelize');

const operatorsAliases = [Op.or, Op.regexp];

module.exports = {
  development: {
    url: process.env.DEV_DATABASE_URL,
    operatorsAliases,
    dialect: 'mysql'
  },
  test: {
    url: process.env.TEST_DATABASE_URL,
    operatorsAliases,
    dialect: 'mysql'
  },
  travis: {
    url: process.env.TRAVIS_DATABASE_URL,
    operatorsAliases,
    dialect: 'mysql'
    // logging: false,
  },
  production: {
    url: process.env.PROD_DATABASE_URL,
    operatorsAliases,
    dialect: 'mysql'
  }
};
