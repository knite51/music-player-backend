require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DEV_DATABASE_URL,
    dialect: 'mysql',
    operatorsAliases: false
  },
  test: {
    url: process.env.TEST_DATABASE_URL,
    dialect: 'mysql',
    operatorsAliases: false
  },
  travis: {
    url: process.env.TRAVIS_DATABASE_URL,
    dialect: 'mysql',
    logging: false,
    operatorsAliases: false
  },
  production: {
    url: process.env.PROD_DATABASE_URL,
    dialect: 'mysql',
    operatorsAliases: false
  }
};
