var Redshift = require("aws-redshift");
const logger = require('../../config/logger');

require("dotenv/config");
 

const REDSHIFT_USER = process.env.REDSHIFT_USER
const REDSHIFT_DB = process.env.REDSHIFT_DB
const REDSHIFT_PWD= process.env.REDSHIFT_PWD
const REDSHIFT_PORT = process.env.REDSHIFT_PORT
const REDSHIFT_HOST = process.env.REDSHIFT_HOST

var client = {
  user: REDSHIFT_USER,
  database: REDSHIFT_DB,
  password: REDSHIFT_PWD,
  port: REDSHIFT_PORT,
  host: REDSHIFT_HOST,
};

// The values passed in to the options object will be the difference between a connection pool and raw connection
var redshiftClient = new Redshift(client, { rawConnection: true });

try {
  redshiftClient.connect((err) => {
    if (err) logger.error(err);
  });
} catch (error) {
  if (error) logger.error(error.message);
}

module.exports = redshiftClient;
