'use strict';

require('dotenv').config();

module.exports = {
  development: {
    username : process.env.DB_USER || 'root',
    password : process.env.DB_PASS || null,
    database : process.env.DB_NAME || 'maisa_primeris',
    host     : process.env.DB_HOST || '127.0.0.1',
    port     : parseInt(process.env.DB_PORT) || 3306,
    dialect  : 'mysql',
    define: {
      underscored: true,
      timestamps : true,
    },
  },
  test: {
    username : process.env.DB_USER || 'root',
    password : process.env.DB_PASS || null,
    database : process.env.DB_NAME + '_test' || 'maisa_primeris_test',
    host     : process.env.DB_HOST || '127.0.0.1',
    port     : parseInt(process.env.DB_PORT) || 3306,
    dialect  : 'mysql',
    logging  : false,
  },
  production: {
    username : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    host     : process.env.DB_HOST,
    port     : parseInt(process.env.DB_PORT) || 3306,
    dialect  : 'mysql',
    logging  : false,
    define: {
      underscored: true,
      timestamps : true,
    },
  },
};
