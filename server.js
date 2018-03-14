//Imports and Requirements
var restify = require('restify');
var Sequelize = require('sequelize');
var uuidv4 = require('uuid/v4');

//Database config
var env = "dev";
var config = require('./config.json')[env];
var password = config.password ? config.password : null;

//initiate database connection
var sequelize = new Sequelize(
    config.database,
    config.user,
    config.password,
    {
        dialect: config.dialect,
        port: config.port,
        host: config.host,
        logging: console.log,
        define: {
            timestamps: false
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
    }
);

//Authenticate Database connection
sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

//Models
const Quizzes = sequelize.define('quizzes',{
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: Sequelize.STRING(512)},
  questions: {type: Sequelize.STRING},
  access_token: {type: Sequelize.STRING(128)}
});

//Global Constants
var WIP = 'Endpoint not implemented yet';

// Create Server
var server = restify.createServer();

//Initualize Body Parser
server.use(restify.plugins.bodyParser({ mapParams: true}));

// Start Server
server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

// Quiz End Points
// Create New Quiz
server.post('/quiz', function(req, res, next) {
  Quizzes.create({
    name: req.params.name,
    questions: JSON.stringify(req.params.questions),
    access_token: uuidv4()
  }).then(quiz => {
    res.send(200, JSON.stringify(quiz));
  });
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
