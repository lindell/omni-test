const mysql = require('mysql');
const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const app = express();

const appConfigRouter = require('./model/appConfigRouter.js');

var connection = mysql.createConnection({
  host     : process.env.DOCKER_DB_HOST || '127.0.0.1',
  user     : config.mysql.user,
  password : config.mysql.password,
  database : config.mysql.database,
});

app.use(bodyParser.json());

app.listen(config.node.port, function () {
  console.log(`Application configuration service listening on port ${config.node.port}`);

  app.use('/config', appConfigRouter(connection));
});
