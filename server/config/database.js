const sql = require('mssql');

const poolPromise = new sql.ConnectionPool({
  user: 'sa',
  password: 'H3nryG4132002..',
  server: 'localhost',
  database: 'EcoCommunity_DB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
}).connect();

module.exports = poolPromise;
