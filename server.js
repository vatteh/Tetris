const Promise = require('bluebird');
const http = require('http');
const chalk = require('chalk');
const path = require('path');
const express = require('express');

const app = express();

app.use(express.static(path.join(__dirname, './dist/')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/index.html'));
});

const server = http.createServer();

const createApplication = () => {
  server.on('request', app);
};

const startServer = () => {
  const PORT = process.env.PORT || 1337;

  server.listen(PORT, () => {
    console.log(chalk.blue('Server started on port', chalk.magenta(PORT)));
  });
};

Promise.try(createApplication)
  .then(startServer)
  .catch((err) => {
    console.error(chalk.red(err.stack));
    process.kill(1);
  });
