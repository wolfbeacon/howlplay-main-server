//Imports and Requirements
var restify = require('restify');
var Sequelize = require('sequelize');

//Database config
var env = "dev";
var config = require('./config.json')[env];
var password = config.password ? config.password : null;

//initiate database connection
var sequelize = new Sequelize(
    dialect: config.dialect,
    database: config.database,
    uase: config.user,
    password: config.password,
    {
        port: config.port,
        host: config.server,
        logging: console.log,
        define: {
            timestamps: false
        }
    }
);

//Global Constants
var WIP = "Endpoint not implemented yet";

// Start Server
var server = restify.createServer();

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

// Quiz End Points
// Creat New Quiz
server.post('/quiz', function(req, res, next) {
  res.send(200, WIP);
  next();
});
// Get Quiz
server.get('/quiz/:id', function(req, res, next) {
  res.send(200, WIP);
  next();
});
// Update Quiz
server.patch('/quiz/:id', function(req, res, next) {
  res.send(200, WIP);
  next();
});
// Upload Answers
server.post('/quiz/answers/', function(req, res, next) {
  res.send(200, WIP);
  next();
});
